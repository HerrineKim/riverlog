---
title: "개발자가 빠지는 함정 모음"
concept: "Developer Traps"
summary: "CSS·유니코드·부동소수점·시간·SQL·동시성·React·Git·네트워크 등에서 직관과 다르게 동작해 버그를 만드는 지점을 분야별로 묶고, 이름·주소·전화번호·이메일 같은 현실 데이터에 대한 착각(Falsehoods)을 덧붙였다. 공통 교훈은 '기본값과 경계를 믿지 말고, 표현과 비교의 기준을 명시하라'다."
tags: ["computer-science", "frontend", "backend", "database", "tips"]
source: other
date: "2026-10-21"
sources: ["https://qouteall.fun/qouteall-blog/2025/Traps%20to%20Developers", "https://github.com/kdeldycke/awesome-falsehood", "https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/", "https://www.mjt.me.uk/posts/falsehoods-programmers-believe-about-addresses/", "https://github.com/google/libphonenumber/blob/master/FALSEHOODS.md", "https://beesbuzz.biz/code/439-Falsehoods-programmers-believe-about-email"]
---

> qouteall의 글 「[Traps to Developers](https://qouteall.fun/qouteall-blog/2025/Traps%20to%20Developers)」(2026.10 갱신판)를 바탕으로 재구성한 노트다. 현실 데이터에 대한 착각은 「[Awesome Falsehood](https://github.com/kdeldycke/awesome-falsehood)」 목록과 거기 실린 「[Falsehoods Programmers Believe About Names](https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/)」, 「[… About Addresses](https://www.mjt.me.uk/posts/falsehoods-programmers-believe-about-addresses/)」, 「[… About Phone Numbers](https://github.com/google/libphonenumber/blob/master/FALSEHOODS.md)」, 「[… About Email](https://beesbuzz.biz/code/439-Falsehoods-programmers-believe-about-email)」을 바탕으로 보강했다.

## 함정이란

여기서 함정(trap)은 **문법상 문제없고 대부분 잘 돌아가지만, 특정 조건에서 직관과 다르게 동작하는 지점**이다. 컴파일러도 린터도 잡아 주지 않는다. 그래서 한 번 겪어 보거나 미리 알고 있어야 피할 수 있다.

함정은 언어·도구마다 수백 가지지만, 대부분 **몇 가지 원인**으로 묶인다. 아래는 원인별 분류, 코드 분야별 대표 항목, 그리고 이름·주소처럼 **현실 데이터를 모델링할 때 하는 착각**이다.

## 함정이 생기는 여섯 가지 원인

| 원인 | 설명 | 대표 예 |
| --- | --- | --- |
| 표현의 한계 | 값이 메모리·형식에 정확히 담기지 않는다 | `0.1 + 0.2`, JS 정수 2^53 한계, UTF-16 서로게이트 |
| "없음"의 모호함 | null·빈 값·기본값·누락이 구분되지 않는다 | SQL `= null`, Python 거짓 값, JSON null vs 필드 없음 |
| 숨은 기본값 | 아무것도 안 쓰면 적용되는 규칙이 예상과 다르다 | `min-width: auto`, `content-box`, MySQL 대소문자 무시 정렬 |
| 참조·공유 | 같은 객체를 여럿이 가리키다 한쪽 변경이 퍼진다 | Python 기본 인자, Go `append`, React 의존성 배열 |
| 순서·시점 | 실행 순서나 시간이 보장되지 않는다 | 해시맵 순회 순서, TOCTOU, DST로 반복되는 한 시간 |
| 현실의 다양성 | 사람·장소·제도가 개발자가 아는 예보다 훨씬 다양하다 | 이름 칸 길이 제한, 우편번호 정규식, 국가 = 국가 번호 하나 |

## 분야별 대표 함정

### 1. HTML·CSS

| 함정 | 해결 |
| --- | --- |
| flex·grid 자식이 내용 때문에 줄어들지 않는다 | `min-width: 0` (세로는 `min-height: 0`) |
| 퍼센트 세로 padding·margin은 부모의 **너비** 기준이다 | 의도한 기준을 확인한다 |
| 세로 margin이 형제·자식 사이에서 겹친다(margin collapse) | flex·grid의 `gap`, `display: flow-root` |
| `transform`·`opacity` 등이 쌓임 맥락(stacking context)을 새로 만든다 | z-index가 안 먹으면 조상의 쌓임 맥락부터 본다 |
| 부모에 `overflow: hidden`이 있으면 `position: sticky`가 안 된다 | 조상의 overflow를 확인한다 |
| 모바일에서 `100vh`가 브라우저 바를 무시한다 | `100dvh` |
| `height: 0` ↔ `auto` 전환 애니메이션이 안 된다 | grid `0fr → 1fr`, `interpolate-size` |
| 새로 추가된 요소에는 transition이 안 걸린다 | `@starting-style` |
| `opacity: 0`은 보이지 않아도 클릭된다 | 목적에 맞게 `visibility`·`display` 선택 |
| 사용자 입력 URL의 `javascript:` 스킴이 코드를 실행한다 | URL 스킴 검증 |

### 2. 유니코드와 텍스트

- 사람이 보는 한 글자(grapheme cluster)는 여러 코드 포인트일 수 있다. **어떤 주류 언어도 문자열 길이를 "보이는 글자 수"로 세지 않는다.** JS·Java는 UTF-16 코드 유닛, Python은 코드 포인트, Go·C++은 바이트 단위다.
- 바이트 스트림을 조각별로 디코딩하면 멀티바이트 문자가 잘려 깨진다.
- 같은 모양의 문자열도 정규화(normalization) 형태가 다르면 비교가 실패한다. 한글 자모 분리(NFD) 파일 이름이 대표적이다.
- 바이너리를 텍스트로 바꾸면 정보가 사라진다. JSON에 넣으려면 Base64로 인코딩한다.

### 3. 부동소수점

- `NaN`은 자기 자신과도 같지 않고, 계산에 섞이면 결과 전체로 번진다.
- **돈은 부동소수점으로 저장하지 않는다.** 정수(최소 단위)나 decimal 타입을 쓴다.
- JS 숫자는 double이라 2^53−1을 넘는 정수 ID가 조용히 바뀐다. BigInt나 문자열로 다룬다.
- 같음 비교는 허용 오차로 한다. 값이 크면 상대 오차를 쓴다.
- 매 프레임 변환을 누적하면 오차가 커진다. 원래 값에서 다시 계산한다.
- 반올림 모드, 상대 오차 비교, 흡수·상쇄와 Kahan 합산은 [[floating-point-arithmetic|부동소수점 오차: 반올림·비교·누적]]에 있다.

### 4. 시간

- **저장은 UTC, 표시할 때만 현지 시간으로 바꾼다.** 서버 시간대도 UTC로 맞춘다.
- 서머타임이 끝나는 날에는 같은 현지 시각이 두 번 있어, 현지 시각 → 타임스탬프 변환이 모호하다.
- NTP 보정으로 시계가 뒤로 갈 수 있다. 경과 시간은 단조 시계로 잰다.
- 타임스탬프 단위(초·밀리초·나노초)가 시스템마다 다르다.
- Java·JS의 월은 0부터 시작한다. 날짜 포맷 문자 `M`/`m`의 뜻도 언어마다 다르다.
- MySQL `timestamp`는 2038년에 넘친다.
- 달력·시간대·서머타임에 대한 더 많은 착각은 [[calendar-fallacies|달력과 시간에 대한 개발자의 착각]]에 모았다.

### 5. SQL 데이터베이스

| 함정 | 해결 |
| --- | --- |
| `= null`은 항상 거짓이다 | `is null` |
| 유니크 인덱스가 null을 여러 개 허용한다 | 필요하면 not null 제약 |
| 여러 테이블을 join하면 행이 불어나 집계가 틀린다 | 서브쿼리로 먼저 집계 |
| MySQL `utf8`은 이모지(4바이트)를 못 담는다 | `utf8mb4` |
| 복합 인덱스는 앞 컬럼 없이 못 쓰고, `LIKE '%x'`도 인덱스를 못 탄다 | 쿼리 패턴에 맞게 인덱스 설계 |
| 운영 중 인덱스·FK 추가가 테이블 전체를 잠근다 | PostgreSQL `CONCURRENTLY`, `NOT VALID` 후 `VALIDATE` |
| N+1 쿼리는 하나하나가 빨라 슬로 쿼리 로그에 안 잡힌다 | 요청당 쿼리 수를 본다 |
| auto increment ID는 연속적이지도, 커밋 순서대로도 아니다 | 순서에 의존하지 않는다 |

### 6. 동시성

- 취소 요청과 작업 완료가 경쟁한다. 취소 직전·직후에 끝날 수 있다.
- 확인 후 사용(TOCTOU): 검사한 시점과 쓰는 시점 사이에 상태가 바뀐다.
- 요청을 보낸 순서와 응답이 오는 순서는 다르다.
- 읽기 락을 쓰기 락으로 올리면 교착 상태가 된다. 풀고 다시 잡은 뒤 재확인한다.
- 재진입 가능 락(Java `synchronized`)과 불가능한 락(Go·Rust Mutex)을 헷갈리면 스스로 교착된다.

### 7. React

- 렌더마다 새로 만드는 객체·배열·함수는 매번 다른 참조라, 의존성에 넣으면 effect가 계속 돈다.
- state는 불변으로 다룬다. 고치지 말고 새 객체로 바꾼다.
- 오래된 클로저(stale closure)가 이전 state를 잡고 있다. ref나 `useEffectEvent`로 최신 값을 읽는다.
- `useEffect`는 페인트 뒤에 돌아 깜빡임이 생길 수 있다. 레이아웃 측정은 `useLayoutEffect`.
- 서버 함수는 **공개 API**다. 입력을 검증하고, 비밀값을 클라이언트로 넘기거나 클로저에 담지 않는다.

### 8. Git

- `.gitignore`에 추가해도 이미 커밋된 파일은 계속 추적된다. `git rm --cached`는 다른 사람이 pull할 때 파일을 지운다.
- **한 번 푸시한 비밀값은 force push로 덮어도 GitHub에 남아 있다.** 즉시 키를 폐기한다.
- macOS·Windows에서 대소문자만 바꾼 파일 이름 변경은 `git mv`를 써야 반영된다.
- 머지를 revert해도 다시 머지하면 변경이 돌아오지 않는다. revert를 다시 revert해야 한다.

### 9. 네트워크·백엔드

| 함정 | 해결 |
| --- | --- |
| 중간 장비가 유휴 TCP 연결을 조용히 끊는다 | TCP keepalive |
| Nagle 알고리즘이 작은 패킷을 지연시킨다 | `TCP_NODELAY` |
| Nginx 버퍼링 때문에 SSE가 늦게 온다 | `proxy_buffering off` |
| 타임아웃 없는 요청·무한 재시도가 자원을 묶는다 | 항상 타임아웃과 재시도 상한 |
| Redis `KEYS prefix-*`가 전체를 훑는다 | 해시 구조나 `SCAN` |
| 트랜잭션 커밋 전에 Kafka로 발행하면 소비자가 옛 데이터를 읽는다 | 커밋 후 발행(아웃박스 패턴 등) |
| 인증서 자동 갱신이 조용히 실패한다 | 만료 모니터링 |

### 10. 여러 언어 공통

- `(low + high) / 2`는 오버플로될 수 있다. `low + (high - low) / 2`.
- 음수의 나머지 연산 결과가 Python과 C 계열에서 다르다.
- 해시맵 순회 순서와 디렉터리 목록 순서는 정해져 있지 않다. 필요하면 정렬한다.
- 반복문 안 문자열 `+` 연결은 O(n²)이 될 수 있다.
- 파일 쓰기는 임시 파일에 쓰고 rename해야 원자적이다. 전원이 나가면 fsync 안 된 데이터는 사라진다.
- 셸에서 변수가 비면 `rm -rf "$DIR/"`가 `rm -rf /`가 된다. `set -u`를 쓴다.
- YAML에서 따옴표 없는 `NO`는 false가 된다.
- 문자열 정렬에서는 "10"이 "9"보다 앞선다.

## 현실 데이터에 대한 착각

「Falsehoods programmers believe about …」(프로그래머가 믿는 착각) 목록은 2010년 이름에 관한 글에서 시작해 시간, 주소, 전화번호, 이메일, 통화, 지도, 파일 경로까지 번졌다. 형식은 늘 같다. **「당연히 이렇겠지」라는 가정을 나열하고, 그 하나하나에 실제 반례가 있다**는 것이다. 이 가정이 스키마·검증 규칙·정규식으로 굳으면 반례에 해당하는 사람은 가입도 결제도 못 한다.

| 대상 | 흔한 착각 | 실제 |
| --- | --- | --- |
| 사람 이름 | 누구나 정확히 하나의 이름이 있고, 성과 이름으로 나뉘며, 바뀌지 않고, ASCII로 쓰이고, 일정 길이 안에 들어간다 | 이름이 여럿이거나 없는 사람, 성이 없는 문화, 결혼·개명으로 바뀌는 이름, 성과 이름 순서가 다른 언어, 대소문자만 다른 이름이 있다. 성이 `Null`인 사람은 문자열 `"null"`을 빈 값으로 처리하는 시스템에서 사라진다. 금칙어 사전에도 실제 이름이 들어 있다 |
| 우편 주소 | 주소에는 건물 번호가 있고, 번호는 숫자이며, 0이나 음수는 없고, 한 거리에 같은 번호는 하나다 | 번호 없는 건물(Royal Opera House), `1A`·`4-5` 같은 번호, `0`번지, 같은 거리 이름·번호가 몇 km 떨어진 두 마을에 있다. 홍콩 주소는 도로 번호와 단지 번호를 함께 쓰고, 일본 주소는 여섯 덩어리의 숫자로 된다. 코스타리카는 랜드마크 기준으로 쓴다 |
| 전화번호 | 사람마다 번호가 하나 있고, 번호가 사람을 식별하며, 재사용되지 않고, 숫자로만 되어 있다 | 번호는 공유·이전·재할당된다. 국가 번호 하나가 여러 나라를 덮고(+1은 미국·캐나다·카리브해 여러 나라), 한 나라가 국가 번호를 여럿 쓰기도 한다. 유효한 번호의 앞부분이 또 다른 유효한 번호일 수 있다. **전화번호는 숫자가 아니다**: 앞의 0이 의미가 있으므로 정수로 저장하지 않는다 |
| 이메일 | 누구나 주소가 하나 있고, 바뀌지 않으며, 한 사람의 것이고, 글자·숫자·`.`·`_`·`-`만 쓴다 | `^_^@example.com`도 유효하다. 반송되지 않았다고 유효한 것도, 반송됐다고 영원히 무효인 것도 아니다. `+태그`를 마음대로 지우면 다른 주소가 된다. 로컬 부분의 대소문자를 구분할지는 받는 서버가 정한다. 도메인(`.edu`, `.fr`)으로 신분·언어를 추측할 수 없다 |
| 시간 | 하루는 24시간, 시간대는 정시 단위, 시계는 앞으로만 간다 | [[calendar-fallacies\|달력과 시간에 대한 개발자의 착각]]에 따로 모았다 |
| 네트워크 | 네트워크는 믿을 만하고 지연은 0이다 | [[distributed-time-and-failure\|분산 시스템의 시간과 장애]]의 8가지 착각 |

대응 원칙은 이렇다.

- **필요한 만큼만 구조화한다.** 이름은 「성/이름」 대신 자유 입력 칸 하나(필요하면 「부를 이름」 칸 추가), 주소도 국가별 형식을 강제하지 말고 자유 입력 줄을 허용한다.
- **직접 검증 규칙을 만들지 않는다.** 전화번호는 Google `libphonenumber`, 주소는 `libaddressinput`처럼 국가별 데이터를 가진 라이브러리를 쓰고, 이메일은 형식 검사보다 **확인 메일**로 검증한다.
- 사람을 식별하는 키로 이름·전화번호·이메일을 쓰지 않는다. 시스템이 발급한 ID를 쓰고, 연락 수단은 바뀔 수 있는 속성으로 둔다.
- 테스트 데이터에 다양한 실제 사례(비 ASCII 이름, 아주 긴 이름, 따옴표·`<`가 든 이름)를 넣는다. 「Big List of Naughty Strings」 같은 목록을 쓸 수 있다. 회사 이름에 `<`·`>`를 허용하는 나라도 있어 출력 이스케이프를 빠뜨리면 XSS가 된다.

## 정리

- 함정 대부분은 **표현의 한계, 없음의 모호함, 숨은 기본값, 공유 참조, 보장되지 않는 순서, 현실의 다양성** 중 하나로 설명된다. 새 언어·도구를 배울 때 이 여섯 가지를 먼저 확인하면 많은 버그를 미리 막는다.
- 이름·주소·전화번호·이메일에는 「당연한」 규칙이 없다. 구조를 덜 강제하고, 검증은 전용 라이브러리와 확인 절차에 맡긴다.
- 돈·시간·텍스트처럼 "당연해 보이는" 값일수록 저장 형식과 비교 기준을 명시한다.
- 운영 환경의 DB 마이그레이션, 비밀값 푸시, 타임아웃 없는 호출은 되돌리기 어렵다. 실행 전에 한 번 더 확인할 목록으로 둔다.
- 전부 외울 필요는 없다. 이상한 버그를 만났을 때 이 목록부터 훑어보는 체크리스트로 쓰면 된다.

관련 노트: [[data-representation|데이터 표현]], [[floating-point-arithmetic|부동소수점 오차]], [[calendar-fallacies|달력과 시간에 대한 개발자의 착각]], [[payment-address-forms|결제·주소 폼]], [[process-synchronization|프로세스 동기화]], [[principles|코드 리뷰 원칙과 체크리스트]], [[db-fetching-patterns|빠르고 유지보수하기 좋은 DB 조회 패턴]]
