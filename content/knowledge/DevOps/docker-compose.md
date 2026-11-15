---
title: "Docker Compose: 여러 컨테이너 묶어 띄우기"
concept: "Docker Compose"
summary: "compose.yaml 하나로 웹 서버·애플리케이션·DB 컨테이너를 정의하고 함께 띄우는 Docker Compose의 최상위 구성, 서비스 주요 키, 환경 변수 관리(.env·environment·env_file 우선순위), depends_on과 healthcheck로 시작 순서 제어, 네트워크 분리, 볼륨 공유, 여러 파일 겹치기, 스케일링, secrets, 점검 명령."
tags: ["docker", "devops", "container", "infra"]
source: other
date: "2026-10-31"
sources: ["https://80000coding.notion.site/8e5f46b5c0b144d5ac773446bbaf8ffa", "https://80000coding.notion.site/be3f7cdb6d2f4e868fb6968740be0256", "https://80000coding.notion.site/f863faecbc414713b46016117cbe9475", "https://80000coding.notion.site/d6e6ca38d41347baa80ba1b4f40886ab", "https://docs.docker.com/reference/compose-file/", "https://docs.docker.com/engine/storage/volumes/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/docker.md", "https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/", "https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/", "https://docs.docker.com/compose/how-tos/startup-order/", "https://gist.github.com/anarcher/a6727f8948a0452239a3", "http://slides.com/seapy/fig-use-story", "http://junolab.blogspot.kr/2014/09/fig-docker-fig-django.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[Inception] docker orchestration with docker-compose」, 「Inception 참고자료」, 「[inception] 인셉션 테스트 가이드라인」, 「Inception 공부할때 유용했던 링크들」을 바탕으로 과제 풀이를 빼고 Compose 일반 개념만 재구성한 노트다. 환경 변수 우선순위, 시작 순서, 파일 겹치기, 스케일링, secrets는 fru1tworld/cs-basic 모의 면접 질문 목록의 「[Docker](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/docker.md)」 항목이 묻는 개념을 Docker 공식 문서로 확인해 보강했다. Compose의 전신 fig는 「[fig 사용하기](https://gist.github.com/anarcher/a6727f8948a0452239a3)」, 「[fig 사용기](http://slides.com/seapy/fig-use-story)」, 「[Fig: Docker를 이용한 배포 툴](http://junolab.blogspot.kr/2014/09/fig-docker-fig-django.html)」로 보강했다.

## Docker Compose란

`docker run`은 컨테이너 하나를 띄운다. 실제 서비스는 웹 서버, 애플리케이션, DB처럼 여러 컨테이너가 서로 통신하며 동작하므로, 각각의 이미지·포트·환경 변수·볼륨·네트워크를 매번 긴 명령으로 맞추기 어렵다. **Docker Compose**는 이 구성을 YAML 파일 하나(`compose.yaml`)에 선언하고 `docker compose up` 한 번으로 전부 띄우는 도구다.

- 한 대의 호스트에서 여러 컨테이너를 묶어 관리한다. 여러 서버에 걸친 배치·자동 복구는 쿠버네티스 같은 오케스트레이터의 몫이다([[vm-vs-container|VM과 컨테이너]]).
- 현재 Compose는 Docker CLI 플러그인 `docker compose`(띄어쓰기)다. 예전의 독립 실행 파일 `docker-compose`(하이픈)는 지원이 끝났다.
- 파일 맨 위의 `version:` 키는 더 이상 쓰이지 않는다. 적어도 무시되고 경고만 나온다.
- 과거에는 Orchard의 **fig**(`fig.yml`, `fig up`)였다. 2014년 Docker가 Orchard를 인수해 fig가 Python으로 된 Compose v1(`docker-compose`)이 되었고, 지금의 Go로 다시 쓴 v2 플러그인으로 이어졌다. 당시 서비스끼리는 `links`로 잇고 데이터는 `volumes_from`으로 공유했는데, 둘 다 레거시가 되어 기본 네트워크의 서비스 이름 DNS와 이름 있는 볼륨으로 바뀌었다. 여러 호스트로 넓히는 일은 Compose가 아니라 Swarm 스택과 쿠버네티스의 몫으로 정리됐다.

| 최상위 키 | 정의하는 것 |
| --- | --- |
| `services` | 띄울 컨테이너들. 서비스마다 이미지·빌드·포트·환경 변수·볼륨·네트워크를 적는다. 유일한 필수 키 |
| `networks` | 서비스가 붙을 네트워크. 생략하면 프로젝트 기본 네트워크 하나 |
| `volumes` | 이름 붙은 볼륨. 여러 서비스가 함께 쓸 수 있다 |
| `secrets` · `configs` | 비밀 값·설정 파일을 컨테이너에 파일로 넣는다 |
| `name` | 프로젝트 이름. 생략하면 폴더 이름. 컨테이너·네트워크 이름의 접두사가 된다 |

`docker run` 명령을 여러 번 치는 것과 비교한 장점은 구성이 코드로 남아 버전 관리되고, 네트워크·볼륨이 자동으로 만들어지고 이어지며, `up`·`down` 한 번으로 전체를 만들고 지우고, 팀원 누구나 같은 개발 환경을 띄운다는 것이다.

## 예시: Nginx + PHP-FPM + MariaDB

```yaml
services:
  nginx:
    build: ./requirements/nginx        # 이 폴더의 Dockerfile로 이미지 빌드
    ports: ["443:443"]                 # 호스트 443 → 컨테이너 443. 외부에 공개되는 유일한 서비스
    volumes: [wordpress:/var/www/html]
    depends_on: [wordpress]
    restart: unless-stopped
    networks: [backend]

  wordpress:
    build: ./requirements/wordpress
    expose: ["9000"]                   # 같은 네트워크의 컨테이너에만 문서상 공개
    env_file: .env
    volumes: [wordpress:/var/www/html]
    depends_on:
      mariadb:
        condition: service_healthy     # DB가 healthcheck를 통과한 뒤 시작
    restart: unless-stopped
    networks: [backend]

  mariadb:
    build: ./requirements/mariadb
    env_file: .env
    volumes: [db:/var/lib/mysql]
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect"]
      interval: 5s
    restart: unless-stopped
    networks: [backend]

volumes:
  wordpress:
  db:

networks:
  backend:
    driver: bridge
```

웹 요청은 Nginx가 받고, `.php` 요청은 FastCGI로 `wordpress:9000`의 PHP-FPM에 넘긴다. 같은 Compose 네트워크 안에서는 **서비스 이름이 곧 호스트 이름**이 되므로 IP 대신 `wordpress`, `mariadb`로 서로를 찾는다. Nginx가 정적 파일과 PHP 요청을 나누는 구조는 [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]의 리버스 프록시와 같다.

## 서비스의 주요 키

| 키 | 뜻 |
| --- | --- |
| `image` / `build` | 가져올 이미지 / 빌드할 Dockerfile 경로. 둘 다 쓰면 빌드한 이미지에 그 이름을 붙인다 |
| `container_name` | 컨테이너 이름 고정. 생략하면 `프로젝트-서비스-번호` |
| `ports` | `호스트:컨테이너` 포트 매핑. **호스트 바깥에서 접근** 가능해진다 |
| `expose` | 같은 네트워크의 다른 컨테이너용 포트 표시. 호스트에 공개하지 않는다 |
| `environment` / `env_file` | 환경 변수 직접 지정 / 파일에서 읽기. 비밀번호는 `.env`에 두고 `.gitignore`에 넣는다 |
| `depends_on` | 시작 순서. 아래 「시작 순서와 healthcheck」 참고 |
| `restart` | `no`(기본), `always`, `on-failure`, `unless-stopped`(직접 멈추기 전까지 재시작) |
| `init` | `true`면 tini를 PID 1로 넣는다([[dockerfile\|Dockerfile 작성과 컨테이너의 PID 1]]) |
| `profiles` | 지정한 프로필을 켤 때만 띄울 서비스. `docker compose --profile bonus up` |

## 환경 변수 관리

| 방법 | 들어가는 곳 | 쓰임 |
| --- | --- | --- |
| 프로젝트의 `.env` 파일 | **Compose 파일의 변수 치환**(`${DB_TAG}`)과 Compose 설정(`COMPOSE_PROJECT_NAME`) | 환경마다 다른 이미지 태그·포트를 파일 밖에서 바꾸기. 컨테이너 안에는 자동으로 들어가지 않는다 |
| `environment` | 컨테이너의 환경 변수 | 서비스마다 몇 개 안 되는 값을 파일에 직접 |
| `env_file` | 컨테이너의 환경 변수 | 값이 많거나 비밀번호처럼 Git에 넣지 않을 값을 파일로 분리 |

```yaml
services:
  api:
    image: "acme/api:${API_TAG:-latest}"   # .env나 셸 환경 변수로 치환, 없으면 기본값
    env_file: [.env.api]                  # 컨테이너 안으로
    environment:
      LOG_LEVEL: info                     # env_file보다 우선
```

같은 변수가 여러 곳에 있으면 컨테이너 안의 값은 **`docker compose run -e` > `environment` > `env_file` > 이미지의 `ENV`** 순으로 정해진다. 치환에서는 셸의 환경 변수가 `.env` 파일보다 우선한다. 다른 파일을 쓰려면 `docker compose --env-file .env.prod up`을 쓴다. 비밀번호가 든 파일은 `.gitignore`에 넣고, 운영에서는 아래 `secrets`를 쓴다.

## 시작 순서와 healthcheck

`depends_on`은 시작 순서를 정한다. 기본형(`depends_on: [db]`)은 **db 컨테이너가 시작되기만 하면** api를 띄운다. DB 프로세스가 연결을 받을 준비가 됐는지는 기다리지 않아, 앱이 첫 연결에 실패하는 일이 흔하다.

```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy            # db의 healthcheck가 healthy가 된 뒤
        restart: true                         # db가 다시 시작되면 api도 다시 시작
      migrate:
        condition: service_completed_successfully   # 마이그레이션이 0으로 끝난 뒤
  db:
    image: postgres:17
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s
  migrate:
    image: acme/api:1.4.2
    command: ["npm", "run", "migrate"]
    depends_on: { db: { condition: service_healthy } }
```

| condition | 기다리는 것 |
| --- | --- |
| `service_started` (기본) | 컨테이너 시작 |
| `service_healthy` | healthcheck 통과 |
| `service_completed_successfully` | 컨테이너가 종료 코드 0으로 끝남(초기화·마이그레이션 작업) |

한계도 있다. `depends_on`은 처음 띄울 때의 순서만 다루고, 실행 중에 DB가 잠깐 끊기는 상황은 막지 못한다. 앱이 연결 재시도를 갖춰야 한다. 또 Compose는 한 호스트 안의 순서만 다룬다. healthcheck 옵션의 뜻은 [[dockerfile|Dockerfile 노트]]의 HEALTHCHECK와 같다.

## 네트워크

Compose는 따로 정하지 않아도 프로젝트마다 기본 bridge 네트워크(`<프로젝트>_default`)를 하나 만들고 모든 서비스를 붙인다. 이것은 사용자 정의 네트워크라서 Docker 내장 DNS가 서비스 이름을 IP로 풀어 준다. 서비스를 여러 개로 늘리면 같은 이름에 IP가 여러 개 돌아와 라운드 로빈된다.

```yaml
services:
  web: { networks: [front] }
  api: { networks: [front, back] }       # 두 네트워크 모두에 붙어 중계
  db:  { networks: [back] }              # web에서는 db가 보이지 않는다
networks:
  front:
  back:
    internal: true                       # 외부로 나가는 경로 없음
```

네트워크를 나누면 서비스 간 접근 범위를 제한할 수 있다. 서버 프로세스가 `127.0.0.1`에만 바인드되어 있으면 다른 컨테이너에서 접근할 수 없다. 컨테이너 안에서는 `0.0.0.0`(모든 인터페이스)으로 듣게 하고, 외부 노출은 `ports`로 통제한다. 드라이버(bridge·host·overlay·none)의 차이, 내장 DNS, 포트 공개의 원리는 [[docker-network-volume|Docker 네트워크와 볼륨]]에 있다.

## 볼륨: 데이터를 컨테이너 밖에 두기

컨테이너를 지우면 그 안에 쓴 데이터도 사라진다. DB 파일이나 업로드처럼 남겨야 할 데이터는 마운트로 밖에 둔다. 운영 데이터는 최상위 `volumes`에 선언한 **named volume**, 개발 중 소스 코드는 **bind mount**(`./src:/app/src`), 남기면 안 되는 임시 데이터는 tmpfs를 쓴다. 세 방식의 차이와 볼륨 수명·드라이버는 [[docker-network-volume|Docker 네트워크와 볼륨]]에 있다.

named volume을 쓰면서 저장 위치를 호스트의 정해진 폴더로 지정하고 싶으면 local 드라이버 옵션으로 bind한다.

```yaml
volumes:
  db:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /home/user/data/db      # 미리 만들어 둔 폴더여야 한다
```

### 서비스 간 볼륨 공유

같은 named volume을 여러 서비스에 마운트하면 데이터를 함께 쓴다. 위 예시에서 `wordpress` 볼륨을 Nginx와 PHP-FPM이 함께 쓰는 것이 그 예다. 읽기만 하는 쪽은 `:ro`를 붙인다.

```yaml
services:
  app:    { volumes: [uploads:/srv/uploads] }
  backup: { volumes: [uploads:/data:ro] }
volumes:
  uploads:
```

다른 컨테이너의 볼륨을 통째로 물려받는 `volumes_from`도 있지만, 무엇이 공유되는지 파일에서 드러나지 않고 상대 서비스의 마운트 구성에 묶인다. 공유할 볼륨에 이름을 붙여 명시적으로 마운트하는 방식이 그 대안이다.

## 여러 Compose 파일 겹치기

공통 구성은 `compose.yaml`에 두고 환경별 차이만 다른 파일로 덮는다.

| 방식 | 동작 |
| --- | --- |
| `compose.override.yaml` | 같은 폴더에 있으면 `docker compose up`이 **자동으로** 겹친다. 개발용 바인드 마운트·디버그 포트를 둔다 |
| `-f` 여러 개 | `docker compose -f compose.yaml -f compose.prod.yaml up -d`. 뒤에 쓴 파일이 앞을 덮는다. 이때 override 파일은 자동으로 읽지 않는다 |
| `include` | 다른 Compose 파일(다른 팀의 서비스 묶음)을 통째로 가져온다 |
| `extends` | 다른 서비스 정의를 상속해 일부만 바꾼다 |

겹칠 때 `image`·`command` 같은 단일 값은 **교체**되고, `environment`·`labels`는 키별로, `volumes`는 컨테이너 경로별로 **병합**되며, `ports`·`expose` 같은 목록은 이어 붙는다. 결과가 헷갈리면 `docker compose -f … config`로 최종 구성을 확인한다.

## 스케일링

```bash
docker compose up -d --scale worker=3     # 또는 서비스에 deploy.replicas: 3
```

| 주의점 | 이유 |
| --- | --- |
| `container_name`을 지정하지 않는다 | 이름이 고정이면 두 번째 컨테이너를 만들 수 없다 |
| 호스트 포트를 고정하지 않는다 | `"8080:80"`이면 두 번째 컨테이너가 같은 호스트 포트를 못 잡는다. 포트 범위(`"8080-8082:80"`)를 주거나, 앞에 리버스 프록시를 두고 복제 서비스는 포트를 공개하지 않는다 |
| 상태를 컨테이너에 두지 않는다 | 복제본끼리 볼륨을 같이 쓰면 쓰기 충돌이 난다. 워커처럼 상태 없는 서비스만 늘린다 |
| 한 호스트 안의 확장이다 | 호스트 자원이 한계이고, 호스트가 죽으면 모두 죽는다. 여러 서버로 늘리려면 Swarm·쿠버네티스 |

## 비밀 값: secrets

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password   # 공식 이미지는 *_FILE 변수를 지원
    secrets: [db_password]
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

secrets는 값을 환경 변수가 아니라 컨테이너의 `/run/secrets/<이름>` 파일로 넣어, `docker inspect`나 자식 프로세스 환경에 노출되지 않게 한다. Swarm에서는 같은 문법이 암호화된 Swarm secrets로 동작한다([[docker-container-operations|Docker 컨테이너 운영]]).

## 점검과 디버깅

```bash
docker compose config        # 변수 치환이 끝난 최종 설정 출력. YAML 문법 오류도 여기서 잡힌다
docker compose up -d --build # 이미지를 다시 빌드하고 백그라운드로 띄우기
docker compose ps            # 서비스별 상태
docker compose logs -f wordpress
docker compose exec mariadb sh
docker compose down          # 컨테이너·네트워크 삭제 (볼륨은 남는다. -v를 주면 볼륨까지)
docker network ls; docker volume ls
```

## 정리

- Compose는 여러 컨테이너의 구성을 YAML 하나로 선언하고 `docker compose up`으로 띄운다. `version:` 키와 `docker-compose`는 옛 방식이다.
- 같은 네트워크에서는 서비스 이름으로 통신한다. 외부 공개는 `ports`, 내부용은 `expose`.
- `depends_on`은 시작 순서일 뿐이다. 준비 완료를 기다리려면 healthcheck를 건다.
- 남길 데이터는 named volume, 개발 중 코드 공유는 bind mount. 볼륨 공유는 `volumes_from` 대신 이름 붙은 볼륨으로.
- `.env`는 Compose 파일의 치환용, `env_file`·`environment`는 컨테이너용이다. 비밀은 `secrets`로 파일로 넣는다.
- 환경별 차이는 override 파일·`-f` 겹치기로, 스케일링은 고정 이름·고정 호스트 포트를 피해서 한다.

관련 노트: [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]], [[docker-network-volume|Docker 네트워크와 볼륨]], [[docker-container-operations|Docker 컨테이너 운영]], [[vm-vs-container|VM과 컨테이너]], [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]
