---
title: "Go 동시성: 고루틴, 채널, select, context, sync"
concept: "Go Concurrency"
summary: "Go의 동시성 도구를 정리한다. 고루틴이 OS 스레드보다 가벼운 이유와 G·M·P 스케줄러의 시스템 콜 처리·스피닝, 버퍼 없는·버퍼 있는 채널의 동작과 닫기·nil 채널 규칙, select의 무작위 선택과 타임아웃·논블로킹 패턴, context로 취소·마감 시간을 전파하는 법, sync 패키지의 Mutex·RWMutex·WaitGroup·Once·Pool·Map과 atomic, 레이스 디텍터."
tags: ["go", "concurrency", "backend"]
source: other
date: "2026-10-30"
sources: ["https://tech.ssut.me/goroutine-vs-threads/", "https://hueypark.gitlab.io/post/2018-10-13-go-work-stealing-scheduler/", "https://go.dev/ref/spec", "https://go.dev/ref/mem", "https://pkg.go.dev/context", "https://pkg.go.dev/sync", "https://go.dev/doc/go1.25", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/go.md"]
---

> 「[고루틴 vs 쓰레드](https://tech.ssut.me/goroutine-vs-threads/)」, 「[Go 작업 훔치기 스케쥴러](https://hueypark.gitlab.io/post/2018-10-13-go-work-stealing-scheduler/)」와 fru1tworld/cs-basic 모의 면접 질문 목록의 Go 질문을 바탕으로, Go 언어 명세·메모리 모델과 표준 라이브러리 문서로 확인해 재구성한 노트다.

Go 언어 전반(타입, 에러, 도구, GC)은 [[go-language|Go 언어]]에, CSP·액터와 런타임별 스케줄링 비교는 [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]]에 있다. Go의 동시성 철학은 한 줄로 **「메모리를 공유해서 통신하지 말고, 통신해서 메모리를 공유하라」** 다.

## 고루틴과 스케줄러

**고루틴은 Go 런타임이 관리하는 사용자 수준 실행 단위다.** `go f(x)`로 시작하고, 런타임이 수많은 고루틴을 적은 수의 OS 스레드 위에 다중화한다(M:N).

| 비교 | OS 스레드 | 고루틴 |
| --- | --- | --- |
| 스택 | 고정 크기(보통 수 MB 예약)와 가드 페이지 | **수 KB로 시작해 필요할 때 늘어나고 줄어든다** |
| 생성·소멸 | 커널 호출, 비싸다 | 런타임 안에서 끝난다. 수십만 개도 만든다 |
| 전환 | 커널이 레지스터 전체를 저장·복원 | 런타임이 적은 레지스터만 바꾼다 |
| 스케줄링 | OS | Go 런타임(G·M·P) |
| 식별자 | 스레드 ID가 있다 | ID가 공개되지 않는다. 고루틴 지역 저장소도 없다(대신 `context`로 값을 넘긴다) |

G(고루틴)·M(OS 스레드)·P(실행 문맥과 로컬 실행 큐) 구조, 로컬·전역 큐와 작업 훔치기, 10ms 강제 선점은 [[concurrency-models|동시성 모델]]의 「Go와 Tokio」에 있다. 그 밖의 동작은 다음과 같다.

- **P의 수는 `GOMAXPROCS`다.** 기본값은 사용 가능한 CPU 수이고, Go 1.25부터는 컨테이너의 cgroup CPU 제한도 반영한다.
- **시스템 콜 핸드오프**: 고루틴이 블로킹 시스템 콜에 들어가면 그 M은 P를 내려놓는다. 런타임은 P를 다른 M에 넘겨 나머지 고루틴을 계속 돌린다. 네트워크 I/O는 시스템 콜 대신 넷폴러(epoll·kqueue)가 처리해 M을 묶지 않는다.
- **스피닝 스레드**: 할 일을 찾는 M은 바로 잠들지 않고 잠깐 돌며(spinning) 큐를 살핀다. CPU를 조금 쓰는 대신 OS 스레드를 재우고 깨우는 비용을 줄인다. 동시에 스피닝하는 M은 `GOMAXPROCS`개를 넘지 않는다.
- **찾는 순서**: 로컬 큐 → 공정성을 위해 가끔 전역 큐 → 넷폴러 → 다른 P에서 절반 훔치기.
- **전환 지점**: 채널 송수신, 뮤텍스 대기, I/O, `time.Sleep`, `runtime.Gosched()`, 그리고 오래 도는 고루틴에 대한 비동기 선점.
- `main`이 끝나면 다른 고루틴이 남아 있어도 프로그램이 종료된다. 끝나지 않고 막혀 있는 고루틴은 **고루틴 누수**다. 시작할 때 종료 조건과 종료를 기다릴 방법을 먼저 정한다.

## 채널

**채널은 고루틴 사이에서 타입이 정해진 값을 주고받는 통로이자 동기화 장치다.** 내부는 원형 버퍼, 송신·수신 대기 고루틴 큐, 뮤텍스를 가진 런타임 구조체(`hchan`)다.

| 종류 | 생성 | 송신 `ch <- v` | 수신 `<-ch` |
| --- | --- | --- | --- |
| 버퍼 없는(unbuffered) | `make(chan T)` | 수신자가 받을 때까지 막힌다 | 송신자가 보낼 때까지 막힌다 |
| 버퍼 있는(buffered) | `make(chan T, n)` | 버퍼가 가득 찼을 때만 막힌다 | 버퍼가 비었을 때만 막힌다 |

버퍼 없는 채널은 송신과 수신이 **만나는 순간**(랑데부)에 값이 넘어가므로 「상대가 받았다」는 동기화를 보장한다. 버퍼 있는 채널은 생산자와 소비자 속도 차이를 흡수하고, 동시 실행 수를 제한하는 세마포어(`sem := make(chan struct{}, 10)`)로도 쓴다.

| 상태 | 송신 | 수신 | `close` |
| --- | --- | --- | --- |
| nil 채널(`var ch chan T`) | 영원히 막힌다 | 영원히 막힌다 | panic |
| 열린 채널 | 위 표대로 | 위 표대로 | 닫힌다 |
| 닫힌 채널 | **panic** | 남은 값을 다 받은 뒤 **제로값을 즉시** 돌려준다. `v, ok := <-ch`의 `ok`가 `false` | panic |

```go
results := make(chan int)
go func() {
    defer close(results)          // 보내는 쪽이 닫는다
    for _, x := range xs { results <- work(x) }
}()
for r := range results { fmt.Println(r) }   // 닫힐 때까지 받는다
```

- **닫는 것은 보내는 쪽의 책임**이다. 받는 쪽이 닫으면 아직 보내는 고루틴이 panic한다. 송신자가 여럿이면 `sync.WaitGroup`으로 모두 끝난 뒤 한 곳에서 닫는다.
- `close`는 「더 보낼 값이 없다」는 신호를 **모든** 수신자에게 한 번에 방송한다. 그래서 `done` 채널을 닫아 여러 고루틴을 멈추는 데 쓴다.
- 방향 타입(`chan<- T` 송신 전용, `<-chan T` 수신 전용)을 함수 매개변수에 써서 역할을 컴파일러로 강제한다.
- 공유 상태 하나를 보호하는 데는 채널보다 뮤텍스가 단순하다. 채널은 **소유권 이전, 작업 분배, 완료 신호**에 쓴다.

## select

**`select`는 여러 채널 연산 중 진행할 수 있는 것 하나를 골라 실행한다.** `switch`처럼 생겼지만 각 `case`가 채널 송수신이다.

- 준비된 `case`가 없으면 하나가 준비될 때까지 막힌다.
- **여러 개가 동시에 준비되면 무작위로 하나**를 고른다. 위에 쓴 `case`가 우선하지 않으므로 특정 채널이 굶지 않는다.
- `default`가 있으면 막히지 않고 바로 `default`를 실행한다(논블로킹 송수신).
- nil 채널의 `case`는 영원히 준비되지 않는다. 다 읽은 채널 변수를 `nil`로 바꿔 그 `case`를 끄는 관용구가 여기서 나온다.
- 빈 `select {}`는 영원히 막힌다.

```go
select {
case msg := <-in:
    handle(msg)
case out <- next:              // 송신도 case가 된다
    next = produce()
case <-ctx.Done():             // 취소
    return ctx.Err()
case <-time.After(2 * time.Second):   // 타임아웃
    return errTimeout
default:                       // 아무것도 준비 안 됐으면 바로 지나간다
}
```

런타임은 `select`에 들어갈 때 모든 채널을 정해진 순서로 잠그고 준비된 것을 찾는다. 없으면 현재 고루틴을 모든 채널의 대기 큐에 등록하고 잠들었다가, 하나가 깨우면 나머지 큐에서 자신을 지운다.

## context

**`context.Context`는 요청 범위의 취소 신호, 마감 시간, 요청 범위 값을 호출 체인과 고루틴 트리로 전파하는 표준 인터페이스다.** HTTP 요청이 취소되거나 시간이 지나면, 그 요청을 위해 시작한 DB 쿼리·외부 호출·하위 고루틴을 모두 멈추게 한다.

| 함수 | 만드는 것 |
| --- | --- |
| `context.Background()` | 최상위 빈 컨텍스트(`main`, 테스트, 서버 시작) |
| `WithCancel(parent)` | `cancel()`을 부르면 취소되는 자식 |
| `WithTimeout(parent, d)`, `WithDeadline(parent, t)` | 시간이 지나면 자동 취소되는 자식 |
| `WithValue(parent, key, val)` | 값을 얹은 자식 |
| `WithCancelCause`, `AfterFunc`, `WithoutCancel` | 취소 원인 기록(1.20), 취소 시 콜백(1.21), 부모 취소와 끊기(1.21) |

```go
func (s *Service) Get(ctx context.Context, id string) (*User, error) {
    ctx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
    defer cancel()                               // 자원 해제를 위해 항상 부른다
    return s.repo.Find(ctx, id)                  // 하위 호출에 그대로 넘긴다
}
```

- 컨텍스트는 **트리**다. 부모가 취소되면 모든 자식이 취소되고, 자식 취소는 부모에 영향이 없다.
- 취소는 협력적이다. 받는 쪽이 `ctx.Done()` 채널을 `select`로 보거나, `ctx.Err()`(`Canceled`·`DeadlineExceeded`)를 확인해 스스로 멈춘다. 표준 라이브러리의 `net/http`, `database/sql`은 이미 지원한다.
- 규칙: 함수의 **첫 매개변수**로 `ctx`라는 이름으로 받는다. 구조체 필드에 저장하지 않는다. `nil`을 넘기지 말고 모르면 `context.TODO()`를 쓴다. `WithValue`는 요청 ID·인증 정보처럼 요청 범위 메타데이터에만 쓰고 선택적 매개변수 대신 쓰지 않으며, 키는 충돌을 막으려 비공개 타입으로 만든다.

## sync 패키지와 atomic

| 도구 | 용도 |
| --- | --- |
| `sync.Mutex` | 상호 배제. `Lock`·`Unlock`(보통 `defer mu.Unlock()`). 재진입이 안 된다 |
| `sync.RWMutex` | 읽기 여럿 동시 허용, 쓰기는 배타. 읽기가 압도적으로 많을 때 |
| `sync.WaitGroup` | 고루틴 묶음이 끝나기를 기다린다. `Add`·`Done`·`Wait`, Go 1.25부터 `wg.Go(func)`가 `Add(1)`과 `Done`을 대신한다 |
| `sync.Once` | 함수를 정확히 한 번 실행한다(지연 초기화). 1.21의 `OnceFunc`·`OnceValue`·`OnceValues`가 더 간단하다 |
| `sync.Cond` | 조건 대기와 깨우기. 대부분 채널이 더 단순하다 |
| `sync.Pool` | 임시 객체 재사용으로 할당과 GC 압력을 줄인다. GC 때 비워질 수 있어 캐시로 쓰면 안 된다 |
| `sync.Map` | 키가 한 번 쓰이고 여러 번 읽히거나, 고루틴마다 다른 키를 쓰는 경우에 맞춘 동시성 맵. 그 밖에는 `map` + `Mutex`가 낫다 |
| `sync/atomic` | `atomic.Int64`, `atomic.Pointer[T]`(1.19) 같은 타입으로 잠금 없는 원자 연산 |

```go
var (
    mu    sync.Mutex
    count = map[string]int{}
    wg    sync.WaitGroup
)
for _, w := range words {
    wg.Go(func() {             // Go 1.22부터 반복 변수 w는 반복마다 새 변수라 그대로 캡처해도 된다
        mu.Lock()
        defer mu.Unlock()
        count[w]++
    })
}
wg.Wait()
```

- `Mutex`·`WaitGroup`을 담은 구조체는 **복사하면 안 된다**(복사본은 별개의 락이다). 포인터로 넘기고 `go vet`의 copylocks 검사로 잡는다.
- Go의 기본 `map`은 동시 쓰기에 안전하지 않아, 런타임이 감지하면 `concurrent map writes` 치명적 오류로 프로세스를 죽인다.
- **레이스 디텍터**: `go test -race`, `go run -race`가 실행 중 데이터 경쟁을 찾아 보고한다. 테스트와 CI에서 켠다.

## 정리

- 고루틴은 작은 스택으로 시작하는 런타임 스케줄링 단위이고, 블로킹 시스템 콜에서는 P를 다른 스레드로 넘긴다.
- 버퍼 없는 채널은 송수신이 만나야 진행되는 동기화, 버퍼 있는 채널은 속도 차 흡수와 세마포어다. 닫힌 채널에 보내면 panic, 받으면 제로값이다.
- `select`는 준비된 경우 중 무작위로 하나를 고르고, `default`로 논블로킹, `time.After`·`ctx.Done()`으로 타임아웃과 취소를 처리한다.
- `context`는 취소와 마감 시간을 트리로 전파한다. 첫 매개변수로 넘기고 `cancel`은 `defer`한다.
- 공유 상태는 `Mutex`, 완료 대기는 `WaitGroup`, 한 번 초기화는 `Once`. 레이스 디텍터를 켠다.

관련 노트: [[go-language|Go 언어]], [[concurrency-models|동시성 모델]], [[structured-concurrency|구조적 동시성]], [[process-synchronization|프로세스 동기화]], [[java-concurrency|Java 동시성]]
