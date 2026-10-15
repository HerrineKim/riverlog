---
title: "Blender"
concept: "Blender"
summary: "무료 오픈소스 3D 제작 도구 Blender의 화면 조작과 변형 단축키, Edit 모드, 모디파이어, 메시 편집 도구, 그리고 모델링 이후의 Shading → Material → UV → Rigging 흐름."
tags: ["blender", "3d", "modeling", "texture", "rigging"]
source: notion
date: "2026-10-13"
---

Blender는 모델링·재질·애니메이션·렌더링까지 지원하는 **무료 오픈소스 3D 제작 도구**다. 대형 영화·게임 스튜디오의 파이프라인은 Maya 같은 상용 툴 중심인 곳이 많지만, 인디·중소 스튜디오와 개인 작업에서는 Blender가 널리 쓰인다. 실무에서는 Blender로 모델링하고, 텍스처 편집은 Photoshop, 텍스처 페인팅은 Substance 3D Painter 같은 도구를 함께 쓴다.

## 화면 조작

| 조작 | 기능 |
| --- | --- |
| 휠 드래그 | 시점 회전 |
| `Shift` + 휠 드래그 | 시점 이동(Pan) |
| `Ctrl` + 휠 드래그 / 휠 스크롤 | 확대·축소 |
| 숫자 패드 | 정면·측면·위 등 고정 시점 |
| 숫자 패드 `/` | 선택한 개체만 보기(Local View) |
| `Alt + Z` | 엑스레이 모드 (가려진 점·면도 선택 가능) |
| `N` / `T` | 우측 사이드바(Item, Tool, View) / 좌측 툴바 |
| 영역 경계 우클릭 → Vertical/Horizontal Split | 화면 분할 |
| 뷰포트 우측 상단 구 아이콘 | Material Preview·Rendered로 조명·재질이 적용된 결과 보기 |

## 변형 단축키

Blender는 마우스 드래그보다 **"단축키 + 축 + 수치"** 조합으로 정확하게 다룬다. 축 키(`X`/`Y`/`Z`)를 생략하면 자유 변형이다.

| 단축키 | 기능 | 예 |
| --- | --- | --- |
| `G` | 이동(Grab) | `G` `Z` `1` → Z축으로 1m 이동 |
| `S` | 크기(Scale) | `S` `Z` `0` → Z 방향 점들을 한 평면에 정렬. `S` `X` `-1` → 좌우 반전 |
| `R` | 회전(Rotate) | `R` `Z` `90` → Z축으로 90° 회전 |
| `E` | 돌출(Extrude) | 선택한 면을 수직 방향으로 뽑아낸다 |
| `F` | 면 채우기 | 선택한 점·선 사이를 면으로 메운다 |
| `Shift + D` | 복제(Duplicate) | 복제 후 바로 `G`·`R`로 배치. `R` `Z` `72`를 반복하면 360°/5 간격의 다리 5개 |
| `Ctrl + A` | 변형 적용 | **All Transforms**(또는 Rotation & Scale)로 크기·회전 값을 메시에 굳힌다. Bevel·UV 전에 해 둔다 |
| `Tab` | Object 모드 ↔ Edit 모드 | |

## Edit 모드

| 조작 | 기능 |
| --- | --- |
| `1` / `2` / `3` | 점(Vertex) / 선(Edge) / 면(Face) 선택 모드 |
| `Shift` + 클릭, `A` | 다중 선택, 전체 선택 |
| 우클릭 → Separate → Selection | 선택한 부분을 별도 개체로 분리 |
| `Ctrl + J` (Object 모드) | 여러 개체를 하나로 합치기(Join) |
| `M` (Object 모드) | 개체를 컬렉션으로 정리 |
| Pivot Point | 변형 기준점(3D 커서, 개별 원점 등)을 바꾼다 |

## 핵심 메시 편집 도구

선을 추가하고 자르고 합치는 도구로 가구 같은 복잡한 형태를 만든다.

| 단축키 | 도구 | 용도 |
| --- | --- | --- |
| `Ctrl + R` | Loop Cut | 면을 가로지르는 고리 모양 선 추가. 휠·숫자로 분할 수 지정 → 클릭 후 위치 조정(우클릭 시 가운데) |
| `I` | Inset Faces | 선택한 면 안쪽에 테두리 면 생성. `I`를 한 번 더 누르면 면마다 개별 Inset. 책장 칸·서랍 홈의 기본 |
| `K` | Knife | 원하는 경로로 면을 자른다. 실행 중 `C`로 보이지 않는 뒷면까지 관통 |
| `Alt` + 선 클릭 | Loop Select | 이어진 선 고리 전체 선택 |
| `Ctrl + X` | Dissolve | 형태를 유지하면서 선·점 제거. `X` → Delete는 구멍이 생긴다 |
| `M` → By Distance | Merge by Distance | 겹친 점들을 하나로 합친다. 복제·대칭 작업 뒤 정리용 |
| 상단 과녁 아이콘 | Proportional Editing | 선택한 점 주변까지 부드럽게 함께 움직여 쿠션처럼 볼록한 면을 만든다 |

