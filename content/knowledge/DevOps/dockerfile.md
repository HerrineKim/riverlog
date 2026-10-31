---
title: "Dockerfile 작성과 컨테이너의 PID 1"
concept: "Dockerfile"
summary: "이미지와 컨테이너의 관계와 층 구조, Dockerfile 명령(RUN·CMD·ENTRYPOINT 조합, COPY·ADD, ARG·ENV, WORKDIR, USER, HEALTHCHECK), 베이스 이미지(Debian·Alpine·distroless·scratch) 고르기, 컨테이너가 바로 꺼지는 이유와 PID 1·좀비 프로세스 문제(tini·--init), 디버깅 요령, 멀티 스테이지 빌드·빌드 캐시·BuildKit, 태그 전략·레지스트리·댕글링 이미지·save·load 같은 이미지 관리."
tags: ["docker", "devops", "container", "infra"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/f863faecbc414713b46016117cbe9475", "https://80000coding.notion.site/be3f7cdb6d2f4e868fb6968740be0256", "https://80000coding.notion.site/8e5f46b5c0b144d5ac773446bbaf8ffa", "https://80000coding.notion.site/d6e6ca38d41347baa80ba1b4f40886ab", "https://docs.docker.com/reference/dockerfile/", "https://blog.phusion.nl/2015/01/20/docker-and-the-pid-1-zombie-reaping-problem/", "https://bytebytego.com/guides/9-docker-best-practices-you-must-know", "https://docs.docker.com/build/building/best-practices/", "https://www.44bits.io/ko/post/how-docker-image-work", "https://www.44bits.io/ko/post/easy-deploy-with-docker", "https://github.com/nodejs/Release", "https://alpinelinux.org/releases/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/docker.md", "https://docs.docker.com/build/buildkit/", "https://docs.docker.com/build/cache/"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[inception] 인셉션 테스트 가이드라인」, 「Inception 참고자료」, 「[Inception] docker orchestration with docker-compose」, 「Inception 공부할때 유용했던 링크들」을 바탕으로 과제 풀이를 빼고 Docker 일반 개념만 재구성한 노트다. 「이미지 모범 사례」는 ByteByteGo의 System Design 101 가이드 「[9 Docker Best Practices You Must Know](https://bytebytego.com/guides/9-docker-best-practices-you-must-know)」를 Docker 공식 문서로 확인해 보강했다. 층과 OverlayFS, 태그·다이제스트, 배포 흐름은 「[만들면서 이해하는 도커(Docker) 이미지의 구조](https://www.44bits.io/ko/post/how-docker-image-work)」, 「[도커(Docker) 입문편](https://www.44bits.io/ko/post/easy-deploy-with-docker)」으로 보강했다. 명령별 세부, 베이스 이미지 비교, 멀티 스테이지·빌드 캐시·BuildKit, 이미지 관리는 fru1tworld/cs-basic 모의 면접 질문 목록의 「[Docker](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/docker.md)」 항목이 묻는 개념을 Docker 공식 문서로 확인해 보강했다.

## 이미지와 컨테이너

| | 이미지(image) | 컨테이너(container) |
| --- | --- | --- |
| 정체 | 실행에 필요한 파일·의존성·설정을 층(layer)으로 쌓은 **읽기 전용 템플릿** | 이미지를 실행한 **프로세스**. 위에 쓰기 가능한 층이 하나 얹힌다 |
| 비유 | 클래스, 설치 디스크 | 인스턴스, 설치된 프로그램 |
| 만드는 법 | `docker build`(Dockerfile) 또는 Docker Hub에서 `docker pull` | `docker run <이미지>` |
| 수명 | 바뀌지 않는다(불변) | 지우면 안의 변경도 사라진다. 남길 데이터는 볼륨에 둔다 |

Docker Hub의 공식 이미지(`nginx`, `mariadb`)를 그대로 쓸 수도 있고, Dockerfile로 직접 빌드한 커스텀 이미지를 레지스트리에 올려 쓸 수도 있다. VM과의 차이는 [[vm-vs-container|VM과 컨테이너]]에 있다.

### 층(layer)과 OverlayFS

이미지는 빌드 단계마다 생긴 파일 변경분을 한 층씩 쌓은 것이다. `RUN`·`COPY`·`ADD`처럼 파일을 바꾸는 명령이 층을 만들고, `CMD`·`ENV`·`EXPOSE` 같은 메타데이터 명령은 파일을 바꾸지 않는다. 층들을 하나의 디렉터리처럼 겹쳐 보여 주는 것이 **유니온 마운트**이고, 리눅스 커널의 OverlayFS(Docker의 기본 스토리지 드라이버 `overlay2`)가 이를 구현한다.

```text
merged    ← 컨테이너가 보는 최종 파일 시스템
  ▲
upperdir  ← 컨테이너의 쓰기 층 (컨테이너마다 하나, 지우면 사라짐)
lowerdir  ← 이미지의 읽기 전용 층들 (여러 컨테이너·이미지가 공유)
```

| 동작 | 일어나는 일 |
| --- | --- |
| 하위 층 파일 수정 | 파일을 upperdir로 복사한 뒤 고친다(copy-on-write). 원래 층은 그대로다. 큰 파일을 조금만 고쳐도 통째로 복사되므로, 자주 쓰는 데이터는 볼륨에 둔다 |
| 하위 층 파일 삭제 | upperdir에 **whiteout** 표시 파일을 만들어 가린다. 아래 층에서는 지워지지 않으므로, 앞 층에서 추가한 파일을 뒷 층에서 지워도 이미지 크기는 줄지 않는다 |
| 같은 베이스 이미지 | 아래 층을 공유해 디스크와 내려받는 양이 준다. 같은 이미지로 컨테이너를 여럿 띄워도 읽기 전용 층은 하나다 |

- `docker history <이미지>`로 층별 크기를, `docker diff <컨테이너>`로 쓰기 층의 변경을 본다.
- **태그는 바꿀 수 있는 이름표, 다이제스트는 내용의 해시다.** `nginx:latest`는 언제든 다른 이미지를 가리킬 수 있고 최신 버전을 보장하지도 않는다. 운영 배포는 명시적 버전 태그나 `nginx@sha256:…` 다이제스트로 고정한다.
- 배포 흐름은 **build → push(레지스트리) → pull(서버) → run**이다. Apple Silicon Mac에서 빌드한 이미지는 기본이 ARM64라 AMD64 서버에서 돌지 않으므로 `docker buildx build --platform linux/amd64`(또는 멀티 플랫폼)로 빌드한다.

## Dockerfile 기본 명령

```dockerfile
FROM alpine:3.24                         # 베이스 이미지 (태그를 고정한다)
RUN apk add --no-cache nginx             # 빌드할 때 실행 → 결과가 이미지 층으로 남음
COPY conf/default.conf /etc/nginx/http.d/default.conf
WORKDIR /var/www/html                    # 이후 명령의 작업 디렉터리
EXPOSE 443                               # 문서용 표시. 실제 공개는 run -p / compose ports
ENTRYPOINT ["nginx"]                     # 컨테이너 시작 시 실행할 프로그램
CMD ["-g", "daemon off;"]                # ENTRYPOINT에 넘길 기본 인자
```

### RUN · CMD · ENTRYPOINT

| 명령 | 실행 시점 | 역할 |
| --- | --- | --- |
| `RUN` | **빌드할 때** | 패키지 설치, 파일 준비. 명령마다 이미지 층이 생기므로 `&&`로 묶는다 |
| `ENTRYPOINT` | 컨테이너 시작 시 | 이 컨테이너가 *무엇인지* 정하는 고정 실행 파일 |
| `CMD` | 컨테이너 시작 시 | 기본 명령 또는 ENTRYPOINT의 기본 인자. `docker run 이미지 <인자>`로 덮어쓸 수 있다 |

두 시작 명령은 배열(exec 형식, `["nginx", "-g", "daemon off;"]`)로 쓴다. 문자열(shell 형식)로 쓰면 `/bin/sh -c`가 PID 1이 되어 아래의 신호 문제가 생긴다.

ENTRYPOINT와 CMD를 함께 쓰면 **CMD가 ENTRYPOINT의 기본 인자**가 된다.

| Dockerfile | `docker run 이미지` | `docker run 이미지 -v` |
| --- | --- | --- |
| `CMD ["node", "app.js"]`만 | `node app.js` | `-v` (CMD 전체가 바뀐다) |
| `ENTRYPOINT ["curl"]`만 | `curl` | `curl -v` |
| `ENTRYPOINT ["curl"]` + `CMD ["--help"]` | `curl --help` | `curl -v` (CMD만 바뀐다) |

- **CMD만**: 범용 이미지. 사용자가 다른 명령으로 쉽게 바꿔 실행한다(`docker run python:3.13 python -m http.server`).
- **ENTRYPOINT + CMD**: 이미지가 곧 하나의 실행 파일인 경우. `curl`, 마이그레이션 도구처럼 인자만 바꿔 쓴다. ENTRYPOINT 자체는 `--entrypoint`로만 바꿀 수 있다.
- **ENTRYPOINT 스크립트**: 시작 전에 설정 파일을 만들거나 대기한 뒤 마지막에 `exec "$@"`로 CMD를 실행한다. `exec`를 빼면 셸이 PID 1로 남아 신호가 앱에 전달되지 않는다.

### 그 밖의 명령

| 명령 | 역할과 주의점 |
| --- | --- |
| `COPY` | 빌드 컨텍스트의 파일을 이미지로 복사한다. `--chown=10001:10001`로 소유자를, `--from=<스테이지>`로 다른 스테이지의 파일을 지정한다 |
| `ADD` | COPY에 더해 **원격 URL 내려받기**와 로컬 tar 파일 **자동 압축 해제**를 한다. 동작이 암묵적이라 보통은 COPY를 쓰고, tar를 풀어 넣을 때나 체크섬(`--checksum`)을 검증하며 내려받을 때만 ADD를 쓴다 |
| `ARG` | **빌드할 때만** 쓰는 변수. `docker build --build-arg VERSION=1.2`로 넘긴다. FROM 앞에 선언하면 FROM에서만 쓰이고, 스테이지마다 다시 선언해야 한다 |
| `ENV` | 빌드 중에도 쓰이고 **실행 중인 컨테이너에도 남는** 환경 변수. `docker run -e`로 덮어쓴다 |
| `WORKDIR` | 이후 RUN·CMD·COPY의 작업 디렉터리. 없으면 만든다. `RUN cd /app`은 그 RUN 안에서만 유효하므로 WORKDIR을 쓰고, 상대 경로가 앞 WORKDIR에 이어 붙으므로 절대 경로로 쓴다 |
| `USER` | 이후 명령과 컨테이너 실행 사용자. 숫자 UID로 지정해야 쿠버네티스의 `runAsNonRoot` 검증을 통과한다. 사용자를 먼저 만들고, 앱 파일 소유권을 맞춘다 |
| `HEALTHCHECK` | 컨테이너 안에서 주기적으로 명령을 실행해 상태(starting·healthy·unhealthy)를 매긴다 |
| `EXPOSE` | 듣는 포트를 문서로 표시한다. 실제 공개는 `-p`([[docker-network-volume\|Docker 네트워크와 볼륨]]) |
| `LABEL` | 이미지 메타데이터(출처, 버전) |

ARG 값은 `docker history`에 남으므로 **비밀 값을 ARG·ENV로 넘기지 않는다.** 빌드에 토큰이 필요하면 BuildKit의 secret mount를 쓴다(아래 「BuildKit」).

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1
```

| 옵션 | 기본값 | 뜻 |
| --- | --- | --- |
| `--interval` | 30s | 검사 간격 |
| `--timeout` | 30s | 이 시간 안에 끝나지 않으면 실패 |
| `--start-period` | 0s | 시작 직후 이 기간의 실패는 횟수에 세지 않는다 |
| `--retries` | 3 | 연속 몇 번 실패하면 unhealthy |

HEALTHCHECK 결과는 `docker ps`의 상태와 Compose의 `depends_on: condition: service_healthy`에 쓰인다. Docker 자체는 unhealthy 컨테이너를 재시작하지 않는다(Swarm은 교체한다). 쿠버네티스는 이 명령을 무시하고 자기 프로브를 쓴다([[kubernetes-workloads\|쿠버네티스 워크로드]]). 검사 명령에 쓸 도구(curl, wget)가 이미지에 있어야 한다.

## 베이스 이미지 고르기

| 베이스 | 크기 | 내용 | 맞는 경우 | 주의 |
| --- | --- | --- | --- | --- |
| Debian·Ubuntu (전체) | 수십~100MB 이상 | 셸, 패키지 관리자(`apt`), 많은 도구 | 빌드 스테이지, 디버깅이 잦은 환경 | 크고 취약점 보고가 많다 |
| Debian slim | 수십 MB | 최소 glibc 배포판 + `apt` | 호환성이 중요한 일반 앱의 기본 선택 | - |
| Alpine | 수 MB | musl libc + `apk` + BusyBox 셸 | 작고 공격 표면이 적어야 할 때 | glibc를 전제로 한 바이너리·파이썬 휠이 안 맞을 수 있고, DNS 해석 등 동작 차이가 있다 |
| distroless | 수 MB~ | 런타임(glibc, CA 인증서, 언어 런타임)만. **셸·패키지 관리자 없음** | 운영 실행 스테이지 | 셸이 없어 `exec`로 들어갈 수 없다(`:debug` 태그나 도구 컨테이너로 디버깅) |
| `scratch` | 0 | 아무것도 없는 빈 이미지 | 정적으로 링크한 Go·Rust 바이너리 | CA 인증서, 시간대 데이터, `/etc/passwd`를 직접 복사해야 한다 |

**distroless 이미지**는 앱 실행에 필요한 런타임만 남기고 셸·패키지 관리자·유틸리티를 뺀 이미지다(구글의 `gcr.io/distroless/*`, Chainguard 이미지 등). 보안 측면에서는 공격자가 컨테이너에 들어와도 쓸 도구가 없고, 스캔에 걸릴 패키지가 적어 취약점 수가 크게 준다. 성능 측면에서는 이미지가 작아 내려받기·시작이 빠르다. 대신 디버깅이 불편해 멀티 스테이지 빌드와 함께 쓴다.

고르는 기준은 호환성(glibc·musl), 크기와 공격 표면, 디버깅 편의, 보안 패치가 꾸준히 나오는가다. 어느 쪽이든 `latest` 대신 버전 태그를 고정해야 빌드가 재현된다. 신뢰할 수 있는 베이스를 고르고 관리하는 방법은 [[docker-container-operations|Docker 컨테이너 운영]]의 「이미지 공급망」에 있다.

## 컨테이너가 바로 꺼지는 이유

**컨테이너는 PID 1 프로세스가 살아 있는 동안만 산다.** 시작 명령이 끝나면 컨테이너도 종료된다.

- `nginx`, `php-fpm`, `mysqld`처럼 기본적으로 백그라운드(데몬)로 빠지는 서버는 실행 직후 PID 1이 끝나 버린다. `nginx -g 'daemon off;'`, `php-fpm -F`(`--nodaemonize`)처럼 포그라운드 실행 옵션을 줘야 한다.
- `tail -f /dev/null`, `sleep infinity`, `while true` 같은 무한 대기로 컨테이너를 살려 두는 것은 꼼수다. 실제 서비스가 죽어도 컨테이너는 살아 있어 장애를 감춘다.

## PID 1과 좀비 프로세스

리눅스에서 PID 1(init)에는 특별한 책임이 있다. 부모를 잃은 자식 프로세스를 넘겨받아 종료 상태를 회수(reap)하고, `SIGTERM` 같은 신호를 받으면 자식들을 정리하고 끝나야 한다. 일반 애플리케이션은 이 일을 하지 않도록 만들어져 있어서 PID 1로 띄우면 두 가지 문제가 생긴다.

| 문제 | 증상 |
| --- | --- |
| 좀비 프로세스 | 자식이 끝나도 회수되지 않아 프로세스 테이블에 쌓인다 |
| 신호 무시 | PID 1은 처리기를 등록하지 않은 신호를 기본 동작으로 받지 않는다. `docker stop`의 `SIGTERM`이 무시되어 10초 뒤 `SIGKILL`로 강제 종료된다 |

해결책은 신호 전달과 좀비 회수만 하는 작은 init을 PID 1로 두고 앱을 그 자식으로 띄우는 것이다.

```dockerfile
RUN apk add --no-cache tini              # 또는 dumb-init
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["php-fpm83", "-F"]
```

이미지를 고치지 않아도 `docker run --init`이나 Compose의 `init: true`를 주면 Docker가 tini를 PID 1로 넣어 준다. 프로세스와 신호의 기본 개념은 [[process-and-thread|프로세스와 스레드]]에 있다.

## Dockerfile 디버깅 요령

```bash
docker run -it --rm alpine:3.24 /bin/sh   # 임시 컨테이너에서 명령을 먼저 시험
docker build -t myapp .                   # 빌드
docker run -d --name app -p 8080:80 myapp # -d: 백그라운드 실행, 터미널을 돌려받는다
docker ps -a                              # STATUS가 Up인지, Exited(코드)인지
docker logs app                           # 바로 꺼졌다면 여기서 이유를 본다
docker exec -it app /bin/sh               # 실행 중인 컨테이너 안에 들어가 설정 확인
```

- 패키지 이름·버전은 배포판마다 다르므로 `apk search`·`apt-cache search`로 임시 컨테이너에서 확인한 뒤 Dockerfile에 옮긴다.
- `docker attach`는 PID 1의 표준 입출력에 붙는 것이라 빠져나오다 컨테이너를 멈출 수 있다. 안을 살펴볼 때는 `exec`을 쓴다.
- 설정을 바꿀 때마다 `exec`으로 들어가 고치지 말고, 파일을 `COPY`하도록 Dockerfile에 반영해 `docker run`만으로 같은 상태가 재현되게 한다.

## 이미지 모범 사례

좋은 이미지는 작고, 재현되고, 권한이 적고, 빨리 빌드된다.

| 원칙 | 방법 | 이유 |
| --- | --- | --- |
| 공식·검증된 베이스 | Docker 공식 이미지나 검증된 배포자의 이미지에서 시작한다 | 보안 패치가 꾸준히 나온다 |
| 버전 고정 | `node:24-alpine`처럼 태그를 명시한다. 더 엄격하게는 다이제스트(`@sha256:…`)로 고정한다 | 기본 태그 `latest`는 언제 무엇을 가리킬지 몰라 빌드가 재현되지 않는다 |
| 멀티 스테이지 빌드 | 빌드용 스테이지에서 컴파일하고, 실행 스테이지에는 결과물만 복사한다 | 컴파일러·개발 의존성이 최종 이미지에 남지 않아 작고 안전하다 |
| `.dockerignore` | `.git`, `node_modules`, 로그, `.env`를 빌드 컨텍스트에서 뺀다 | 빌드가 빨라지고, 비밀 파일이 이미지에 들어가는 사고를 막는다 |
| 최소 권한 사용자 | `USER` 명령으로 root가 아닌 사용자로 실행한다 | 컨테이너가 뚫려도 피해 범위가 줄어든다 |
| 설정은 환경 변수로 | 환경마다 다른 값은 이미지에 굽지 않고 실행할 때 `ENV`·`-e`·`env_file`로 넣는다. 비밀 값은 비밀 저장소나 BuildKit secret mount를 쓴다 | 같은 이미지를 개발·스테이징·운영에 그대로 쓴다 |
| 캐시를 살리는 순서 | 덜 바뀌는 단계(의존성 목록 복사·설치)를 위에, 자주 바뀌는 단계(소스 복사)를 아래에 둔다 | 한 층이 바뀌면 그 아래 층은 모두 다시 빌드된다 |
| 라벨 | `LABEL org.opencontainers.image.source=…`처럼 출처·버전·관리자를 붙인다 | 레지스트리에서 이미지를 찾고 관리하기 쉽다 |
| 취약점 스캔 | CI에서 Trivy, Docker Scout 같은 스캐너로 검사한다 | 알려진 취약점을 배포 전에 잡는다 |

```dockerfile
# 빌드 스테이지
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./   # 의존성 목록 먼저 → 캐시 재사용
RUN npm ci
COPY . .                                 # 소스는 나중에
RUN npm run build

# 실행 스테이지: 결과물만
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node                                # root가 아닌 사용자
CMD ["node", "dist/server.js"]
```

### 멀티 스테이지 빌드

**멀티 스테이지 빌드는 Dockerfile 하나에 `FROM`을 여러 번 써서, 앞 스테이지에서 빌드하고 마지막 스테이지에는 실행에 필요한 결과물만 복사하는 방식**이다. 컴파일러, 빌드 도구, 소스 코드, 개발 의존성이 최종 이미지에 남지 않아 이미지가 작아지고 공격 표면이 준다. 빌드용 Dockerfile과 실행용 Dockerfile을 따로 두고 스크립트로 잇던 옛 방식(빌더 패턴)을 대신한다. BuildKit은 서로 의존하지 않는 스테이지를 병렬로 빌드하고, 최종 스테이지에 필요 없는 스테이지는 건너뛴다.

컴파일 언어에서 효과가 가장 크다. Go는 정적 바이너리 하나만 남기면 된다.

```dockerfile
FROM golang:1.25 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download                       # 의존성 층을 캐시
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/app

FROM gcr.io/distroless/static-debian12:nonroot   # CA 인증서·시간대 포함, 셸 없음, 비root
COPY --from=build /out/app /app
ENTRYPOINT ["/app"]
```

빌드 스테이지(`golang` 이미지)는 수백 MB지만 최종 이미지는 바이너리 크기 수준이다. `CGO_ENABLED=0`으로 C 라이브러리 의존을 없애야 glibc 없는 이미지에서 돈다. Java는 JDK와 Maven·Gradle이 있는 빌드 스테이지에서 JAR를 만들고, 실행 스테이지는 JRE(또는 `jlink`로 필요한 모듈만 묶은 런타임) 이미지에 JAR만 복사한다. Spring Boot JAR는 `layertools`로 의존성과 앱 코드를 다른 층으로 나누면 코드만 바뀔 때 의존성 층을 재사용한다.

## 빌드 캐시

Docker는 명령마다 결과 층을 캐시하고, 다음 빌드에서 같은 명령이면 재사용한다. **한 층의 캐시가 무효화되면 그 아래 모든 층이 다시 빌드된다.**

| 명령 | 캐시가 무효화되는 조건 |
| --- | --- |
| `RUN` | 명령 문자열이 바뀌었을 때. 명령이 같으면 결과가 달라질 수 있어도(`apt-get update`, 네트워크에서 받은 최신 패키지) 재사용한다 |
| `COPY` · `ADD` | 복사하는 파일의 **내용(체크섬)** 이 바뀌었을 때. 수정 시각은 보지 않는다 |
| `ARG` · `ENV` | 값이 바뀌면 그 값을 쓰는 이후 명령 |
| 앞 층 | 위의 어느 층이든 무효화되면 이후 전부 |

캐시를 살리는 방법:

- 덜 바뀌는 것을 위에, 자주 바뀌는 것을 아래에 둔다. 의존성 목록(`package.json`, `go.mod`, `pom.xml`)만 먼저 복사해 설치하고, 소스는 그 뒤에 복사한다.
- `.dockerignore`로 `.git`, 로그, 빌드 산출물을 빼서 쓸데없는 파일 변경이 COPY 캐시를 깨지 않게 한다. 빌드 컨텍스트 전송도 빨라진다.
- `apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*`처럼 갱신과 설치를 한 RUN에 묶는다. 나누면 update 층이 캐시되어 오래된 패키지 목록으로 설치한다.
- 강제로 새로 빌드하려면 `docker build --no-cache`, 베이스 이미지를 새로 받으려면 `--pull`.

### 레이어 수와 크기 줄이기

| 방법 | 이유 |
| --- | --- |
| 관련된 RUN을 `&&`로 묶고 같은 RUN 안에서 임시 파일을 지운다 | 다음 층에서 지우면 앞 층에 그대로 남는다(whiteout) |
| `--no-install-recommends`, `apk add --no-cache` | 권장 패키지와 패키지 캐시를 남기지 않는다 |
| 멀티 스테이지와 작은 실행 베이스 | 빌드 도구를 통째로 버린다 |
| 큰 정적 파일은 이미지 대신 오브젝트 스토리지·볼륨에 | 이미지를 작게 유지 |
| `docker history`, dive 같은 도구로 층별 크기 확인 | 무엇이 큰지 보고 줄인다 |

층 수 자체보다 각 층이 남기는 바이트가 중요하다. 층을 억지로 하나로 합치면 캐시를 잃는다.

## BuildKit

**BuildKit은 Docker의 현재 빌드 엔진**이다. Docker Engine 23.0부터 기본값이고, `docker build`는 BuildKit 클라이언트인 `docker buildx build`를 부른다. 옛 빌더는 폐기 예정이다.

| 기능 | 옛 빌더 | BuildKit |
| --- | --- | --- |
| 실행 | 명령을 위에서부터 순서대로 | 의존 관계 그래프로 분석해 **독립 스테이지를 병렬** 실행, 쓰지 않는 스테이지 생략 |
| 캐시 마운트 | 없음 | `RUN --mount=type=cache,target=/root/.npm`로 패키지 캐시를 빌드 사이에 유지(이미지에는 남지 않음) |
| 비밀 값 | ARG로 넘기면 이력에 남음 | `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc`로 빌드 중에만 노출 |
| SSH | 개인 키를 복사해야 했다 | `--mount=type=ssh`로 호스트의 SSH 에이전트 전달 |
| 원격 캐시 | 없음 | `--cache-to`·`--cache-from`으로 레지스트리·CI 캐시에 저장하고 불러오기 |
| 멀티 플랫폼 | 없음 | `--platform linux/amd64,linux/arm64`로 한 번에 빌드 |
| 출력 | 로컬 이미지만 | 레지스트리 푸시, tar, 로컬 디렉터리 |

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    go build -o /out/app ./cmd/app
```

## 이미지 관리

### 빌드와 주요 옵션

```text
docker build -t api:1.4.2 .
  1. 빌드 컨텍스트(. 아래 파일, .dockerignore 제외)를 빌더로 보낸다
  2. Dockerfile을 해석해 각 명령을 실행하고 층을 만든다 (캐시 확인)
  3. 층과 설정(CMD, ENV 등)을 묶은 이미지 매니페스트를 만들고 태그를 붙인다
```

| 옵션 | 뜻 |
| --- | --- |
| `-t 이름:태그` | 태그 붙이기. 여러 번 줄 수 있다 |
| `-f 경로` | Dockerfile 위치 |
| `--build-arg K=V` | ARG 값 |
| `--target 스테이지` | 특정 스테이지까지만 빌드(테스트 스테이지 등) |
| `--platform` | 대상 아키텍처 |
| `--no-cache` · `--pull` | 캐시 무시 · 베이스 이미지 새로 받기 |
| `--secret`, `--ssh` | 빌드 비밀·SSH 전달 |
| `--push` (buildx) | 빌드 후 바로 레지스트리로 |

### 태그 전략

| 태그 | 성격 | 쓰임 |
| --- | --- | --- |
| Git 커밋 해시 (`api:3f9c2a1`) | 불변, 코드와 일대일 | CI가 모든 빌드에 붙인다. 어떤 코드인지 바로 추적 |
| 시맨틱 버전 (`api:1.4.2`) | 릴리스 단위로 불변 | 릴리스 태그를 찍을 때. `1.4`, `1`처럼 움직이는 상위 태그를 함께 두기도 한다 |
| 환경·브랜치 (`api:main`, `api:staging`) | 움직인다 | 최신 빌드를 가리키는 편의용. 운영 배포 기준으로 쓰지 않는다 |
| `latest` | 움직이고, 최신이라는 보장도 없다 | 태그 없이 푸시하면 붙는 기본값일 뿐이다 |

운영 배포는 불변 태그나 다이제스트로 한다. 같은 태그를 덮어쓰면 노드마다 다른 이미지를 캐시해 다른 버전이 돌 수 있고 되돌릴 대상도 모호해진다. 레지스트리의 태그 불변(immutable tags) 설정으로 덮어쓰기를 막을 수 있다. CI에서 태그를 붙이는 방법은 [[ci-cd|CI/CD]]에 있다.

### 레지스트리에 올리고 받기

```bash
docker login ghcr.io -u <사용자> --password-stdin < token.txt   # 인증 정보는 표준 입력으로
docker tag api:1.4.2 ghcr.io/acme/api:1.4.2                     # 레지스트리 주소가 이름의 앞부분
docker push ghcr.io/acme/api:1.4.2                              # 레지스트리에 없는 층만 올라간다
docker pull ghcr.io/acme/api:1.4.2                              # 로컬에 없는 층만 내려온다
```

이미지 이름의 첫 부분이 레지스트리 주소이고, 생략하면 Docker Hub(`docker.io`)다.

| | Docker Hub (공개) | 비공개 레지스트리 |
| --- | --- | --- |
| 예 | `docker.io/library/nginx` | AWS ECR, GCP Artifact Registry, GitHub Container Registry, Harbor(자체 호스팅) |
| 장점 | 공식 이미지와 오픈 소스 배포의 기본 경로 | 접근 제어(IAM), 같은 클라우드 안에서 빠른 전송, 취약점 스캔·태그 불변·보존 정책, 내부 코드 보호 |
| 주의 | 익명·무료 계정은 내려받기 횟수 제한이 있다 | 인증 토큰 관리(ECR 토큰은 12시간 만료), 비용 |

공개 이미지는 Docker Hub에서, 사내 서비스 이미지는 비공개 레지스트리에 두고, 외부 이미지도 풀스루 캐시·미러로 비공개 레지스트리를 거쳐 받으면 횟수 제한과 외부 장애를 피한다.

### 댕글링 이미지와 정리

**댕글링(dangling) 이미지**는 태그가 없는 이미지(`<none>:<none>`)다. 같은 태그로 다시 빌드하면 태그가 새 이미지로 옮겨 가고 옛 이미지가 이름 없이 남는다.

```bash
docker images -f dangling=true
docker image prune                 # 댕글링 이미지 삭제
docker image prune -a              # 컨테이너가 쓰지 않는 모든 이미지 삭제
```

빌드 캐시와 볼륨까지 한 번에 정리하는 방법은 [[docker-container-operations|Docker 컨테이너 운영]]의 「디스크 정리」에 있다.

### 히스토리와 층 분석

```bash
docker history api:1.4.2                     # 층마다 만든 명령과 크기
docker history --no-trunc --format '{{.Size}}\t{{.CreatedBy}}' api:1.4.2
docker image inspect api:1.4.2 -f '{{.RootFS.Layers}}'
```

큰 층이 어느 명령에서 생겼는지 보고 줄인다. 히스토리에는 ARG·ENV 값과 명령이 그대로 보이므로, 여기서 비밀 값이 보이면 이미지를 폐기하고 비밀을 교체한다.

### save·load와 export·import

| 명령 | 다루는 것 | 쓰임 |
| --- | --- | --- |
| `docker save api:1.4.2 -o api.tar` / `docker load -i api.tar` | **이미지**(모든 층, 태그, 메타데이터)를 tar로 | 인터넷이 막힌 폐쇄망 서버로 이미지 옮기기, 레지스트리 없이 전달, 보관 |
| `docker export <컨테이너>` / `docker import` | **컨테이너의 파일 시스템**을 한 층으로 평평하게 | 층·이력·CMD 같은 메타데이터가 사라진다. 이미지 이전에는 save·load를 쓴다 |

## 시작 시간 줄이기

컨테이너 시작 시간은 이미지 받기 + 컨테이너 생성 + 앱 초기화의 합이다.

| 단계 | 줄이는 방법 |
| --- | --- |
| 이미지 받기 | 작은 이미지, 자주 바뀌지 않는 층을 아래에 둬 노드에 캐시된 층을 재사용, 노드에 미리 받아 두기, 같은 리전의 레지스트리, 필요한 파일부터 받는 지연 로딩(eStargz, SOCI) |
| 시작 명령 | 시작할 때 패키지 설치·다운로드·컴파일을 하지 않는다. 빌드할 때 끝내 이미지에 넣는다 |
| 앱 초기화 | 무거운 초기화를 지연, 연결 풀 워밍업을 readiness와 맞춘다. JVM은 CDS(클래스 데이터 공유)·AOT 캐시, 네이티브 이미지로 줄인다 |

## 정리

- 이미지는 불변 템플릿, 컨테이너는 그 실행이다. 데이터는 볼륨에 둔다.
- `RUN`은 빌드 때, `ENTRYPOINT`·`CMD`는 시작 때 실행된다. 시작 명령은 배열 형식으로 쓴다.
- 서버는 포그라운드로 실행해야 컨테이너가 꺼지지 않는다. 무한 대기 꼼수는 장애를 숨긴다.
- PID 1 문제는 tini·dumb-init이나 `--init`으로 푼다.
- 버전을 고정하고, 멀티 스테이지·`.dockerignore`로 작게, root가 아닌 사용자로, 캐시가 살도록 순서를 짠다.
- COPY가 기본이고 ADD는 압축 해제·검증된 내려받기에만 쓴다. ARG는 빌드 때만, ENV는 실행 중에도 남는다. 비밀은 둘 다 아니라 BuildKit secret mount로.
- 한 층의 캐시가 깨지면 아래가 모두 다시 빌드된다. BuildKit의 캐시 마운트·원격 캐시로 빌드를 줄인다.
- 운영 배포는 커밋 해시·시맨틱 버전 같은 불변 태그나 다이제스트로 한다.

관련 노트: [[vm-vs-container|VM과 컨테이너]], [[docker-compose|Docker Compose: 여러 컨테이너 묶어 띄우기]], [[docker-network-volume|Docker 네트워크와 볼륨]], [[docker-container-operations|Docker 컨테이너 운영]], [[ci-cd|CI/CD]], [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]
