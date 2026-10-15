---
title: "미드저니 프롬프트 파라미터"
concept: "Midjourney"
summary: "미드저니 프롬프트 끝에 붙이는 --ar, --s, --c, --w, --sref, --sw, --p, --v 같은 파라미터의 뜻과 범위를 크리스마스 디자인용 프롬프트 예시로 정리했다."
tags: ["ai", "design", "prompt-engineering", "image-generation"]
source: notion
date: "2026-10-13"
sources: ["https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version", "https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List"]
---

> 크리에이티브 디렉터 Joshua Cho가 링크드인에 공유한 크리스마스 디자인용 미드저니 프롬프트를 바탕으로 재구성한 노트다.

## 예시 프롬프트

```text
Christmas tree decorated with gold stars, against a black background,
using a dark, neutral color palette.
--c 3 --sref 3790650157 --p bed93jl --sw 300 --s 300 --w 3 --v 6.1 --ar 2:3
```

검은 배경에 금색 별을 단 트리를 어두운 무채색으로 그린다. 스타일 참조 코드(`--sref`)가 분위기와 색감을 크게 좌우한다. 이런 조합은 그대로 한 번 쓰기보다 문장을 바꿔 가며 여러 장을 뽑고 고르는 데 쓴다.

`--v 6.1`은 옛 모델을 일부러 지정한 것이다. `--v`를 빼면 그때의 기본 모델로 그린다. 2026년 10월 기본은 V8.2이고, V7은 2025년 6월~2026년 6월에 기본이었다([Version](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)).

## 파라미터

프롬프트 문장 뒤에 `--이름 값` 꼴로 붙인다.

| 파라미터 | 뜻 | 범위·기본값 | 예시 값의 의미 |
| --- | --- | --- | --- |
| `--ar` | 가로세로 비율(aspect ratio) | 기본 1:1 | 2:3, 세로로 긴 포스터·카드 |
| `--s` | 스타일라이즈(stylize). 미드저니 고유 미감을 얼마나 입힐지 | 0~1000, 기본 100 | 300, 꽤 강하게 |
| `--c` | 카오스(chaos). 한 번에 나오는 이미지끼리 얼마나 다를지 | 0~100, 기본 0 | 3, 거의 비슷하게 |
| `--w` | 위어드(weird). 엉뚱하고 실험적인 정도 | 0~3000, 기본 0 | 3, 아주 약간만 |
| `--sref` | 스타일 참조(style reference). 이미지 URL이나 숫자 코드의 화풍을 빌린다 | 코드 또는 URL | 3790650157, 특정 화풍 코드 |
| `--sw` | 스타일 가중치(style weight). `--sref`를 얼마나 강하게 따를지 | 0~1000, 기본 100 | 300, 참조 화풍을 강하게 |
| `--p` | 개인화(personalization). 이미지 평가로 만든 취향 프로필을 적용 | 프로필 코드 | bed93jl, 게시자의 취향 프로필 |
| `--v` | 모델 버전 | 생략하면 기본 모델 | 6.1, 옛 모델을 고정 |

## 쓰는 요령

- 분위기를 일정하게 유지하려면 `--sref` 코드와 `--sw`를 고정하고 문장만 바꾼다.
- 시안을 넓게 보고 싶으면 `--c`를 올리고, 정리된 결과가 필요하면 낮춘다.
- `--p` 코드는 만든 사람의 취향을 따라가므로 다른 사람 코드를 쓰면 결과가 그 사람 쪽으로 기운다. 빼고 비교해 본다.
- 모델 버전마다 지원하는 파라미터가 다르다. 예를 들어 `--weird`나 옛 `--sref` 코드는 버전에 따라 동작이 달라지니, 쓰기 전에 공식 [Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)에서 지금 모델의 지원 여부를 확인한다.

## 정리

- 문장은 대상과 색, 파라미터는 형식과 화풍을 정한다.
- 스타일 참조 코드와 가중치가 결과의 인상을 가장 크게 바꾼다.

관련 노트: [[ai-frontend-design-prompting|AI 모델로 완성도 높은 프론트엔드 디자인 뽑기]], [[prompt-cheat-sheet|프롬프트 작성법 치트시트]]
