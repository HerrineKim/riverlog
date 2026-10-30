---
title: "Docker 컨테이너 운영: 자원 제한, 보안, 로그, 장애 진단"
concept: "Container Operations"
summary: "cgroups로 CPU·메모리·I/O·PID를 제한하는 옵션과 CPU 스로틀링·OOM의 원리, 컨테이너 격리를 보강하는 비root 실행·rootless 모드·capability·seccomp·AppArmor·SELinux, Docker 소켓과 Docker in Docker의 위험, 비밀 값 전달과 이미지 스캔·서명, 로깅 드라이버와 로그 회전, docker stats·events·Prometheus 모니터링, 종료 코드·재시작 정책·exec·diff·cp·prune을 이용한 장애 진단을 정리한다."
tags: ["docker", "devops", "container", "security", "monitoring"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/docker.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md", "https://docs.docker.com/engine/containers/resource_constraints/", "https://docs.docker.com/engine/security/", "https://docs.docker.com/engine/security/rootless/", "https://docs.docker.com/engine/security/seccomp/", "https://docs.docker.com/engine/logging/configure/", "https://docs.docker.com/engine/containers/start-containers-automatically/", "https://www.docker.com/blog/docker-content-trust-retirement-and-migration-guidance/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Docker](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/docker.md)」, 「[기타](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md)」(가상화 및 컨테이너) 항목이 묻는 개념을 Docker 공식 문서로 확인해 정리한 노트다.

컨테이너는 호스트 커널을 공유하는 프로세스다. 그래서 운영의 핵심 질문은 **한 컨테이너가 이웃과 호스트에 얼마나 영향을 줄 수 있나**(자원, 보안)와 **문제가 났을 때 무엇을 보나**(로그, 지표, 상태)다. 컨테이너를 격리하는 커널 기능(네임스페이스, cgroups)의 개요는 [[virtualization|가상화와 하이퍼바이저]]에 있다.

## 자원 제한: cgroups

**cgroups(control groups)는 프로세스 묶음이 쓰는 CPU·메모리·I/O·프로세스 수를 제한하고 측정하는 리눅스 커널 기능**이다. 네임스페이스가 「무엇이 보이나」를 격리한다면 cgroups는 「얼마나 쓸 수 있나」를 제한한다. Docker는 컨테이너마다 cgroup을 만들고, 실행 옵션을 그 cgroup의 값(cgroup v2의 `cpu.max`, `memory.max`, `io.max`, `pids.max`)으로 옮긴다. 아무 옵션도 주지 않으면 **제한이 없어** 컨테이너 하나가 호스트 자원을 모두 쓸 수 있다.

```bash
docker run -d --name api \
  --cpus=1.5 \
  --memory=512m --memory-swap=512m \
  --pids-limit=256 \
  --device-write-bps /dev/nvme0n1:50mb \
  myapi:1.0
```

### CPU

| 옵션 | 동작 | 성격 |
| --- | --- | --- |
| `--cpus=1.5` | 주기(기본 100ms)마다 CPU 시간 150ms까지(CFS 쿼터) | **상한**. 호스트가 한가해도 넘지 못한다 |
| `--cpu-shares=512` | 경합할 때 CPU 시간을 나누는 상대 가중치(기본 1024) | **경합 시에만** 적용. 한가하면 얼마든지 쓴다 |
| `--cpuset-cpus=0,1` | 쓸 수 있는 코어를 고정 | 캐시 지역성, 다른 워크로드와 코어 분리 |

### 메모리와 OOM

| 옵션 | 동작 |
| --- | --- |
| `--memory=512m` | 하드 상한. 넘으면 커널 OOM killer가 컨테이너 cgroup 안의 프로세스를 죽인다 |
| `--memory-swap` | 메모리 + 스왑 합계. `--memory`와 같게 주면 스왑을 쓰지 않는다. 생략하면 메모리만큼 스왑을 더 쓸 수 있다 |
| `--memory-reservation` | 소프트 한도. 호스트 메모리가 부족할 때 이 값까지 줄이도록 회수한다 |
| `--oom-kill-disable` | OOM kill을 끈다. `--memory` 없이 쓰면 호스트가 멈출 수 있어 위험하다 |

메모리 상한을 넘으면 OOM killer가 cgroup 안에서 가장 큰 프로세스를 `SIGKILL`로 죽인다. 그것이 PID 1이면 컨테이너가 **종료 코드 137**로 끝나고 `docker inspect`의 `State.OOMKilled`가 `true`가 된다. 자식 프로세스만 죽으면 컨테이너는 살아 있고 일부 기능만 사라질 수 있다. JVM·Node.js처럼 힙 크기를 따로 정하는 런타임은 컨테이너 한도를 인식하게 하고(JVM의 `-XX:MaxRAMPercentage`), 힙 밖 메모리까지 고려해 한도를 잡는다.

### I/O와 PID

| 옵션 | 동작 |
| --- | --- |
| `--device-read-bps` · `--device-write-bps` | 장치별 초당 읽기·쓰기 바이트 상한 |
| `--device-read-iops` · `--device-write-iops` | 장치별 초당 I/O 횟수 상한 |
| `--blkio-weight` | 경합 시 I/O 상대 가중치(10~1000). 커널 I/O 스케줄러에 따라 효과가 다르다 |
| `--pids-limit=256` | 컨테이너 안 프로세스·스레드 수 상한 |

**포크 폭탄**(`:(){ :|:& };:`처럼 자신을 끝없이 복제하는 프로세스)은 호스트의 PID를 고갈시켜 다른 컨테이너와 호스트까지 새 프로세스를 만들지 못하게 한다. `--pids-limit`을 두면 한도에서 `fork`가 실패하고 피해가 그 컨테이너에 그친다. `--ulimit nproc`은 호스트 전체에서 같은 UID의 프로세스를 세므로 컨테이너별 제한으로는 부정확하다.

### CPU 스로틀링: 호스트가 한가한데 느린 이유

`--cpus`(쿠버네티스의 CPU limits)는 「코어 몇 개」가 아니라 **주기마다 쓸 수 있는 CPU 시간**이다. `--cpus=1`인 컨테이너에서 스레드 4개가 동시에 돌면 100ms 쿼터를 25ms 만에 다 쓰고, 나머지 75ms는 호스트 CPU가 놀고 있어도 멈춘다. 평균 CPU 사용률은 낮아 보이는데 응답 지연의 꼬리(p99)가 튄다.

```bash
cat /sys/fs/cgroup/cpu.stat          # 컨테이너 안에서 (cgroup v2)
# nr_periods 12000
# nr_throttled 3100                  ← 스로틀링된 주기 수
# throttled_usec 98000000            ← 멈춰 있던 총 시간
```

`nr_throttled / nr_periods` 비율이 높으면 스로틀링이 지연의 원인이다. 쿠버네티스에서는 `container_cpu_cfs_throttled_periods_total` 지표로 본다. 해결은 상한을 올리거나 없애고(경합 보호는 shares·requests로), 런타임의 스레드 수를 컨테이너 한도에 맞추는 것이다. Go는 1.25부터 GOMAXPROCS가 cgroup CPU 상한을 반영하고, JVM은 컨테이너 한도를 보고 GC·스레드 풀 크기를 정한다.

### 실시간 모니터링: docker stats

```bash
docker stats                          # 실행 중인 컨테이너 전체, 계속 갱신
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.PIDs}}"
```

| 열 | 뜻 |
| --- | --- |
| CPU % | 호스트 코어 하나를 100%로 본 사용률. 코어 4개를 다 쓰면 400% |
| MEM USAGE / LIMIT | 사용량(회수 가능한 페이지 캐시 제외)과 한도. 한도가 없으면 호스트 전체 메모리가 보인다 |
| NET I/O · BLOCK I/O | 누적 네트워크·디스크 입출력 |
| PIDS | 프로세스·스레드 수 |

`docker stats`는 지금 값만 보여 준다. 추세와 알림은 아래 「지표 수집」의 도구가 맡는다.

## 보안

### 컨테이너의 위험 요소

컨테이너는 커널을 공유하므로 **격리의 강도는 커널과 설정에 달려 있다.** 같은 호스트의 컨테이너가 서로 간섭하는 길과 막는 방법을 정리하면 다음과 같다.

| 위험 | 막는 방법 |
| --- | --- |
| 자원 독점(CPU·메모리·PID·디스크 고갈)으로 이웃을 굶김 | cgroups 제한, 로그 회전, 디스크 사용량 감시 |
| 컨테이너 안 root가 탈출하면 호스트 root | 비root 사용자, rootless 모드나 사용자 네임스페이스 |
| 위험한 시스템 콜·커널 기능 사용 | capability 축소, seccomp, AppArmor·SELinux, `no-new-privileges` |
| `--privileged`, 호스트 경로·Docker 소켓 마운트 | 쓰지 않는다. 꼭 필요한 장치·경로만 |
| 같은 네트워크의 다른 컨테이너 공격 | 네트워크 분리, ICC 끄기([[docker-network-volume\|Docker 네트워크와 볼륨]]) |
| 커널 취약점 하나로 모든 컨테이너가 위험 | 커널 패치. 신뢰할 수 없는 코드는 gVisor 같은 샌드박스 런타임이나 Kata Containers·Firecracker 같은 경량 VM으로 격리 |
| 이미지 속 취약점·악성 코드, 비밀 값 유출 | 신뢰할 수 있는 베이스, 스캔, 서명 검증, 비밀은 이미지 밖으로 |

### 비root 실행

컨테이너 안 프로세스는 기본으로 root(UID 0)로 돈다. 사용자 네임스페이스를 쓰지 않으면 **컨테이너 안 UID 0은 호스트의 UID 0과 같다.** capability가 줄어 있어 바로 호스트를 장악하지는 못하지만, 런타임·커널 취약점으로 탈출하거나 실수로 호스트 경로가 마운트되면 호스트 root 권한으로 이어진다. 바인드 마운트에 쓴 파일도 root 소유가 된다.

- Dockerfile에서 `USER 10001`처럼 숫자 UID로 비root 사용자를 지정한다([[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]]). 실행 시 `--user 10001:10001`로도 덮을 수 있다.
- 1024 미만 포트가 필요하면 root 대신 높은 포트를 쓰고 매핑하거나 `NET_BIND_SERVICE`만 준다.
- 쿠버네티스의 Restricted 파드 보안 기준은 비root 실행을 요구한다([[kubernetes-security|쿠버네티스 보안]]).

### rootless 모드

| | 기본 모드 | userns-remap | rootless 모드 |
| --- | --- | --- | --- |
| Docker 데몬 | root | root | **일반 사용자** |
| 컨테이너 안 root | 호스트 root | 호스트의 권한 없는 UID로 대응 | 호스트의 권한 없는 UID로 대응 |
| 데몬이 뚫리면 | 호스트 root | 호스트 root | 그 사용자 권한까지만 |

rootless 모드는 사용자 네임스페이스 안에서 데몬과 컨테이너를 모두 일반 사용자로 실행한다. 데몬·런타임 취약점이 터져도 호스트 root가 되지 않는 것이 핵심 이점이다. 대신 1024 미만 포트 바인드에 별도 설정이 필요하고, 네트워크가 사용자 공간 구현을 거쳐 조금 느리며, cgroup 자원 제한은 cgroup v2와 systemd 위임이 있어야 동작한다. Podman은 처음부터 rootless를 기본으로 설계됐다.

### capability, seccomp, LSM

리눅스는 root 권한을 40여 개의 **capability**로 쪼갠다. Docker는 기본으로 소수만 남긴다(`CHOWN`, `NET_BIND_SERVICE`, `SETUID`, `KILL` 등).

```bash
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE \
  --security-opt no-new-privileges \
  --read-only --tmpfs /tmp \
  myapi:1.0
```

| 장치 | 제한하는 것 | 기본 상태 |
| --- | --- | --- |
| capability | root 권한의 조각(네트워크 설정, 마운트, 커널 모듈 등) | 기본 집합만. `--cap-drop=ALL` 후 필요한 것만 더하는 것이 최소 권한이다. `SYS_ADMIN`은 사실상 root라 주지 않는다 |
| seccomp | 호출할 수 있는 **시스템 콜** | 기본 프로필이 `mount`, `reboot`, `kexec_load` 등 위험한 수십 개를 막는다. `--security-opt seccomp=profile.json`으로 더 좁힌다 |
| AppArmor | 프로그램별 파일·네트워크·capability 접근 | Ubuntu·Debian에서 `docker-default` 프로필 적용 |
| SELinux | 레이블 기반 강제 접근 제어 | RHEL·Fedora에서. 바인드 마운트는 `:z`·`:Z`로 레이블을 붙여야 접근된다 |
| `no-new-privileges` | setuid 바이너리로 권한을 올리는 것 | 기본 꺼짐. 켜 두는 것이 좋다 |

`--privileged`는 이 모든 제한을 풀고 호스트 장치까지 연다. 커널 접근 제어의 개념은 [[linux-access-control|리눅스 접근 제어]]에 있다.

### Docker 소켓 마운트의 위험

`-v /var/run/docker.sock:/var/run/docker.sock`은 컨테이너에 **Docker API 전체**를 준다. 그 컨테이너는 `docker run --privileged -v /:/host`로 호스트 루트 파일 시스템을 마운트한 새 컨테이너를 띄울 수 있으므로, 소켓 접근은 **호스트 root 권한과 같다.** 소켓을 `:ro`로 마운트해도 API 호출은 막히지 않는다. 같은 이유로 `docker` 그룹에 사용자를 넣는 것도 root를 주는 것이다.

| 필요 | 대안 |
| --- | --- |
| 리버스 프록시·모니터링이 컨테이너 목록을 읽어야 한다 | 허용한 API만 통과시키는 소켓 프록시를 두고 읽기 전용 엔드포인트만 연다 |
| CI에서 이미지를 빌드해야 한다 | 데몬 없이 빌드하는 도구(rootless BuildKit, Buildah), 원격 빌더 |
| 사용자에게 Docker를 쓰게 해야 한다 | rootless 모드 |

### Docker in Docker

**Docker in Docker(DinD)는 컨테이너 안에서 또 하나의 Docker 데몬을 돌리는 것**이다. 공식 `docker:dind` 이미지가 있어 CI에서 격리된 Docker 환경이 필요할 때 쓴다. 가상화와 달리 바깥 컨테이너와 안쪽 컨테이너가 같은 호스트 커널을 쓰므로 「Docker 위의 Docker」는 가능하지만 대가가 있다.

| | DinD (안에 데몬) | DooD (호스트 소켓 마운트) |
| --- | --- | --- |
| 구조 | 컨테이너 안에 별도 dockerd | 컨테이너 안 CLI가 호스트 dockerd를 부른다. 만든 컨테이너는 형제(sibling)로 호스트에 생긴다 |
| 권한 | `--privileged` 필요 | 소켓 접근 = 호스트 root |
| 이미지 캐시 | 안쪽에 따로. 매번 비어 있어 빌드가 느리다 | 호스트 캐시 공유 |
| 기타 문제 | 스토리지 드라이버 중첩(overlay 위 overlay), cgroup 중첩 | 바인드 마운트 경로가 컨테이너가 아니라 호스트 기준이라 헷갈린다 |

이미지 빌드가 목적이면 데몬 없이 빌드하는 도구가 더 안전하다. 진짜로 컨테이너를 중첩해야 하면 Sysbox처럼 특권 없이 중첩을 지원하는 런타임을 쓴다. CI에서의 쓰임은 [[ci-cd|CI/CD]]에 있다.

### 비밀 값 전달

| 방법 | 평가 |
| --- | --- |
| Dockerfile의 `ENV`·`ARG`, 이미지에 파일 복사 | **하지 않는다.** `docker history`·`docker inspect`나 이미지 층에 영구히 남는다 |
| `docker run -e PASSWORD=...` | 편하지만 `docker inspect`와 자식 프로세스 환경에 보인다 |
| 빌드 비밀 `RUN --mount=type=secret,id=npmrc` | 빌드 중에만 파일로 보이고 층에 남지 않는다 |
| Compose `secrets` | 파일을 컨테이너의 `/run/secrets/<이름>`에 마운트한다 |
| Swarm secrets | 매니저의 Raft 로그에 암호화해 저장하고, 허가한 서비스의 컨테이너에만 `/run/secrets/` tmpfs로 넣는다 |
| 외부 비밀 저장소 | Vault·클라우드 Secrets Manager에서 실행 시 받아 온다 |

앱은 환경 변수 대신 파일(`DB_PASSWORD_FILE=/run/secrets/db_password`)에서 읽게 만드는 것이 좋다. 비밀 관리 원칙은 [[devsecops|DevSecOps]]에 있다.

### 이미지 공급망: 베이스 선택, 스캔, 서명

| 단계 | 방법 |
| --- | --- |
| 신뢰할 수 있는 베이스 | Docker 공식 이미지, 검증된 배포자, 하드닝 이미지(Docker Hardened Images, Chainguard), distroless. 작을수록 취약점이 적다 |
| 고정과 갱신 | 태그·다이제스트로 고정하되, 베이스의 보안 패치를 받으려고 **정기적으로 다시 빌드**한다. Dependabot·Renovate가 베이스 태그 갱신 PR을 만든다 |
| 사내 레지스트리 | 외부 이미지를 미러링하고 스캔을 통과한 것만 쓰게 한다 |
| 취약점 스캔 | Trivy, Grype, Docker Scout, Snyk가 OS 패키지와 언어 의존성을 CVE DB와 대조한다. 새 CVE는 계속 나오므로 배포 후에도 레지스트리의 이미지를 다시 스캔한다 |
| 서명과 출처 | Sigstore Cosign·Notation으로 서명하고, 배포 시 서명과 빌드 출처 증명(provenance), SBOM을 검증한다 |

**이미지 서명**은 이미지가 정해진 빌드 파이프라인에서 나왔고 그 뒤로 바뀌지 않았음을 보장한다. 레지스트리가 뚫리거나 태그가 다른 이미지로 바뀌어도 서명 검증에서 걸린다. Docker의 옛 서명 기능 **Docker Content Trust**(`DOCKER_CONTENT_TRUST=1`, Notary v1 기반)는 2025년부터 폐기 절차에 들어갔고, 서명은 Cosign·Notation으로 옮겨 가고 있다. CI에서 스캔을 거는 방법은 [[ci-cd|CI/CD]]에 있다.

## 로그

### 로깅 드라이버

컨테이너의 stdout·stderr는 로깅 드라이버가 받아 저장하거나 보낸다.

| 드라이버 | 저장·전송 | 특징 |
| --- | --- | --- |
| `json-file` | 호스트 파일(JSON 줄) | 기본값. **회전 설정이 기본으로 꺼져 있다** |
| `local` | 호스트 파일(압축된 내부 형식) | 기본으로 회전·압축한다. 단일 호스트에 권장 |
| `journald` · `syslog` | systemd 저널, syslog | 호스트의 기존 로그 체계와 통합 |
| `fluentd` · `gelf` | Fluentd, Graylog 등 수집기 | 중앙 수집 |
| `awslogs` · `gcplogs` · `splunk` | 클라우드·상용 로깅 서비스 | 해당 서비스로 바로 |
| `none` | 버림 | - |

원격 드라이버를 써도 Docker가 로컬 캐시를 함께 남겨(dual logging) `docker logs`로 볼 수 있다. 드라이버가 느릴 때 앱이 로그 쓰기에서 막히지 않게 `mode: non-blocking`과 버퍼 크기를 줄 수 있다(버퍼가 차면 로그를 버린다).

```bash
docker logs -f --tail 100 --since 30m -t api    # 따라가기, 마지막 100줄, 30분 전부터, 시각 표시
```

### 로그 회전과 디스크 포화 예방

기본 `json-file`은 회전하지 않아 오래 도는 컨테이너의 로그가 `/var/lib/docker/containers/<id>/<id>-json.log`에 무한히 쌓인다. 디스크가 차면 그 호스트의 **모든 컨테이너**와 데몬이 쓰기 실패로 멈춘다.

```json
// /etc/docker/daemon.json: 이후 새로 만드는 컨테이너에 적용
{
  "log-driver": "local",
  "log-opts": { "max-size": "20m", "max-file": "5" }
}
```

```bash
docker run --log-opt max-size=10m --log-opt max-file=3 myapi:1.0   # 컨테이너별 지정
```

| 예방책 | 이유 |
| --- | --- |
| 데몬 기본값에 회전 설정 | 데몬 설정은 **이미 만든 컨테이너에는 적용되지 않으므로** 처음부터 둔다. 바꾼 뒤에는 컨테이너를 다시 만든다 |
| 중앙 수집으로 보내고 로컬은 짧게 | 로컬은 디버깅용 최근 로그만 |
| 앱은 stdout으로만 | 컨테이너 안 파일로 쓰면 회전도 수집도 안 되고 쓰기 층을 키운다 |
| 로그 수준과 반복 로그 관리 | 디버그 로그·루프 안 로그가 폭증의 흔한 원인 |
| 디스크 사용률 알림 | `/var/lib/docker` 사용량을 감시하고 `docker system df`로 내역을 본다 |

## 지표 수집과 이벤트

| 도구 | 수집 대상 |
| --- | --- |
| `docker stats` | 지금 이 순간의 컨테이너 자원 사용량 |
| cAdvisor | 컨테이너별 CPU·메모리·네트워크·스로틀링을 Prometheus 형식으로 노출 |
| node-exporter | 호스트 OS 지표 |
| Docker 데몬 지표 | `daemon.json`의 `metrics-addr`로 엔진 자체 지표 노출 |
| 앱 `/metrics` | 요청 수·지연·오류 같은 애플리케이션 지표 |

Prometheus가 이 대상들을 주기적으로 긁어 와 저장하고, Grafana로 대시보드를 만들고, Alertmanager로 「메모리가 한도의 90%」, 「재시작 반복」 같은 알림을 보낸다. 수집 구조는 [[observability|관측 가능성]]에 있다.

```bash
docker events --since 1h --filter type=container --filter event=die --filter event=oom
docker events --format '{{.Time}} {{.Actor.Attributes.name}} {{.Action}}'
```

`docker events`는 데몬에서 일어나는 일(컨테이너 create·start·die·kill·oom·health_status, 이미지 pull, 네트워크·볼륨 변경)을 실시간으로 흘려 준다. OOM으로 죽은 시점 찾기, 재시작이 잦은 컨테이너 탐지, 누가 언제 컨테이너를 지웠나 같은 감사, 이벤트를 받아 알림·자동화를 거는 데 쓴다.

## 장애 진단

### 컨테이너가 시작되지 않을 때

```bash
docker ps -a --filter name=api                 # STATUS: Exited (1) 3 seconds ago
docker logs api                                # 앱이 남긴 마지막 말
docker inspect -f '{{.State.ExitCode}} {{.State.Error}} {{.State.OOMKilled}}' api
docker run -it --rm --entrypoint sh myapi:1.0  # 시작 명령을 셸로 바꿔 안을 살펴보기
```

| 증상 | 원인 |
| --- | --- |
| `port is already allocated` | 호스트 포트를 다른 컨테이너·프로세스가 쓰고 있다 |
| `exec format error` | 이미지 아키텍처(arm64·amd64)가 호스트와 다르다 |
| `no such file or directory` (시작 명령) | 경로 오류, 또는 셸 스크립트의 줄 끝이 CRLF |
| 마운트 오류 | 호스트 경로 없음, 권한, SELinux 레이블 |
| 바로 Exited (0) | 서버가 백그라운드로 빠졌다([[dockerfile\|Dockerfile 노트]]의 「컨테이너가 바로 꺼지는 이유」) |

### 종료 코드 읽기

| 코드 | 뜻 |
| --- | --- |
| 0 | 정상 종료 |
| 1 등 | 앱이 오류로 끝냄 |
| 125 | `docker run` 자체가 실패(잘못된 옵션 등) |
| 126 · 127 | 명령을 실행할 수 없음(권한) · 명령이 없음 |
| 130 | `SIGINT`(128 + 2), Ctrl+C |
| 137 | `SIGKILL`(128 + 9)로 죽음 |
| 139 | `SIGSEGV`(128 + 11), 세그멘테이션 폴트 |
| 143 | `SIGTERM`(128 + 15)을 받고 끝남. `docker stop`에 정상 반응한 경우 |

**137이 항상 OOM은 아니다.** 137은 「SIGKILL로 죽었다」는 뜻일 뿐이다.

| 137의 원인 | 확인 |
| --- | --- |
| 컨테이너 메모리 한도 초과 | `State.OOMKilled`가 `true`, `docker events`의 `oom` 이벤트 |
| `docker stop`·`kill`, Compose·오케스트레이터의 중지 | 앱이 `SIGTERM`을 무시해 유예 시간(기본 10초) 뒤 SIGKILL. `docker events`의 `kill` 이벤트와 신호 번호, PID 1 신호 처리 확인 |
| 호스트 전체 메모리 부족 | 커널 로그 `dmesg -T \| grep -i oom`, `journalctl -k`에 OOM killer 기록 |
| 쿠버네티스 liveness 실패, 축출 | `kubectl describe`의 이벤트와 Last State Reason([[kubernetes-operations\|쿠버네티스 운영]]) |
| 사람이나 스크립트의 `kill -9` | 운영 기록, 감사 로그 |

### 재시작 정책

| `--restart` | 동작 |
| --- | --- |
| `no` (기본값) | 다시 시작하지 않는다 |
| `on-failure[:최대 횟수]` | 0이 아닌 코드로 끝났을 때만 다시 시작 |
| `always` | 어떻게 끝나든 다시 시작. 사람이 멈춘 경우에도 데몬이 재시작되면 다시 띄운다 |
| `unless-stopped` | `always`와 같지만, 사람이 멈춘 컨테이너는 데몬 재시작 후에도 멈춰 둔다 |

재시작 사이에는 100ms부터 두 배씩 늘어나는 지연이 있고, 컨테이너가 10초 이상 돌아야 정책이 적용되기 시작한다. 재시작 정책은 한 호스트 안의 자동 복구일 뿐이라, 호스트가 죽으면 다른 호스트로 옮겨 주지 않는다. 그 일은 오케스트레이터가 한다.

### 실행 중인 컨테이너 들여다보기

```bash
docker exec -it api sh                     # 셸로 들어가기 (-u root, -e KEY=V, -w /dir 가능)
docker exec api env                        # 명령 하나만 실행
docker diff api                            # 이미지 대비 쓰기 층 변경: A 추가, C 변경, D 삭제
docker cp api:/app/logs/error.log ./       # 컨테이너 → 호스트 (멈춘 컨테이너에서도 된다)
docker cp ./fix.conf api:/etc/app/         # 호스트 → 컨테이너 (임시 확인용. 고친 것은 이미지에 반영)
docker top api                             # 컨테이너 안 프로세스 목록
```

- `docker diff`로 예상 밖의 파일 생성(침입 흔적, 컨테이너 안에 쌓이는 로그·캐시)을 찾는다.
- 셸이 없는 distroless 이미지는 도구 컨테이너를 같은 네임스페이스에 붙인다: `docker run -it --rm --pid container:api --network container:api nicolaka/netshoot`.
- `exec`로 고친 내용은 컨테이너를 다시 만들면 사라진다. 원인을 찾으면 Dockerfile이나 설정에 반영한다.

### 디스크 정리

```bash
docker system df                           # 이미지·컨테이너·볼륨·빌드 캐시가 차지하는 공간
docker system prune                        # 멈춘 컨테이너, 안 쓰는 네트워크, 댕글링 이미지, 빌드 캐시
docker system prune -a --filter until=168h # 컨테이너가 쓰지 않는 모든 이미지까지 (일주일 이상 된 것)
docker system prune --volumes              # 안 쓰는 익명 볼륨까지
docker image prune; docker builder prune   # 항목별로
```

`-a`를 주면 다음 배포 때 이미지를 다시 받아야 하고, `--volumes`는 데이터를 지울 수 있으므로 운영 서버에서는 대상을 확인하고 쓴다. 댕글링 이미지는 [[dockerfile|Dockerfile 노트]]의 「이미지 관리」에 있다.

## 정리

- cgroups 옵션이 없으면 제한도 없다. CPU 상한은 스로틀링, 메모리 상한은 OOM kill(137)로 강제되고, `--pids-limit`이 포크 폭탄을 가둔다.
- 호스트가 한가해도 CFS 쿼터 때문에 스로틀링될 수 있다. `cpu.stat`의 `nr_throttled`로 확인한다.
- 커널을 공유하므로 비root·rootless, capability 축소, seccomp·LSM, 네트워크 분리로 격리를 보강한다. Docker 소켓 마운트와 `--privileged`는 호스트 root를 주는 것과 같다.
- 비밀은 이미지와 ENV에 넣지 않는다. 이미지는 스캔하고 Cosign 등으로 서명·검증한다.
- 기본 `json-file` 로그는 회전하지 않는다. 데몬 기본값에 회전을 두고 중앙으로 보낸다.
- 137은 SIGKILL일 뿐이다. `OOMKilled`, `docker events`, 커널 로그로 실제 원인을 가린다.

관련 노트: [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]], [[docker-network-volume|Docker 네트워크와 볼륨]], [[docker-compose|Docker Compose: 여러 컨테이너 묶어 띄우기]], [[vm-vs-container|VM과 컨테이너]], [[virtualization|가상화와 하이퍼바이저]], [[kubernetes-security|쿠버네티스 보안]], [[devsecops|DevSecOps]], [[server-incident-diagnosis|서버 장애 진단 패턴]]
