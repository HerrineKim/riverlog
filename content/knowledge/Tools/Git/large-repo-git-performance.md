---
title: "대형 저장소에서 Git 빠르게 쓰기: 얕은 클론, refspec, 부분 클론, 희소 체크아웃"
concept: "Large Repo Git Performance"
summary: "커밋 이력과 파일이 많은 모노레포에서 clone·checkout·status가 느려지는 원인과 줄이는 방법을 정리했다. 이력을 자르는 얕은 클론, 받을 브랜치를 좁히는 단일 브랜치·refspec, 파일 내용을 나중에 받는 부분 클론, 작업 트리를 일부만 펼치는 희소 체크아웃, 파일 감시와 백그라운드 유지 보수까지 다루고 CI와 개발자 PC에서 각각 무엇을 쓰는지 정리한다."
tags: ["git", "tools", "performance", "version-control", "ci-cd"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/the-one-line-change-that-reduced-clone-times-by-a-whopping-99-says-pinterest", "https://bytebytego.com/guides/how-tiktok-manages-a-200k-file-frontend-monorepo", "https://git-scm.com/docs/git-clone", "https://git-scm.com/docs/git-sparse-checkout", "https://git-scm.com/docs/partial-clone", "https://git-scm.com/docs/scalar"]
---

> ByteByteGo의 System Design 101 가이드 「[The one-line change that reduced clone times by 99% at Pinterest](https://bytebytego.com/guides/the-one-line-change-that-reduced-clone-times-by-a-whopping-99-says-pinterest)」, 「[How TikTok Manages a 200K File Frontend MonoRepo](https://bytebytego.com/guides/how-tiktok-manages-a-200k-file-frontend-monorepo)」를 바탕으로, 명령어는 Git 공식 문서로 확인해 재구성한 노트다.

## 무엇이 느려지나

모노레포는 코드 공유, 의존성 관리, 코드베이스 전체 조망이 쉽다는 장점이 있다. 대신 **저장소가 커질수록 Git 명령이 느려진다.** 느려지는 축은 세 가지이고, 축마다 처방이 다르다.

| 커지는 것 | 느려지는 명령 | 처방 |
| --- | --- | --- |
| 커밋 이력 | clone, fetch | 얕은 클론(`--depth`) |
| 브랜치·태그(ref) 수 | clone, fetch | 단일 브랜치, refspec 지정, `--no-tags` |
| 파일 내용(blob)의 총량 | clone, fetch | 부분 클론(`--filter`) |
| 작업 트리의 파일 수 | checkout, status, add, commit | 희소 체크아웃, 파일 시스템 감시 |

## 이력 줄이기: 얕은 클론

```bash
git clone --depth 50 <url>          # 최근 50개 커밋만 받는다
git fetch --deepen 100              # 필요하면 나중에 더 받는다
git fetch --unshallow               # 전체 이력으로 되돌린다
```

얕은 클론은 일회성 CI 빌드에 알맞다. 개발자 PC에서는 `git log`, `blame`, 병합 기준점 계산이 불완전해지므로 잘 쓰지 않는다.

## ref 줄이기: 단일 브랜치와 refspec

**얕은 클론만으로는 부족하다.** 브랜치가 수천 개인 저장소에서 refspec을 지정하지 않으면, 커밋 깊이는 잘랐어도 **모든 브랜치의 끝부분을 각각 받는다.** 이력 50개 × 브랜치 수천 개가 된다.

```bash
# clone 때 한 브랜치만
git clone --depth 50 --single-branch --branch main --no-tags <url>

# 이미 만든 저장소에서 fetch 대상을 한 브랜치로 좁히기
git fetch --depth 50 origin +refs/heads/main:refs/remotes/origin/main
```

CI 파이프라인의 체크아웃 단계에서 이 한 줄(받을 ref 지정)을 빠뜨린 대형 모노레포가 clone 시간을 수십 분에서 수십 초로 줄인 사례(Pinterest)가 있다. CI 도구의 체크아웃 플러그인은 기본값으로 모든 ref를 받는 경우가 있으니 설정을 확인한다.

## 파일 내용 나중에 받기: 부분 클론

```bash
git clone --filter=blob:none <url>        # 커밋·트리는 받고 파일 내용은 필요할 때 받는다
git clone --filter=tree:0 <url>           # 트리도 필요할 때 받는다 (CI 일회성 빌드용)
```

- `blob:none`(blobless)은 이력은 온전하므로 `log`는 빠르고, 체크아웃하는 파일 내용만 그때 받아 온다. **개발자 PC에 가장 무난하다.**
- `tree:0`(treeless)은 처음 받는 양이 더 적지만, 이력을 거슬러 올라가는 명령마다 서버에 다시 묻느라 느려진다.
- 서버가 부분 클론을 지원해야 한다(GitHub, GitLab은 지원한다).

## 작업 트리 줄이기: 희소 체크아웃

수십만 파일 중 내 팀이 쓰는 몇 폴더만 펼친다. 작업 트리가 작아지면 `checkout`, `status`, `add`가 모두 빨라진다.

```bash
git clone --filter=blob:none --sparse <url>
cd repo
git sparse-checkout set apps/web packages/ui     # 이 폴더들만 펼친다(cone 모드)
git sparse-checkout add packages/utils           # 나중에 추가
```

부분 클론과 함께 쓰면 펼치지 않은 폴더의 파일 내용은 아예 받지 않는다. 프론트엔드 모노레포용으로 희소 체크아웃과 부분 클론을 프로젝트 의존 그래프에 맞춰 자동 설정해 주는 도구(TikTok의 Sparo)도 이 조합 위에 있다.

## 명령 자체 빠르게: 감시와 유지 보수

```bash
git config core.fsmonitor true           # 내장 파일 시스템 감시: status가 전체 파일을 훑지 않는다
git config core.untrackedCache true      # 추적 안 하는 파일 목록 캐시
git maintenance start                    # 백그라운드에서 prefetch·commit-graph·repack
```

`scalar`(Git에 포함)는 위 설정(부분 클론, 희소 체크아웃, fsmonitor, 유지 보수)을 대형 저장소용으로 한 번에 켜 준다.

```bash
scalar clone <url>
```

## 어디서 무엇을 쓰나

| 환경 | 추천 조합 | 이유 |
| --- | --- | --- |
| CI 일회성 빌드 | `--depth` + 단일 브랜치/refspec + `--no-tags` (+ 필요하면 `--filter=tree:0`) | 한 번 쓰고 버리므로 받는 양만 최소화한다 |
| CI 캐시된 작업 공간 | 기존 저장소에서 대상 ref만 `fetch` | 매번 clone하지 않는 것이 가장 빠르다 |
| 개발자 PC | `--filter=blob:none` + 희소 체크아웃 + fsmonitor + maintenance (또는 `scalar clone`) | 이력은 온전히 쓰면서 받는 양과 작업 트리를 줄인다 |

## 정리

- 저장소가 커지는 축(이력, ref, 파일 내용, 작업 트리 파일 수)마다 처방이 다르다.
- 얕은 클론만 하고 refspec을 지정하지 않으면 모든 브랜치를 받는다. CI 체크아웃에서는 받을 ref를 꼭 좁힌다.
- 개발자 PC에는 blobless 부분 클론 + 희소 체크아웃 + fsmonitor가 무난하다.
- **큰 저장소의 Git 성능은 "필요한 것만 받고, 필요한 것만 펼친다"로 요약된다.**

관련 노트: [[remote-github|원격 저장소와 GitHub]], [[git-internals|Git 내부 구조]], [[git-config-options|Git 설정 옵션]], [[ci-cd|CI/CD]], [[package-managers|패키지 매니저]]
