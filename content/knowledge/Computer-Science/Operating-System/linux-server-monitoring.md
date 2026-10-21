---
title: "리눅스 서버 점검: 부하·메모리·자원 한도"
concept: "Linux Server Monitoring"
summary: "서버에 들어가면 보는 순서(부하 평균, 커널 로그, 디스크, TCP 상태, I/O), free의 available과 페이지 캐시·버퍼 캐시, 메모리가 바닥날 때 캐시 회수에서 OOM Killer까지 벌어지는 일, open files·max user processes 같은 ulimit 한도와 systemd 설정, 운영 보안 습관을 정리했다."
tags: ["linux", "os", "devops", "performance", "debugging"]
source: other
date: "2026-10-21"
sources: ["https://www.mimul.com/blog/linux-server-operations/", "https://brunch.co.kr/@alden/25", "https://medium.com/@EJSohn/%EB%B2%88%EC%97%AD-linux%EC%97%90%EC%84%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC%EB%A5%BC-%EB%8B%A4-%EC%8D%A8%EB%B2%84%EB%A0%B8%EC%9D%84-%EB%95%8C-%EC%9D%BC%EC%96%B4%EB%82%98%EB%8A%94-%EC%9D%BC-9dadba29c89c", "https://techblog.woowahan.com/2569/"]
---

