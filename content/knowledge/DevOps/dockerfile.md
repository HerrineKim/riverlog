---
title: "Dockerfile 작성과 컨테이너의 PID 1"
concept: "Dockerfile"
summary: "이미지와 컨테이너의 관계, 베이스 이미지(Alpine·Debian) 고르기, RUN·CMD·ENTRYPOINT의 차이, 컨테이너가 바로 꺼지는 이유와 PID 1·좀비 프로세스 문제(tini·--init), Dockerfile을 디버깅하는 방법, 멀티 스테이지·.dockerignore·비root 사용자·캐시 순서 같은 이미지 모범 사례."
tags: ["docker", "devops", "container", "infra"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/f863faecbc414713b46016117cbe9475", "https://80000coding.notion.site/be3f7cdb6d2f4e868fb6968740be0256", "https://80000coding.notion.site/8e5f46b5c0b144d5ac773446bbaf8ffa", "https://80000coding.notion.site/d6e6ca38d41347baa80ba1b4f40886ab", "https://docs.docker.com/reference/dockerfile/", "https://blog.phusion.nl/2015/01/20/docker-and-the-pid-1-zombie-reaping-problem/", "https://bytebytego.com/guides/9-docker-best-practices-you-must-know", "https://docs.docker.com/build/building/best-practices/", "https://www.44bits.io/ko/post/how-docker-image-work", "https://www.44bits.io/ko/post/easy-deploy-with-docker", "https://github.com/nodejs/Release", "https://alpinelinux.org/releases/"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[inception] 인셉션 테스트 가이드라인」, 「Inception 참고자료」, 「[Inception] docker orchestration with docker-compose」, 「Inception 공부할때 유용했던 링크들」을 바탕으로 과제 풀이를 빼고 Docker 일반 개념만 재구성한 노트다. 「이미지 모범 사례」는 ByteByteGo의 System Design 101 가이드 「[9 Docker Best Practices You Must Know](https://bytebytego.com/guides/9-docker-best-practices-you-must-know)」를 Docker 공식 문서로 확인해 보강했다. 층과 OverlayFS, 태그·다이제스트, 배포 흐름은 「[만들면서 이해하는 도커(Docker) 이미지의 구조](https://www.44bits.io/ko/post/how-docker-image-work)」, 「[도커(Docker) 입문편](https://www.44bits.io/ko/post/easy-deploy-with-docker)」으로 보강했다.

## 이미지와 컨테이너

| | 이미지(image) | 컨테이너(container) |
| --- | --- | --- |
| 정체 | 실행에 필요한 파일·의존성·설정을 층(layer)으로 쌓은 **읽기 전용 템플릿** | 이미지를 실행한 **프로세스**. 위에 쓰기 가능한 층이 하나 얹힌다 |
| 비유 | 클래스, 설치 디스크 | 인스턴스, 설치된 프로그램 |
| 만드는 법 | `docker build`(Dockerfile) 또는 Docker Hub에서 `docker pull` | `docker run <이미지>` |
| 수명 | 바뀌지 않는다(불변) | 지우면 안의 변경도 사라진다. 남길 데이터는 볼륨에 둔다 |

Docker Hub의 공식 이미지(`nginx`, `mariadb`)를 그대로 쓸 수도 있고, Dockerfile로 직접 빌드한 커스텀 이미지를 레지스트리에 올려 쓸 수도 있다. VM과의 차이는 [[vm-vs-container|VM과 컨테이너]]에 있다.

### 층(layer)과 OverlayFS

이미지는 빌드 단계마다 생긴 **파일 변경분을 한 층씩** 쌓은 것이다. `RUN`·`COPY`·`ADD`처럼 파일을 바꾸는 명령이 층을 만들고, `CMD`·`ENV`·`EXPOSE` 같은 메타데이터 명령은 파일을 바꾸지 않는다. 층들을 하나의 디렉터리처럼 겹쳐 보여 주는 것이 **유니온 마운트**이고, 리눅스 커널의 OverlayFS(Docker의 기본 스토리지 드라이버 `overlay2`)가 이를 구현한다.

```text
merged    ← 컨테이너가 보는 최종 파일 시스템
  ▲
upperdir  ← 컨테이너의 쓰기 층 (컨테이너마다 하나, 지우면 사라짐)
lowerdir  ← 이미지의 읽기 전용 층들 (여러 컨테이너·이미지가 공유)
```

| 동작 | 일어나는 일 |
| --- | --- |
| 하위 층 파일 수정 | 파일을 upperdir로 **복사한 뒤** 고친다(copy-on-write). 원래 층은 그대로다. 큰 파일을 조금만 고쳐도 통째로 복사되므로, 자주 쓰는 데이터는 볼륨에 둔다 |
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

## 베이스 이미지: Alpine vs Debian

| | Alpine | Debian (slim) |
| --- | --- | --- |
| 크기 | 수 MB | 수십 MB |
| C 라이브러리 | musl | glibc |
| 패키지 관리자 | `apk` | `apt` |
| 장점 | 작고 공격 표면이 적다 | 호환성이 높고 자료가 많다 |
| 주의 | glibc를 전제로 한 바이너리·파이썬 휠이 안 맞을 수 있다 | 이미지가 크다 |

작은 이미지가 목표면 Alpine, 호환성 문제를 피하려면 Debian slim을 고른다. 어느 쪽이든 `latest` 대신 버전 태그를 고정해야 빌드가 재현된다.

## 컨테이너가 바로 꺼지는 이유

**컨테이너는 PID 1 프로세스가 살아 있는 동안만 산다.** 시작 명령이 끝나면 컨테이너도 종료된다.

- `nginx`, `php-fpm`, `mysqld`처럼 기본적으로 **백그라운드(데몬)로 빠지는** 서버는 실행 직후 PID 1이 끝나 버린다. `nginx -g 'daemon off;'`, `php-fpm -F`(`--nodaemonize`)처럼 **포그라운드 실행 옵션**을 줘야 한다.
- `tail -f /dev/null`, `sleep infinity`, `while true` 같은 무한 대기로 컨테이너를 살려 두는 것은 꼼수다. 실제 서비스가 죽어도 컨테이너는 살아 있어 장애를 감춘다.

## PID 1과 좀비 프로세스

리눅스에서 PID 1(init)에는 특별한 책임이 있다. 부모를 잃은 자식 프로세스를 넘겨받아 종료 상태를 회수(reap)하고, `SIGTERM` 같은 신호를 받으면 자식들을 정리하고 끝나야 한다. 일반 애플리케이션은 이 일을 하지 않도록 만들어져 있어서 PID 1로 띄우면 두 가지 문제가 생긴다.

| 문제 | 증상 |
| --- | --- |
| 좀비 프로세스 | 자식이 끝나도 회수되지 않아 프로세스 테이블에 쌓인다 |
| 신호 무시 | PID 1은 처리기를 등록하지 않은 신호를 기본 동작으로 받지 않는다. `docker stop`의 `SIGTERM`이 무시되어 10초 뒤 `SIGKILL`로 강제 종료된다 |

해결책은 신호 전달과 좀비 회수만 하는 **작은 init**을 PID 1로 두고 앱을 그 자식으로 띄우는 것이다.

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
- 설정을 바꿀 때마다 `exec`으로 들어가 고치지 말고, 파일을 `COPY`하도록 Dockerfile에 반영해 **`docker run`만으로 같은 상태가 재현되게** 한다.

## 이미지 모범 사례

좋은 이미지는 **작고, 재현되고, 권한이 적고, 빨리 빌드된다.**

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

## 정리

- 이미지는 불변 템플릿, 컨테이너는 그 실행이다. 데이터는 볼륨에 둔다.
- `RUN`은 빌드 때, `ENTRYPOINT`·`CMD`는 시작 때 실행된다. 시작 명령은 배열 형식으로 쓴다.
- 서버는 포그라운드로 실행해야 컨테이너가 꺼지지 않는다. 무한 대기 꼼수는 장애를 숨긴다.
- PID 1 문제는 tini·dumb-init이나 `--init`으로 푼다.
- 버전을 고정하고, 멀티 스테이지·`.dockerignore`로 작게, root가 아닌 사용자로, 캐시가 살도록 순서를 짠다.

관련 노트: [[vm-vs-container|VM과 컨테이너]], [[docker-compose|Docker Compose: 여러 컨테이너 묶어 띄우기]], [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]
