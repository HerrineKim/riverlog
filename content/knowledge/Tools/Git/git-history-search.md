---
title: "Git 이력 검색: log 필터, grep, pickaxe, blame, bisect"
concept: "Git History Search"
summary: "커밋 이력에서 원하는 것을 찾는 방법을 질문별로 정리했다. 범위 표기(A..B, A...B)와 log 필터(작성자·기간·메시지·파일), 지금 코드에서 찾는 git grep, 코드가 생기거나 사라진 커밋을 찾는 pickaxe(-S, -G)와 log -L, 줄마다 마지막 수정을 보는 blame, 버그를 넣은 커밋을 이진 탐색하는 bisect까지 다룬다."
tags: ["git", "version-control", "cli", "debugging"]
source: other
date: "2026-10-21"
sources: ["https://github.com/arslanbilal/git-cheat-sheet", "https://github.com/mingrammer/git-tips", "https://git-scm.com/docs/git-log", "https://git-scm.com/docs/gitrevisions", "https://git-scm.com/docs/git-grep", "https://git-scm.com/docs/git-blame", "https://git-scm.com/docs/git-bisect", "https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md"]
---

> arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」와 mingrammer의 「[Git Tips](https://github.com/mingrammer/git-tips)」(git-tips/tips 한국어판)에서 검색·이력 항목을 모아, 옵션은 Git 공식 문서로 확인해 질문별로 재구성한 노트다.
> `--cherry-pick` 비교와 `tag --contains`는 「[Git Flight Rules](https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md)」를 바탕으로 보강했다.

## 무엇을 찾느냐에 따라 명령이 다르다

| 질문 | 명령 |
| --- | --- |
| 지금 코드 어디에 이 문자열이 있나 | `git grep` |
| 이 문자열이 **언제 생기거나 사라졌나** | `git log -S` / `-G` (pickaxe) |
| 이 함수·줄 범위가 어떻게 바뀌어 왔나 | `git log -L` |
| 이 줄을 **마지막으로 누가 왜** 바꿨나 | `git blame` |
| 언제부터 **버그가** 생겼나 | `git bisect` |
| 커밋 메시지·작성자·기간으로 찾기 | `git log --grep`, `--author`, `--since` |
| 이 브랜치에만 있는 커밋, 아직 안 올린 커밋 | 범위 표기 `A..B` |

## 범위 표기: 어느 커밋들을 볼까

log·diff 같은 명령은 커밋 **범위**를 받는다. 범위 표기를 알면 대부분의 "어느 커밋이 어디에 있나" 질문이 풀린다.

| 표기 | 뜻 | 예 |
| --- | --- | --- |
| `A..B` | B에서 닿는 커밋 중 A에서는 닿지 않는 것 | `git log main..feature`: feature에만 있는 커밋 |
| `B ^A` | `A..B`와 같다. 여러 개를 뺄 때 편하다 | `git log feature ^main ^release` |
| `A...B` | 둘 중 한쪽에만 있는 커밋(대칭 차집합) | `git log --left-right main...feature`: `<`·`>`로 어느 쪽 것인지 표시 |
| `@{u}` | 현재 브랜치의 업스트림(추적 원격 브랜치) | `git log @{u}..`: 아직 push 안 한 커밋 |
| `HEAD~3`, `HEAD^2` | 첫 부모를 3번 거슬러 / 두 번째 부모 | merge 커밋의 부모는 [[merge\|Git 브랜치 병합]] 참고 |
| `main@{yesterday}` | reflog 기준 어제 시점의 main | `git diff main@{yesterday}` |

```bash
git log --oneline main..                  # 지금 브랜치에서 main 이후 만든 커밋 (= main..HEAD)
git log --branches --not --remotes        # 모든 브랜치에서 아직 push 안 한 커밋
git cherry -v main                        # main에 아직 반영 안 된 커밋 (내용이 같으면 cherry-pick된 것으로 보고 - 표시)
git branch --contains <커밋>               # 이 커밋을 포함한 브랜치
git tag --contains <커밋>                  # 이 커밋이 들어간 릴리스 태그
git log --oneline --left-right --cherry-pick HEAD...feature   # 양쪽 차이에서 이미 cherry-pick된(내용이 같은) 커밋은 빼고
git describe --tags --abbrev=0            # 지금 커밋에서 가장 가까운 태그 (이 변경이 어느 릴리스 이후인가)
```

## log 필터

```bash
git log -n 5                              # 마지막 5개
git log --author="kim"                    # 작성자 (정규식)
git log --since="2 weeks ago" --until="yesterday"
git log --grep="login" -i                 # 커밋 메시지 검색 (대소문자 무시)
git log --all --grep="hotfix"             # 모든 브랜치에서
git log -p -- src/auth.ts                 # 이 파일을 바꾼 커밋과 diff
git log --follow -p -- src/auth.ts        # 이름이 바뀐 이전 경로까지 따라가기
git log --no-merges                       # merge 커밋 빼기
git log --first-parent main               # main에 직접 들어온 커밋·merge만 (PR 단위로 보기)
git log --stat --reverse main..           # 파일별 변경량, 오래된 것부터
git log --oneline --graph --all           # 브랜치 그래프
git shortlog -sn                          # 작성자별 커밋 수
```

- `--author`나 `--grep`을 여러 번 쓰면 OR로 묶인다. `--grep` 조건을 모두 만족하는 커밋만 보려면 `--all-match`를 붙인다.
- `--first-parent`는 merge 커밋으로 PR을 합치는 저장소에서 "언제 무엇이 들어왔나"를 PR 단위로 보여 준다.

## 지금 코드에서 찾기: git grep

```bash
git grep -n "TODO"                        # 줄 번호와 함께
git grep --heading --break -n "useAuth"   # 파일별로 묶어서
git grep "TODO" v2.5                      # 특정 태그·커밋 시점의 코드에서
git grep -e "foo" --and -e "bar"          # 한 줄에 둘 다 있는 곳
```

추적 중인 파일만 뒤지므로 `node_modules`나 빌드 결과물이 걸리지 않고, 과거 커밋을 체크아웃하지 않고도 그 시점 코드를 검색한다.

## 코드가 생기거나 사라진 커밋 찾기: pickaxe

| 옵션 | 찾는 커밋 | 쓰임 |
| --- | --- | --- |
| `-S<문자열>` | 그 문자열의 **등장 횟수가 바뀐** 커밋 | 함수·상수가 처음 추가되거나 지워진 커밋 |
| `-S<정규식> --pickaxe-regex` | 위와 같되 정규식으로 | |
| `-G<정규식>` | diff의 추가·삭제 줄에 **패턴이 들어 있는** 커밋 | 그 줄 근처를 고친 커밋까지 모두 |

```bash
git log -S"MAX_RETRY" --oneline           # MAX_RETRY가 생기거나 없어진 커밋
git log -G"retry\(" -p                    # retry( 를 건드린 모든 커밋과 diff
```

`-S`는 같은 줄 안에서 값만 바꾼 커밋(`MAX_RETRY = 3` → `5`)은 잡지 못한다. 등장 횟수가 그대로이기 때문이다. 이럴 때 `-G`를 쓴다.

### 함수나 줄 범위의 변천사: log -L

```bash
git log -L 40,60:src/auth.ts              # 이 줄 범위가 바뀐 커밋과 그 부분 diff
git log -L :validateToken:src/auth.ts     # 함수 이름으로
```

## 줄마다 마지막 수정: blame

```bash
git blame src/auth.ts
git blame -L 40,60 src/auth.ts            # 일부 줄만
git blame -w -C -C src/auth.ts            # 공백 변경 무시, 다른 파일에서 옮겨 온 줄은 원래 커밋으로
```

- blame은 **마지막으로 바꾼 커밋**만 알려 준다. 포매터 일괄 적용 같은 커밋이 있으면 모든 줄이 그 커밋으로 덮인다.
- 그런 커밋 해시를 `.git-blame-ignore-revs` 파일에 적고 `git config blame.ignoreRevsFile .git-blame-ignore-revs`로 설정하면 blame이 건너뛴다. GitHub의 blame 화면도 저장소 루트의 이 파일을 읽는다.
- blame은 사람을 탓하는 도구가 아니라, 그 줄이 들어온 **커밋과 PR의 맥락**을 찾는 입구다. 해시를 찾았으면 `git show <해시>`로 메시지와 diff를 본다.

## 버그를 넣은 커밋 찾기: bisect

`git bisect`는 "잘 되던 커밋"과 "깨진 커밋" 사이를 **이진 탐색**한다. 커밋이 1,000개여도 10번 남짓만 확인하면 된다.

```bash
git bisect start
git bisect bad                 # 지금(HEAD)은 깨졌다
git bisect good v2.4.0         # 이 태그 때는 됐다
# Git이 중간 커밋을 체크아웃한다 → 확인하고 결과를 알린다
git bisect good                # 또는 git bisect bad, 판단할 수 없으면 git bisect skip
# ... 반복하면 "<해시> is the first bad commit"
git bisect reset               # 원래 브랜치로 돌아간다
```

확인을 스크립트로 할 수 있으면 끝까지 자동으로 돌린다.

```bash
git bisect start HEAD v2.4.0
git bisect run npm test        # 종료 코드 0 = good, 1~127(125 제외) = bad, 125 = skip
```

- 커밋마다 빌드가 돼야 bisect가 정확하다. squash로 큰 커밋 하나가 되면 범위를 좁히지 못한다([[merge-squash-rebase|merge·squash·rebase 언제 쓰나]]).
- 버그가 아니라 "성능이 바뀐 시점"처럼 good·bad가 어색하면 `git bisect start --term-old=fast --term-new=slow`로 이름을 바꾼다.

## 그 밖의 조회

| 하고 싶은 일 | 명령 |
| --- | --- |
| 다른 브랜치의 파일 내용 보기(체크아웃 없이) | `git show main:src/config.ts` |
| 어떤 커밋에서 바뀐 파일 목록 | `git show --name-only <커밋>` |
| 충돌 중인 파일 목록 | `git diff --name-only --diff-filter=U` |
| 브랜치의 커밋 수 | `git rev-list --count main` |
| 첫 커밋(루트) 찾기 | `git rev-list --max-parents=0 HEAD` |
| 커밋이 어느 태그·브랜치 이름으로 닿나 | `git name-rev --name-only <커밋>` |

## 정리

- 지금 코드면 `git grep`, 코드가 언제 생겼나면 `log -S`/`-G`, 범위의 변천사면 `log -L`, 줄의 마지막 수정이면 `blame`, 버그 시작점이면 `bisect`.
- 범위 표기 `A..B`(B에만 있는 것)와 `A...B`(한쪽에만 있는 것)를 구분하면 "어디에 무엇이 있나" 질문이 대부분 풀린다.
- 포매팅 커밋은 `.git-blame-ignore-revs`로 blame에서 뺀다.
- **이력 검색은 커밋이 작고 메시지가 좋을 때 가장 잘 된다.** 좋은 커밋 습관([[commit-convention|커밋 컨벤션]])이 곧 검색 품질이다.

관련 노트: [[git-basics|Git 기본 명령과 파일 상태]], [[git-undo-and-rewrite|Git 되돌리기와 이력 다루기]], [[merge-squash-rebase|merge·squash·rebase 언제 쓰나]], [[commit-convention|커밋 컨벤션과 자동 검사]], [[binary-search|이분 탐색]]
