---
title: "Blender 재질·UV 매핑·리깅"
concept: "UV Mapping"
summary: "Shade Smooth와 Mirror로 형태를 다듬고, 재질·이미지 텍스처를 입히고, UV를 펼친 뒤 뼈를 심어 움직이게 하는 과정."
tags: ["blender", "3d", "texture", "rigging"]
source: notion
---

모델링이 끝나면 **표면을 다듬고(Shading) → 색과 질감을 입히고(Material/Texture) → 텍스처가 제대로 붙도록 UV를 펼치고 → 뼈를 심어 움직일 수 있게(Rigging)** 만듭니다. 레고 피규어를 만들며 이 흐름을 한 번에 연습했습니다.

## 표면 다듬기

- **Shade Smooth**: 개체 선택 → 우클릭 → Shade Smooth. 각진 면을 매끄럽게 보이게 한다 (형태는 그대로, 보이는 음영만 변경).
- **좌우 반전(대칭 복제)**: 우클릭 → Set Origin으로 기준점을 잡은 뒤 `S` `X` `-1`. 또는 **Mirror 모디파이어**로 한쪽만 모델링하고 반대쪽을 자동 생성한다.
- Mirror 처리한 부품들은 모디파이어를 **Apply** 한 뒤 필요하면 `Ctrl + J`로 Join 해서 하나로 합친다.

## 재질과 텍스처

1. Properties 패널의 **Material Properties**에서 새 재질을 만들고 Base Color를 지정한다.
2. 뷰포트를 Material Preview 모드로 바꿔 결과를 확인한다.
3. 주의: 여러 부품을 **Join한 개체는 재질이 전체에 한꺼번에 적용**된다. 부위별로 다른 색을 주려면 Edit 모드에서 면을 선택해 슬롯별로 재질을 Assign 하거나, 아래처럼 이미지 텍스처를 쓴다.

### 이미지 텍스처

- Photoshop 등으로 텍스처 이미지를 만든다 (`F7` 레이어 패널, `Alt + Delete`로 전경색 채우기, Custom Shape로 무늬).
- Blender에서 Base Color를 **Image Texture**로 바꾸고 이미지를 불러온다.
- 나무 결 같은 사실적인 재질은 텍스처 사이트(예: textures.com)의 이미지를 활용한다.

## UV 매핑

3D 표면을 2D 평면으로 **펼친 지도(UV)** 가 있어야 이미지 텍스처가 원하는 위치에 정확히 붙습니다. 전개도를 그리는 것과 같습니다.

1. Object 모드에서 부품들을 모두 선택 → `Ctrl + A` → **Rotation & Scale** 적용
2. 상단 탭에서 **UV Editing** 워크스페이스로 이동
3. 자를 선(이음매)을 선택해 **Mark Seam** — 전개도의 자르는 선에 해당
4. `A`로 전체 선택 → `U` → **Unwrap**으로 펼치기 (단순한 형태는 Project from View도 가능)
5. UV 편집기에서 면 하나를 선택하고 `Ctrl + L`로 연결된 조각(island) 전체를 선택해 위치 조정
6. 조각들이 서로 겹치지 않도록 펼쳐 배치한다. 머리·몸통 등 부위별로 같은 과정을 반복한다.

## 리깅 (Rigging)

리깅은 모델 안에 **뼈대(Armature)** 를 심고 메시를 뼈에 연결해, 뼈를 움직이면 모델이 따라 움직이게 하는 작업입니다.

### 한쪽 팔·다리를 양쪽으로 만들기

`Shift + S` → **Cursor to World Origin** → 부품 선택 후 우클릭 → **Set Origin → Origin to 3D Cursor** → `Shift + D`로 복제 → `S` `Y` `-1`로 반대편에 뒤집어 배치

### 뼈 심기와 연결

1. 양팔, 양다리, 몸통 5곳에 Bone을 추가한다.
2. 메시 오브젝트들을 모두 선택한 뒤, 마지막으로 `Ctrl` + 클릭으로 Armature를 선택(활성 개체)한다.
3. `Ctrl + P` → **Armature Deform → With Automatic Weights**: 각 메시가 가까운 뼈의 영향을 자동으로 받도록 연결된다.
4. 뼈 이름을 `arm.L`, `arm.R` 처럼 알아보기 쉽게 바꾼다.
5. 필요하면 별도의 **컨트롤러**(조작용 개체)를 만들어 뼈들과 연결하면 애니메이션 작업이 편해진다.
