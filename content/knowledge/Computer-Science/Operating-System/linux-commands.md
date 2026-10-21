---
title: "자주 쓰는 리눅스 명령어 지도"
concept: "Linux Commands"
summary: "리눅스 명령어를 파일·보기·텍스트 처리·프로세스·시스템 정보·사용자·네트워크·패키지 범주로 묶은 지도. grep·cut·sed·awk·sort·uniq를 파이프로 이어 로그를 훑는 법과, CPU 사용률이 100%일 때 의심할 원인과 확인 순서를 함께 정리한다."
tags: ["linux", "cli", "os", "debugging", "devops"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/most-used-linux-commands-map", "https://bytebytego.com/guides/log-parsing-cheat-sheet", "https://bytebytego.com/guides/top-9-cases-behind-100-cpu-usage"]
---

> ByteByteGo의 System Design 101 가이드 「[Most Used Linux Commands Map](https://bytebytego.com/guides/most-used-linux-commands-map)」, 「[Log Parsing Cheat Sheet](https://bytebytego.com/guides/log-parsing-cheat-sheet)」, 「[Top 9 Causes of 100% CPU Usage](https://bytebytego.com/guides/top-9-cases-behind-100-cpu-usage)」를 바탕으로 재구성한 노트다.

## 명령어 지도

명령어는 외우기보다 **범주**로 기억하고, 자세한 옵션은 `man <명령>`이나 `<명령> --help`로 찾는다.

| 범주 | 명령 | 쓰임 |
| --- | --- | --- |
| 파일·디렉터리 | `ls`, `cd`, `pwd`, `mkdir`, `cp`, `mv`, `rm`, `ln -s`, `find`, `tree` | 이동, 만들기, 복사·이동·삭제, 링크, 이름·조건으로 찾기 |
| 보기·편집 | `cat`, `less`, `head`, `tail -f`, `vim`, `nano` | 파일 내용 보기, 늘어나는 로그 따라 보기, 편집 |
| 텍스트 처리 | `grep`, `cut`, `sed`, `awk`, `sort`, `uniq`, `wc`, `tr`, `xargs` | 걸러 내기, 열 자르기, 치환, 집계, 다른 명령의 인자로 넘기기 |
| 프로세스 | `ps aux`, `top`·`htop`, `kill`, `pkill`, `jobs`·`bg`·`fg`, `nohup` | 실행 중인 프로세스 보기, 종료 시그널 보내기, 작업 제어 |
| 시스템 정보 | `uname -a`, `uptime`, `df -h`, `du -sh`, `free -h`, `lscpu`, `lsblk` | 커널, 부하 평균, 디스크·메모리 사용량, 하드웨어 |
| 사용자·권한 | `whoami`, `id`, `useradd`, `usermod`, `passwd`, `chmod`, `chown`, `sudo` | 계정 관리, 파일 권한([[linux-access-control\|리눅스 접근 제어]]) |
| 네트워크 | `ip addr`, `ss -tlnp`, `ping`, `curl`, `dig`, `traceroute`, `scp`·`rsync` | 주소 확인, 열린 포트, 연결 확인, DNS 조회, 파일 전송 |
| 패키지 | `apt`, `dnf`, `pacman` | 배포판별 패키지 설치([[linux-distributions\|리눅스 배포판과 패키지 관리]]) |
| 압축·보관 | `tar -czf`, `tar -xzf`, `gzip`, `zip` | 묶기와 풀기 |

`ifconfig`·`netstat`은 과거에 많이 썼고, 지금 배포판은 `ip`·`ss`를 기본으로 둔다.

## 로그를 파이프로 훑기

텍스트 처리 명령은 하나씩은 단순하지만 **파이프로 이으면 즉석 분석 도구**가 된다. 셸이 파이프라인을 어떻게 실행하는지는 [[shell-pipeline|셸이 명령을 실행하는 방식]]에 있다.

| 명령 | 하는 일 |
| --- | --- |
| `grep` | 패턴과 맞는 줄만 고른다(`-i` 대소문자 무시, `-v` 반대로, `-E` 확장 정규식, `-r` 재귀) |
| `cut` | 구분자로 나눈 특정 열만 잘라 낸다(`-d' ' -f2`) |
| `sed` | 스트림 편집. 치환(`s/old/new/g`), 줄 삭제 |
| `awk` | 줄을 필드로 나눠 조건·계산·집계를 한다. 작은 프로그래밍 언어다 |
| `sort` | 줄을 정렬한다(`-n` 숫자, `-r` 역순, `-k` 기준 열) |
| `uniq` | **인접한** 중복 줄을 합친다. 그래서 보통 `sort` 뒤에 쓴다(`-c` 개수 세기) |

```bash
# xxService에서 Exception이 난 줄의 타임스탬프(2번째 열)만 뽑기
grep "xxService" service.log | grep "Exception" | cut -d' ' -f2

# 상태 코드(9번째 열)별 요청 수, 많은 순
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# 5xx를 가장 많이 낸 경로 10개
awk '$9 >= 500 {print $7}' access.log | sort | uniq -c | sort -rn | head

# 지금 쌓이는 로그에서 ERROR만 실시간으로
tail -f app.log | grep --line-buffered ERROR
```

서버 한 대를 빠르게 볼 때는 이것으로 충분하지만, 여러 서버의 로그를 모아 검색하려면 중앙 로그 시스템이 필요하다([[observability|관측 가능성]]).

## CPU 사용률 100%일 때

### 의심할 원인

| 원인 | 모습 |
| --- | --- |
| 무한 루프 | 특정 프로세스의 한 스레드가 코어 하나를 계속 100% 쓴다 |
| 바쁜 대기(busy waiting) | 락이나 조건을 잠들지 않고 반복 확인한다([[process-synchronization\|프로세스 동기화]]) |
| 정규식 백트래킹 | 특정 입력에서 정규식이 지수 시간으로 폭주한다(ReDoS, [[regexp-engine\|정규식 엔진]]) |
| 트래픽 급증 | 정상 코드지만 요청이 처리 용량을 넘었다. 모든 인스턴스가 함께 오른다 |
| 무거운 작업 | 인코딩·압축·대용량 정렬처럼 원래 CPU를 많이 쓰는 작업이 몰렸다 |
| 메모리 부족 | 스와핑이나 가비지 컬렉션이 끊임없이 돌아 CPU를 먹는다 |
| 동시 실행 과다 | 코어보다 훨씬 많은 스레드·프로세스가 경쟁해 문맥 교환 비용이 커진다 |
| 백그라운드 프로세스 | 백업, 인덱싱, 업데이트, 크론 작업이 겹쳤다 |
| 악성 코드 | 모르는 프로세스가 채굴 등으로 CPU를 쓴다. 침해 사고로 다룬다 |

### 확인 순서

```text
1. top / htop          ─ 어느 프로세스가 쓰나, us(사용자)·sy(커널)·wa(I/O 대기)·st(가상화 뺏김) 비율
2. top -H -p <PID>     ─ 그 프로세스의 어느 스레드인가
3. 스택 보기           ─ 그 스레드가 어디서 도나 (jstack, py-spy dump, perf top, gdb)
4. 시간 맞춰 보기      ─ 배포·트래픽·크론 시각과 겹치나 (메트릭 대시보드)
```

- `sy`가 높으면 시스템 호출·문맥 교환이 많다는 뜻이고, `wa`가 높으면 CPU가 아니라 디스크·네트워크 I/O가 병목이다.
- `free -h`와 `vmstat 1`로 스와핑(`si`·`so`)이 있는지 같이 본다. 메모리 문제가 CPU 증상으로 보일 때가 많다.

## 정리

- 명령어는 범주로 기억하고 옵션은 `man`으로 찾는다.
- `grep → cut/awk → sort → uniq -c → sort -rn`은 로그 집계의 기본 파이프라인이다.
- CPU 100%는 "누가(프로세스) → 어느 스레드 → 어디서(스택) → 언제(시각)" 순으로 좁힌다.
- 사용자 영역·커널·I/O 대기 비율을 먼저 보면 원인의 방향이 갈린다.

관련 노트: [[shell-pipeline|셸이 명령을 실행하는 방식]], [[linux-server-monitoring|리눅스 서버 점검: 부하·메모리·자원 한도]], [[bash-scripting|Bash 스크립트 작성법]], [[linux-access-control|리눅스 접근 제어]], [[linux-distributions|리눅스 배포판과 패키지 관리]], [[process-scheduling|프로세스 상태와 CPU 스케줄링]], [[missing-semester|The Missing Semester]]
