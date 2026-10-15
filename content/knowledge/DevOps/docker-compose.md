---
title: "Docker Compose: 여러 컨테이너 묶어 띄우기"
concept: "Docker Compose"
summary: "compose.yaml 하나로 웹 서버·애플리케이션·DB 컨테이너를 정의하고 함께 띄우는 Docker Compose의 주요 키(build, ports·expose, depends_on, env_file, restart), 네트워크 드라이버(bridge·host·overlay), 볼륨 종류(named volume·bind mount·tmpfs), 점검 명령."
tags: ["docker", "devops", "container", "infra"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/8e5f46b5c0b144d5ac773446bbaf8ffa", "https://80000coding.notion.site/be3f7cdb6d2f4e868fb6968740be0256", "https://80000coding.notion.site/f863faecbc414713b46016117cbe9475", "https://80000coding.notion.site/d6e6ca38d41347baa80ba1b4f40886ab", "https://docs.docker.com/reference/compose-file/", "https://docs.docker.com/engine/storage/volumes/"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[Inception] docker orchestration with docker-compose」, 「Inception 참고자료」, 「[inception] 인셉션 테스트 가이드라인」, 「Inception 공부할때 유용했던 링크들」을 바탕으로 과제 풀이를 빼고 Compose 일반 개념만 재구성한 노트다.

## Docker Compose란

`docker run`은 컨테이너 하나를 띄운다. 실제 서비스는 웹 서버, 애플리케이션, DB처럼 여러 컨테이너가 서로 통신하며 동작하므로, 각각의 이미지·포트·환경 변수·볼륨·네트워크를 매번 긴 명령으로 맞추기 어렵다. **Docker Compose**는 이 구성을 YAML 파일 하나(`compose.yaml`)에 선언하고 `docker compose up` 한 번으로 전부 띄우는 도구다.

- 한 대의 호스트에서 여러 컨테이너를 묶어 관리한다. 여러 서버에 걸친 배치·자동 복구는 쿠버네티스 같은 오케스트레이터의 몫이다([[vm-vs-container|VM과 컨테이너]]).
- 현재 Compose는 Docker CLI 플러그인 `docker compose`(띄어쓰기)다. 예전의 독립 실행 파일 `docker-compose`(하이픈)는 지원이 끝났다.
- 파일 맨 위의 `version:` 키는 더 이상 쓰이지 않는다. 적어도 무시되고 경고만 나온다.

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
| `depends_on` | 시작 순서. 기본은 "컨테이너가 시작됨"만 기다리므로, 준비 완료까지 기다리려면 `condition: service_healthy` + `healthcheck` |
| `restart` | `no`(기본), `always`, `on-failure`, `unless-stopped`(직접 멈추기 전까지 재시작) |
| `init` | `true`면 tini를 PID 1로 넣는다([[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]]) |
| `profiles` | 지정한 프로필을 켤 때만 띄울 서비스. `docker compose --profile bonus up` |

같은 폴더의 `.env` 파일은 Compose가 자동으로 읽어 `${DB_NAME}`처럼 YAML 안의 변수 치환에도 쓴다. `env_file`은 그 값을 **컨테이너 안의 환경 변수**로 넣는 것이라 역할이 다르다.

## 네트워크

컨테이너는 기본적으로 격리되어 있어, 같은 네트워크에 연결된 컨테이너끼리만 통신한다. Compose는 따로 정하지 않아도 프로젝트마다 기본 bridge 네트워크를 하나 만든다.

| 드라이버 | 범위 | 쓰임 |
| --- | --- | --- |
| `bridge` | 한 호스트 | 기본값. 같은 호스트의 컨테이너끼리 이름으로 통신 |
| `host` | 한 호스트 | 컨테이너가 호스트의 네트워크를 그대로 쓴다. 격리가 없어지고 포트 매핑이 필요 없다 |
| `overlay` | 여러 호스트 | Swarm 등에서 여러 서버에 흩어진 컨테이너를 하나의 네트워크로 묶는다 |
| `none` | - | 네트워크 없음 |

서버 프로세스가 `127.0.0.1`에만 바인드되어 있으면 다른 컨테이너에서 접근할 수 없다. 컨테이너 안에서는 `0.0.0.0`(모든 인터페이스)으로 듣게 하고, 외부 노출은 `ports`로 통제한다.

## 볼륨: 데이터를 컨테이너 밖에 두기

컨테이너를 지우면 그 안에 쓴 데이터도 사라진다. DB 파일이나 업로드처럼 남겨야 할 데이터는 마운트로 밖에 둔다.

| 종류 | 관리 주체와 위치 | 쓰임 |
| --- | --- | --- |
| **named volume** | Docker가 관리. 리눅스에서는 `/var/lib/docker/volumes/` 아래 | DB 데이터 등 운영 데이터. 공식 문서가 권장하는 방식 |
| **bind mount** | 호스트의 특정 경로를 그대로 연결 | 개발 중 소스 코드 실시간 반영, 설정 파일 주입 |
| tmpfs | 메모리. 컨테이너가 멈추면 사라짐 | 남기면 안 되는 임시·민감 데이터 |

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
- 남길 데이터는 named volume, 개발 중 코드 공유는 bind mount.

관련 노트: [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]], [[vm-vs-container|VM과 컨테이너]], [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]
