---
title: "merge·squash·rebase 언제 쓰나"
concept: "PR Merge Strategy"
summary: "PR을 합칠 때 merge 커밋, squash, 인터랙티브 rebase를 상황에 따라 고르는 기준. 기본은 merge 커밋(진짜 이력, 쉬운 되돌리기, 잘게 쪼개진 bisect), 작은 diff에 WIP가 많으면 squash, 큰 diff에 WIP가 많으면 인터랙티브 rebase로 다듬는다."
tags: ["git", "version-control", "merge", "branch"]
source: other
date: "2026-10-13"
---

> Mitchell Hashimoto가 gist에 올린 것으로 알려진 merge·squash·rebase에 대한 글을 바탕으로 재구성한 노트입니다. 팀마다 기본 전략이 다를 수 있는 실무 기준입니다.

## 정답은 하나가 아니다

merge, squash, rebase는 모두 장점이 있고 **상황에 따라** 고른다. 어느 하나가 언제나 옳다는 주장은 틀렸다. 다만 무엇을 언제 쓸지에는 꽤 넓은 허용 범위가 있다.

| 상황 | 선택 |
| --- | --- |
| 대부분의 PR | **merge 커밋** |
| diff는 작은데 "WIP" 커밋이 잔뜩 있고 목표가 하나 | **squash** + 커밋 메시지 새로 쓰기 |
| diff도 크고 "WIP" 커밋도 많음 | **인터랙티브 rebase**로 골라서 합치고 순서 정리 → merge |

## 기본은 merge 커밋

- **진짜 이력**을 가장 잘 남긴다. 어디서 합쳤는지, 개발자가 거친 중간 커밋이 다 보인다.
- **통째로 되돌리기 쉽다.** `git revert -m 1 <merge 커밋>`이면 PR 전체가 취소된다(`-m`은 기준이 될 부모 번호).
- **`git bisect`가 잘 된다.** 커밋이 잘게 쪼개져 있을수록 버그를 넣은 지점을 좁게 찾는다.

```text
squash 한 덩어리: +2000/-500  → bisect가 여기서 멈추면 사실상 쓸모없음
merge 안의 커밋:  +50/-50      → "아, 여기다" 하고 바로 찾음 (최악이어도 +500/-500 이내)
```

+50/-50짜리 커밋 1,000개가 든 merge가 squash 한 덩어리보다 디버깅에 유리하다. **squash는 이 정보를 없앤다.**

전제가 있다. **모든 커밋이 빌드돼야 한다.** 빌드 안 되는 커밋이 섞이면 bisect가 엉뚱한 곳에서 멈춘다. 팀에는 이 위생을 규칙으로 요구하고, 오픈소스 기여처럼 통제할 수 없을 땐 merge 전에 인터랙티브 rebase로 직접 고친다.

## squash를 쓰는 경우

"WIP", "WIP", "WIP"처럼 의미 없는 커밋이 많지만 **목표가 하나이고 diff가 작은** PR이다. 쪼개 둬도 bisect에 도움이 안 되니 합친다.

이때 **커밋 메시지를 새로 쓴다.** Git·GitHub의 기본 squash 메시지는 합쳐진 커밋 메시지를 이어 붙일 뿐이라 대개 "WIP"의 나열이 된다.

## 인터랙티브 rebase를 쓰는 경우

diff가 크고 WIP도 많으면 squash하면 bisect 정보를 잃고, 그대로 merge하면 쓸모없는 커밋이 남는다. `git rebase -i`로 **관련 커밋끼리 골라서 합치고 순서를 바꿔** 의미 있는 단위로 정리한 다음 merge한다.

- 개발자가 스스로 커밋을 다듬을 줄 알기를 기대하지만, Git에 익숙하지 않은 사람이 많아 오픈소스에서는 메인테이너가 대신 하기도 한다.
- 커밋이 50개를 넘고 변경 줄이 많은 큰 rebase는 GUI 클라이언트(Tower, Fork, GitKraken 등)를 쓰면 편하다. CLI에 익숙해도 커밋을 끌어다 놓으며 순서를 바꾸는 일은 GUI가 빠르다.

## 정리

- 기본은 merge 커밋. 이력이 정확하고, 한 번에 되돌릴 수 있고, bisect가 잘게 찍힌다.
- merge 전략은 **커밋마다 빌드되는** 위생이 받쳐 줘야 한다.
- 작은 diff + WIP 범벅 → squash, 메시지는 다시 쓴다.
- 큰 diff + WIP 범벅 → 인터랙티브 rebase로 정리한 뒤 merge.

관련 노트: [[merge|Git 브랜치 병합]], [[git-undo-and-rewrite|Git 되돌리기와 이력 다루기]], [[commit-convention|커밋 컨벤션과 자동 검사]], [[github-collaboration|GitHub 협업 저장소 설정]]