## 모디파이어 (Modifier)

모디파이어는 원본 메시(Mesh)를 직접 고치지 않고 **비파괴적으로** 형태를 바꾼다. 켜고 끄며 결과를 비교하고, 확정하면 **Apply**한다.

| 모디파이어 | 하는 일 | 팁 |
| --- | --- | --- |
| Bevel | 모서리를 둥글게 깎는다. Edit 모드의 `Ctrl + B`와 같은 효과 | 먼저 All Transforms를 적용해야 고르게 들어간다. Segments 3 정도면 부드럽다 |
| Subdivision Surface | 면을 잘게 나눠 표면을 부드럽게 만든다 | 모서리가 뭉개지면 Bevel이나 Loop Cut으로 모서리 근처에 선을 더한다 |
| Array | 같은 개체를 일정 간격으로 반복 배치 | 판자 하나에 Array를 걸면 마룻바닥이 된다 |
| Mirror | 한쪽만 모델링하면 반대쪽을 자동 생성 | 대칭 부품은 Mirror 후 Apply → 필요하면 Join |

> **Bevel 뒤에 Subdivision을 넣으면 선이 너무 많아져 형태가 이상해질 수 있다.** Bevel 모디파이어의 **Limit Method를 Angle**로 두면 일정 각도 이상인 모서리에만 Bevel이 들어가 불필요한 선이 늘지 않는다.

## 모델링 이후의 흐름

```text
Shading(표면 다듬기) → Material/Texture(색·질감) → UV(전개도) → Rigging(뼈 심기)
```

| 단계 | 하는 일 | 방법·주의 |
| --- | --- | --- |
| Shading | 각진 면을 매끄럽게 보이게 한다 | 우클릭 → **Shade Smooth**. 형태는 그대로, 음영만 바뀐다 |
| Material | 색과 질감을 입힌다 | Material Properties에서 새 재질 → Base Color. **Join한 개체는 재질이 전체에 적용**되므로 부위별 색은 Edit 모드에서 면을 골라 슬롯별로 Assign한다 |
| Texture | 이미지로 무늬·질감을 준다 | Base Color를 **Image Texture**로 바꾸고 이미지를 불러온다. 나무 결 같은 사실적 재질은 텍스처 사이트 이미지를 쓴다 |
| UV | 3D 표면을 2D로 펼친 지도를 만든다. 이것이 있어야 텍스처가 원하는 자리에 붙는다 | Rotation & Scale 적용 → **UV Editing** 워크스페이스 → 이음매에 **Mark Seam** → `U` → **Unwrap** → `Ctrl + L`로 조각(island) 단위 선택해 겹치지 않게 배치 |
| Rigging | 뼈대(Armature)를 심고 메시를 연결해 뼈를 움직이면 모델이 따라오게 한다 | Bone 추가 → 메시들을 선택하고 마지막에 Armature 선택 → `Ctrl + P` → **Armature Deform → With Automatic Weights**. 뼈 이름은 `arm.L`·`arm.R`처럼 짓고, 필요하면 컨트롤러 개체를 따로 둔다 |

한쪽 팔·다리를 반대편에 복제할 때는 `Shift + S` → **Cursor to World Origin** → Set Origin → **Origin to 3D Cursor** → `Shift + D` → `S` `Y` `-1` 순서로 원점 기준 대칭 복제한다.

## 연습 팁

- 첫 연습 대상은 **아이소메트릭(isometric) 방**이 좋다. 세 축이 같은 각도로 보이는 등각 투영 시점의 방으로, 큐브 몇 개로 벽·바닥·가구를 만들며 기본 조작을 모두 익힌다.
- 레고 피규어 같은 단순한 모델을 **40분 안에 완성**하는 연습을 여러 번 반복하면 "다음에 무엇을 할지" 계산하는 감각이 생긴다. Shading부터 Rigging까지 한 흐름으로 연습하기에도 좋다.
- 작업 중 프로그램이 꺼질 수 있으니 File → Auto Save 설정을 확인해 둔다.

## 정리

- 변형은 "단축키 + 축 + 수치"로 정확하게 한다.
- 모서리·반복·대칭은 모디파이어로 비파괴적으로 처리하고, Bevel과 Subdivision을 함께 쓸 때는 Limit Method를 Angle로 둔다.
- Bevel·UV 전에는 `Ctrl + A`로 변형을 적용한다.
- 모델링 뒤에는 Shading → Material → UV → Rigging 순서로 진행한다.

관련 노트: [[threejs|Three.js]]
