---
title: "Bash 스크립트 작성법"
concept: "Bash Scripting"
summary: "Bash 스크립트를 쓸 때 필요한 문법을 한곳에 모았다. 변수와 매개변수 확장, 배열, [[ ]]·(( ))·case 조건문, 반복문, 함수와 $@, 종료 코드와 특수 변수, set -euo pipefail과 trap, 디버깅, 그리고 명령줄을 빠르게 쓰는 습관."
tags: ["linux", "shell", "cli", "os", "automation"]
source: other
date: "2026-10-21"
sources: ["https://blog.gaerae.com/2015/01/bash-hello-world.html", "https://devhints.io/bash.html", "https://github.com/jlevy/the-art-of-command-line/blob/master/README-ko.md", "https://github.com/Idnan/bash-guide", "https://wiki.kldp.org/HOWTO/html/Adv-Bash-Scr-HOWTO/", "https://www.gnu.org/software/bash/manual/bash.html", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/GIt/git%20bash%20%EB%8B%A8%EC%B6%95%ED%91%9C%ED%98%84.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/GIt/git%20history.md"]
---

> 「[Bash 입문자를 위한 핵심 요약 정리 (Shell Script)](https://blog.gaerae.com/2015/01/bash-hello-world.html)」, 「[The Art of Command Line](https://github.com/jlevy/the-art-of-command-line/blob/master/README-ko.md)」을 바탕으로, 문법은 GNU Bash 매뉴얼로 확인해 재구성한 노트다. 더 찾아볼 때는 「[Bash scripting cheatsheet](https://devhints.io/bash.html)」, 「[bash-guide](https://github.com/Idnan/bash-guide)」, 「[고급 Bash 스크립팅 가이드](https://wiki.kldp.org/HOWTO/html/Adv-Bash-Scr-HOWTO/)」를 쓴다.
>
> `alias`와 히스토리 번호 실행은 「[Frontend_TIL: git bash 단축표현](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/GIt/git%20bash%20%EB%8B%A8%EC%B6%95%ED%91%9C%ED%98%84.md)」, 「[git history](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/GIt/git%20history.md)」를 바탕으로 보강했다.

## 스크립트의 뼈대

```bash
#!/usr/bin/env bash
set -euo pipefail              # 실패를 숨기지 않는다 (아래 「안전하게 쓰기」)

readonly LOG_DIR="/var/log/app"

main() {
  local target="${1:?사용법: $0 <대상>}"   # 인자가 없으면 메시지를 내고 종료
  echo "처리: $target"
}

main "$@"
```

- 첫 줄 셔뱅(`#!`)이 인터프리터를 정한다. `/usr/bin/env bash`는 `PATH`에서 bash를 찾는다.
- 실행 권한을 주고(`chmod +x`) 실행하거나 `bash script.sh`로 실행한다.
- 로직을 `main` 함수에 넣고 맨 끝에서 부르면 함수 정의 순서를 신경 쓰지 않아도 된다. 함수는 **호출보다 먼저 정의**돼 있어야 하기 때문이다.

## 변수와 매개변수 확장

- 대입은 `name=value`. **`=` 앞뒤에 공백이 있으면** 명령 실행으로 해석돼 오류가 난다.
- 변수는 기본이 전역이다. 함수 안에서는 `local`을 붙인다. 자식 프로세스에 넘기려면 `export`.
- 쓸 때는 **항상 큰따옴표로 감싼다**(`"$var"`). 따옴표가 없으면 단어 분리와 `*` 확장이 일어난다. 확장 순서와 함정은 [[shell-pipeline|셸이 명령을 실행하는 방식]]에 있다.
- 명령 결과는 `$(명령)`으로 받는다. 옛 백틱(`` `명령` ``)은 중첩이 불편하다.

| 문법 | 결과 |
| --- | --- |
| `${var:-기본}` | 비었거나 없으면 기본값을 쓴다 |
| `${var:=기본}` | 비었으면 기본값을 대입하고 쓴다 |
| `${var:?메시지}` | 비었으면 메시지를 내고 종료 |
| `${#var}` | 길이 |
| `${var#접두}`, `${var##접두}` | 앞에서 가장 짧게·길게 일치하는 부분 제거 (`${path##*/}` = 파일 이름) |
| `${var%접미}`, `${var%%접미}` | 뒤에서 제거 (`${file%.*}` = 확장자 뺀 이름) |
| `${var/a/b}`, `${var//a/b}` | 첫 번째·모든 a를 b로 치환 |
| `${var:시작:길이}` | 부분 문자열 |

## 배열

```bash
files=("a.txt" "b c.txt")      # 인덱스 배열 (0부터)
files+=("d.txt")               # 추가
echo "${files[0]}"             # 요소
echo "${#files[@]}"            # 개수
for f in "${files[@]}"; do …   # 공백 든 요소도 안전하게 순회
unset 'files[1]'               # 요소 삭제

declare -A port=([web]=80 [db]=5432)   # 연관 배열 (bash 4+)
echo "${port[db]}"; echo "${!port[@]}" # 값, 키 목록
```

배열은 1차원만 된다. 복사도 `copy=("${files[@]}")`처럼 따옴표를 붙여야 요소가 쪼개지지 않는다.

## 조건문

| 형태 | 쓰임 |
| --- | --- |
| `[[ … ]]` | bash의 조건 검사. 변수를 따옴표 없이 써도 안전하고, `&&`·`\|\|`, 패턴(`==` `*.log`), 정규식(`=~`)을 지원한다. **bash 스크립트에서는 이것을 쓴다** |
| `[ … ]` | POSIX `test` 명령. `/bin/sh` 호환이 필요할 때만. 변수를 반드시 따옴표로 감싼다 |
| `(( … ))` | 정수 산술 비교 `(( count > 3 ))` |

```bash
if [[ -f "$file" && "$file" == *.log ]]; then …
elif (( size > 1024 )); then …
else …
fi

case "$cmd" in
  start|up) start_server ;;
  stop)     stop_server ;;
  *)        echo "알 수 없는 명령: $cmd" >&2; exit 2 ;;
esac
```

자주 쓰는 검사: 파일 `-f`, 디렉터리 `-d`, 존재 `-e`, 실행 가능 `-x`, 빈 문자열 `-z`, 비어 있지 않음 `-n`. 문자열 비교는 `==`·`!=`, 숫자 비교는 `(( ))` 또는 `-eq`·`-lt`·`-gt`.

## 반복문

```bash
for host in web1 web2 web3; do ssh "$host" uptime; done
for ((i = 0; i < 10; i++)); do …; done
for f in ./*.csv; do [[ -e "$f" ]] || continue; …; done   # 일치하는 파일이 없을 때 대비

while IFS= read -r line; do
  echo "$line"
done < input.txt              # 파일을 한 줄씩 (공백·역슬래시 보존)

until curl -sf localhost:8080/health; do sleep 1; done
```

`ls` 출력을 `for`로 돌리지 않는다. 파일 이름의 공백에서 쪼개진다. 글롭(`*.csv`)이나 `find … -print0 | xargs -0`을 쓴다. `break`는 반복을 끝내고 `continue`는 다음 회차로 넘어간다.

## 함수와 인자

| 변수 | 뜻 |
| --- | --- |
| `$0` | 스크립트 이름 |
| `$1` … `$9`, `${10}` | 위치 인자 |
| `$#` | 인자 개수 |
| `"$@"` | 인자를 **각각 따로** 펼친다. 인자를 넘길 때는 늘 이것 |
| `"$*"` | 인자를 `IFS` 첫 글자로 이어 **한 문자열**로 |
| `$?` | 직전 명령의 종료 코드 |
| `$$`, `$!` | 현재 셸 PID, 마지막 백그라운드 작업 PID |

함수의 `return`은 0~255 종료 코드만 돌려준다. 값을 돌려주려면 `echo`로 출력하고 호출 쪽에서 `$(함수)`로 받는다. 인자 파싱은 `getopts`로 한다.

## 종료 코드와 안전하게 쓰기

종료 코드 **0은 성공, 0이 아니면 실패**다. `if 명령; then`, `명령 && 다음`, `명령 || 대안`이 모두 이 값으로 분기한다.

| 설정 | 효과 |
| --- | --- |
| `set -e` | 명령이 실패하면 즉시 종료한다. `if`·`&&`·`\|\|` 안의 실패는 예외 |
| `set -u` | 정의되지 않은 변수를 쓰면 오류. 오타가 빈 문자열로 조용히 지나가는 것을 막는다 |
| `set -o pipefail` | 파이프라인 중간 명령의 실패도 파이프라인 실패로 본다. 없으면 마지막 명령의 결과만 본다 |

```bash
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT     # 정상 종료든 오류든 임시 파일 정리
```

- `trap '…' EXIT`로 정리 코드를, `trap '…' INT TERM`으로 중단 처리를 건다.
- 오류 메시지는 표준 오류로(`echo "…" >&2`), 사용법 오류는 2 같은 별도 종료 코드로 낸다.
- 위험한 명령은 변수가 비었을 때를 막는다. `rm -rf "$dir/"*`에서 `dir`이 비면 루트를 지운다. `set -u`와 `${dir:?}`로 막는다.

## 디버깅

- `bash -n script.sh`: 실행하지 않고 문법만 검사한다.
- `set -x`(또는 `bash -x script.sh`): 확장이 끝난 명령을 실행 전에 출력한다. 필요한 구간만 `set -x … set +x`로 감싼다.
- **ShellCheck**: 따옴표 누락, `$@` 오용, 쓰지 않는 변수 같은 흔한 실수를 정적 분석으로 잡는다. 편집기·CI에 붙여 둔다.

## 명령줄을 빠르게 쓰는 습관

| 습관 | 내용 |
| --- | --- |
| 히스토리 검색 | `Ctrl-R`로 지난 명령을 찾고, `!!`(직전 명령), `!$`(직전 명령의 마지막 인자)를 쓴다. `history \| grep git`으로 번호를 찾아 `!번호`로 다시 실행한다 |
| `alias` | 자주 치는 명령에 짧은 이름을 붙인다. `alias gs="git status"`를 `~/.bashrc`(zsh는 `~/.zshrc`)에 적고 `source ~/.bashrc`나 새 셸로 적용한다. `=` 앞뒤에 공백을 넣지 않고, 공백이 있는 명령은 따옴표로 감싼다. git 하위 명령만 줄일 거면 `git config alias.*`도 된다([[git-config-options\|Git 설정 옵션]]) |
| `xargs` | 앞 명령 출력을 인자로 넘긴다. `-P 8`로 병렬, `-0`과 `find -print0`으로 공백 안전 |
| 프로세스 치환 | `diff <(sort a.txt) <(sort b.txt)`: 명령 출력을 파일처럼 넘긴다 |
| 집합 연산 | `sort a b \| uniq`(합집합), `sort a b \| uniq -d`(교집합), `sort a b b \| uniq -u`(a - b) |
| `awk` 집계 | `awk '{s += $3} END {print s}'`: 열 합계 같은 계산을 한 줄로 |
| 디스크 찾기 | `du -sh * \| sort -h`, 대화형으로는 `ncdu` |
| 매뉴얼 | `man bash`를 한 번은 훑는다. 명령 요약은 `tldr <명령>` |

스크립트가 수십 줄을 넘고 자료 구조·오류 처리가 복잡해지면 Python 같은 범용 언어로 옮기는 편이 낫다.

## 정리

- 변수는 늘 큰따옴표로, 인자는 늘 `"$@"`로 넘긴다.
- bash 스크립트의 조건은 `[[ ]]`, 산술은 `(( ))`.
- `set -euo pipefail`과 `trap … EXIT`로 실패를 드러내고 뒷정리를 보장한다.
- ShellCheck과 `bash -n`, `set -x`로 실수를 잡는다.

관련 노트: [[shell-pipeline|셸이 명령을 실행하는 방식]], [[linux-commands|자주 쓰는 리눅스 명령어 지도]], [[missing-semester|The Missing Semester: CS 교육에서 빠진 도구 학기]], [[linux-server-monitoring|리눅스 서버 점검: 부하·메모리·자원 한도]]