> 「[스타트업 개발자가 리눅스 서버에 들어가면 언제나 하는 작업들](https://www.mimul.com/blog/linux-server-operations/)」, 「[리눅스의 페이지 캐시와 버퍼 캐시](https://brunch.co.kr/@alden/25)」, 「[Linux에서 메모리를 다 써버렸을 때 일어나는 일](https://medium.com/@EJSohn/%EB%B2%88%EC%97%AD-linux%EC%97%90%EC%84%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC%EB%A5%BC-%EB%8B%A4-%EC%8D%A8%EB%B2%84%EB%A0%B8%EC%9D%84-%EB%95%8C-%EC%9D%BC%EC%96%B4%EB%82%98%EB%8A%94-%EC%9D%BC-9dadba29c89c)」, 「[리눅스 open files, max user processes 설정 정리글](https://techblog.woowahan.com/2569/)」을 바탕으로 재구성한 노트다.

## 서버에 들어가면 보는 순서

명령어 자체보다 **각 숫자가 무엇을 뜻하는지** 알고 이상 징후를 빨리 알아채는 것이 목적이다. 넓게 보고 좁혀 간다.

| 순서 | 명령 | 볼 것 |
| --- | --- | --- |
| 1 | `uptime` | 부하 평균(load average) 1·5·15분 값. 1분 값이 15분 값보다 크면 부하가 오르는 중이다. 값이 CPU 코어 수를 넘으면 실행 대기가 생긴다 |
| 2 | `dmesg -T \| tail`, `journalctl -k` | 커널이 남긴 오류. OOM Killer, segfault, 디스크 I/O 오류, 네트워크 드롭 |
| 3 | `journalctl -p err`, `/var/log/messages`·`syslog` | 시스템 로그에서 emerg·alert·crit·err 수준만 거른다 |
| 4 | `df -Th`, `du -sh * \| sort -h`, `df -i` | 파티션 사용률, 큰 디렉터리. **inode가 바닥나도** 디스크가 찬 것처럼 쓰기가 실패한다 |
| 5 | `free -h`, `vmstat 1` | 아래 「메모리 읽는 법」. `vmstat`의 `r`(실행 대기)이 코어 수보다 크면 CPU 포화, `si`·`so`가 0이 아니면 스와핑 |
| 6 | `top`, `ps aux --sort=-%cpu`, `ps auxf` | CPU·메모리를 쓰는 프로세스, 부모·자식 관계. CPU 100%일 때의 추적은 [[linux-commands\|리눅스 명령어 지도]]에 있다 |
| 7 | `iostat -dx 1` | 디스크별 초당 읽기·쓰기(`r/s`, `w/s`), 대기 시간(`await`), 사용률(`%util`) |
| 8 | `ss -s`, `ss -tan state time-wait \| wc -l` | TCP 상태별 개수. TIME_WAIT가 많은 것은 짧은 연결이 많다는 뜻이고, **CLOSE_WAIT가 쌓이면 애플리케이션이 소켓을 닫지 않는 버그**다([[transport-layer\|전송 계층: 포트, TCP, UDP]]) |
| 9 | `sar -n DEV 1`, `sar -u` | 네트워크 처리량, 지난 시간대의 CPU 기록(sysstat 수집이 켜져 있어야 한다) |

**운영 서버에서 무거운 일을 할 때**는 `nice -n 19 ionice -c3 <명령>`처럼 CPU·디스크 우선순위를 가장 낮춰 서비스에 주는 영향을 줄인다. 큰 파일을 볼 때는 전체를 메모리에 올리는 편집기 대신 `less`를 쓴다.

## 메모리 읽는 법

리눅스는 **남는 메모리를 놀리지 않고 디스크 캐시로 쓴다.** 그래서 `free`의 `free` 값은 늘 작아 보인다.

| 항목 | 뜻 |
| --- | --- |
| `used` | 프로세스가 실제로 쓰는 메모리 |
| `buff/cache` | 디스크 내용을 담아 둔 캐시. 프로세스가 메모리를 요구하면 커널이 회수해 넘겨준다 |
| `available` | 스와핑 없이 새로 쓸 수 있는 메모리 추정치. **사용률은 이 값으로 계산한다** |

`total - free`나 `total - free - buff/cache`로 계산하면 과대·과소 평가하기 쉽다. 커널이 직접 추정한 `available`을 쓴다.

### 페이지 캐시와 버퍼 캐시

| 캐시 | 담는 것 | `free`에서 |
| --- | --- | --- |
| 페이지 캐시 | **파일 내용.** 한 번 읽은 파일을 메모리에 두고 다시 읽을 때 디스크를 건너뛴다. 쓰기도 일단 여기에 하고 나중에 디스크로 내린다(dirty page) | `cache` |
| 버퍼 캐시 | **블록 장치의 블록.** 슈퍼 블록·inode 같은 파일 시스템 메타데이터 | `buffers` |

리눅스 2.4 이전에는 둘이 분리돼 같은 데이터가 두 번 캐시되는 문제가 있었다. 지금은 버퍼 캐시가 페이지 캐시 안에 통합되어, 버퍼는 메타데이터 블록을 가리키는 작은 역할만 한다. 캐시 페이지는 활성·비활성 LRU 목록으로 관리되어 오래 안 쓴 것부터 회수된다. 파일 I/O 경로에서 캐시가 어디 있는지는 [[unix-file-io|UNIX 파일 입출력과 파일 디스크립터]]에 있다.

### 메모리가 바닥날 때 벌어지는 일

```text
1. 프로세스가 메모리를 더 쓴다 → 커널이 페이지 캐시를 회수해 넘겨준다 (buff/cache 감소)
2. 캐시가 거의 없다 → 실행 파일·라이브러리 코드 페이지까지 쫓겨난다
   → 프로세스가 돌 때마다 코드를 디스크에서 다시 읽는다 (vmstat의 bi 급증)
   → 시스템 전체가 극도로 느려진다. ls 하나에 몇 초 (스래싱)
3. 그래도 모자라면 OOM Killer가 점수(oom_score)가 높은 프로세스를 죽인다
   → dmesg에 "Out of memory: Killed process ..." 기록
```

- 스왑이 있으면 2단계에서 잘 안 쓰는 익명 메모리를 디스크로 내려 버티지만, 디스크 I/O 비용이 든다. 스왑 없이 운영하면 OOM이 빨리 온다.
- 감독 프로세스(systemd, 컨테이너 런타임)가 죽은 프로세스를 바로 다시 띄우면 OOM이 반복된다. 원인 프로세스의 메모리 한도를 정하거나(cgroup, 컨테이너 `--memory`) 인스턴스를 키운다.
- 중요한 프로세스는 `oom_score_adj`를 낮춰 먼저 죽지 않게 할 수 있다.
- 개념적인 배경(요구 페이징, 스래싱)은 [[virtual-memory|가상 메모리]]에 있다.

## 자원 한도: ulimit

프로세스마다 쓸 수 있는 자원에 상한이 있다. 고부하 서버에서 자주 걸리는 두 가지다.

| 한도 | `ulimit` 옵션 | 걸리면 |
| --- | --- | --- |
| open files (`nofile`) | `-n` | 프로세스가 열 수 있는 파일 디스크립터 수. **소켓도 파일**이라 HTTP 호출·DB 연결이 여기에 포함된다. `Too many open files` |
| max user processes (`nproc`) | `-u` | 한 사용자가 만들 수 있는 프로세스 수. 리눅스는 **스레드도 프로세스로 센다.** Java라면 `unable to create new native thread` |

- **soft**는 지금 적용되는 값, **hard**는 soft를 올릴 수 있는 상한이다(`ulimit -a`, `ulimit -aH`). 런타임마다 다르게 동작한다. JVM은 시작할 때 soft 값을 hard까지 올리고(`-XX:+MaxFDLimit`, 기본 켜짐), 다른 런타임은 soft 값에서 바로 실패하기도 한다.
- 실행 중인 프로세스의 실제 한도는 셸의 `ulimit`이 아니라 `/proc/<PID>/limits`로 본다. 열린 개수는 `ls /proc/<PID>/fd | wc -l`.
- 로그인 세션의 영구 설정은 `/etc/security/limits.conf`(또는 `limits.d/`)에 `사용자 soft/hard nofile 값`으로 적는다. 보통 soft와 hard를 같게 둔다.
- **systemd 서비스에는 limits.conf가 적용되지 않는다.** 유닛 파일의 `LimitNOFILE=`, `LimitNPROC=`로 정한다([[daemon-and-systemd|데몬과 systemd]]). 컨테이너는 `docker run --ulimit`이나 런타임 기본값을 따른다.
- 시스템 전체 상한은 따로 있다(`fs.file-max`, `kernel.pid_max`).
- 한도를 올려도 각 연결·스레드가 쓰는 메모리가 먼저 바닥날 수 있다. 한도는 메모리 크기, 웹 서버의 최대 연결·스레드 설정과 함께 맞춘다.

## 운영 보안 습관

- **명령줄에 비밀번호를 쓰지 않는다.** 셸 히스토리와 `ps` 출력에 남는다. `mysql -p`처럼 프롬프트로 입력받거나, `read -s`로 변수에 받아 넘기거나, 환경 변수·자격 증명 파일을 쓴다. 이미 남았다면 히스토리에서 지운다.
- SSH 로그인 실패 기록(`journalctl -u sshd`, RHEL 계열 `/var/log/secure`, Debian 계열 `/var/log/auth.log`)을 IP별로 집계해 무차별 대입을 확인한다. 반복되는 IP는 fail2ban 같은 도구로 자동 차단한다.
- 비밀번호 로그인과 root 직접 로그인을 끄고 **키 인증**만 허용하는 것이 포트 변경보다 효과가 크다([[ssh|SSH의 동작: 전송·인증·연결 계층]]).
- 임시 파일은 `/tmp`(재부팅 시 정리)와 `/var/tmp`(더 오래 유지)에 두되, 둘 다 `systemd-tmpfiles` 정책으로 주기 정리된다는 것을 안다.

## 정리

- 부하 평균 → 커널 로그 → 디스크 → 메모리 → 프로세스 → I/O → 네트워크 순으로 넓게 보고 좁힌다.
- 메모리 사용률은 `available`로 본다. `buff/cache`는 필요하면 돌려받는 메모리다.
- 메모리가 바닥나면 캐시 회수 → 코드 페이지 재읽기로 극도로 느려짐 → OOM Killer 순으로 간다.
- 소켓도 파일, 스레드도 프로세스다. `nofile`·`nproc` 한도는 `/proc/<PID>/limits`로 확인하고 systemd 서비스는 유닛 파일에서 올린다.

관련 노트: [[linux-commands|자주 쓰는 리눅스 명령어 지도]], [[virtual-memory|가상 메모리]], [[unix-file-io|UNIX 파일 입출력과 파일 디스크립터]], [[daemon-and-systemd|데몬과 systemd]], [[observability|관측 가능성: 로그, 트레이스, 메트릭]], [[ssh|SSH의 동작: 전송·인증·연결 계층]]
