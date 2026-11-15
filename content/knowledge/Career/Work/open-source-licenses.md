---
title: "오픈소스 라이선스: 허용형과 카피레프트"
concept: "Open Source License"
summary: "오픈소스 라이선스는 사용·수정·배포를 허락하는 조건이다. MIT·BSD·Apache 2.0 같은 허용형과 MPL·LGPL·GPL·AGPL 같은 카피레프트를 소스 공개 의무, 같은 라이선스 강제, 특허 조항으로 비교하고, 라이선스 호환성, 라이선스 없는 저장소의 의미, SPDX 표기, 오픈소스가 아닌 소스 공개 라이선스(BSL·SSPL)로의 전환 흐름을 정리한다."
tags: ["open-source", "career", "collaboration", "legal"]
source: other
date: "2026-10-21"
sources: ["https://medium.freecodecamp.org/how-open-source-licenses-work-and-how-to-add-them-to-your-projects-34310c3cf94", "https://opensource.org/licenses", "https://choosealicense.com/", "https://spdx.org/licenses/"]
---

> freeCodeCamp의 「[How open source licenses work and how to add them to your projects](https://medium.freecodecamp.org/how-open-source-licenses-work-and-how-to-add-them-to-your-projects-34310c3cf94)」(2017)를 바탕으로, OSI의 [승인 라이선스 목록](https://opensource.org/licenses), [choosealicense.com](https://choosealicense.com/), [SPDX 라이선스 목록](https://spdx.org/licenses/)으로 확인해 재구성한 노트다. 법률 자문이 아니다.

## 오픈소스 라이선스란

코드는 쓰는 순간 저작권이 생긴다. **라이선스가 없으면 남은 코드를 볼 수는 있어도 쓰거나 고치거나 배포할 권리가 없다**(all rights reserved). GitHub의 공개 저장소도 마찬가지다. 오픈소스 라이선스는 저작권자가 그 권리를 조건부로 넘겨주는 문서다.

「오픈소스」라는 이름은 OSI(Open Source Initiative, 1998년 설립)가 정한 오픈소스 정의(OSD)를 만족하고 승인받은 라이선스에만 붙인다. 승인된 라이선스는 대부분 다음을 공통으로 담는다.

- 수정, 상업적 사용, 배포, 사적 사용을 허락한다.
- 라이선스와 저작권 고지를 함께 담아야 한다.
- 작성자는 보증하지 않고 책임지지 않는다.

## 두 계열: 허용형과 카피레프트

| 계열 | 원칙 | 대표 |
| --- | --- | --- |
| **허용형(permissive)** | 고지만 남기면 무엇이든 해도 된다. 수정본을 비공개 상용 제품에 넣어도 된다 | MIT, BSD-2/3-Clause, Apache 2.0, ISC |
| **약한 카피레프트(weak copyleft)** | 그 라이브러리(또는 파일) 자체를 고친 부분만 같은 라이선스로 공개한다. 가져다 쓰는 쪽 코드는 자유다 | MPL 2.0(파일 단위), LGPL(라이브러리 단위) |
| **강한 카피레프트(strong copyleft)** | 배포하는 파생물 **전체**를 같은 라이선스로, 소스와 함께 공개한다 | GPLv2, GPLv3 |
| **네트워크 카피레프트** | 배포하지 않고 서버에서 서비스로만 제공해도 사용자에게 소스를 공개한다. GPL의 「SaaS 구멍」을 막는다 | AGPLv3 |

## 주요 라이선스 비교

제한이 강한 쪽에서 약한 쪽 순서다(사용자 입장).

| 라이선스 | 배포할 때 소스 공개 | 수정본도 같은 라이선스 | 변경 사항 표시 | 특허 | 대표 프로젝트 |
| --- | --- | --- | --- | --- | --- |
| AGPLv3 | 필수(네트워크 제공 포함) | 필수 | 필수 | 명시적 특허 허락 | Grafana, MongoDB(2018년 전), Nextcloud |
| GPLv3 | 필수 | 필수 | 필수 | 명시적 특허 허락. 특허 소송을 걸면 권리를 잃는다 | Bash, GIMP |
| GPLv2 | 필수 | 필수 | 필수 | 명시 없음(v3에서 추가) | Linux 커널, Git |
| LGPL·MPL 2.0 | 그 라이브러리·파일만 | 그 부분만 | 필수 | 명시적 허락 | Firefox(MPL) |
| Apache 2.0 | 필요 없음 | 아무 라이선스나 | 필수(NOTICE 유지) | 명시적 특허 허락. 상표 사용 금지 | Android, Kubernetes, Swift |
| BSD-3-Clause | 필요 없음 | 아무 라이선스나 | 필요 없음 | 명시 없음. 저작자 이름으로 파생물 홍보 금지 | Go |
| MIT | 필요 없음 | 아무 라이선스나 | 필요 없음 | 명시 없음 | React, Rails, jQuery, Bootstrap |

- GPLv2와 v3의 핵심 차이는 **특허 조항**과, 기기 제조사가 수정 소프트웨어 설치를 막는 것(티보이제이션)을 금지한 점이다.
- 허용형 중에서 특허 분쟁이 걱정되는 회사 프로젝트는 명시적 특허 허락이 있는 **Apache 2.0**을, 가장 단순한 것을 원하면 **MIT**를 고른다.

## 호환성: 가장 흔한 실수

**내 코드의 라이선스는 내가 쓰는(링크하는) 오픈소스의 라이선스와 호환돼야 한다.** 독점(비공개) 제품에 GPL 라이브러리를 넣어 배포하면 제품 전체를 GPL로 공개해야 한다. 그래서 회사는 의존성 라이선스를 자동으로 검사한다(FOSSA, `license-checker`, GitHub의 의존성 그래프).

| 쓰려는 라이브러리 | 독점 제품에 넣어 배포 | 서버에서만 실행(SaaS) |
| --- | --- | --- |
| MIT·BSD·Apache 2.0 | 고지만 남기면 된다 | 된다 |
| LGPL·MPL | 라이브러리를 고치지 않고 동적 링크·별도 파일로 쓰면 된다 | 된다 |
| GPL | 제품 전체를 GPL로 공개해야 한다 | 배포가 아니라서 공개 의무가 없다 |
| AGPL | 제품 전체를 AGPL로 공개해야 한다 | 사용자에게 소스를 공개해야 한다 |

Apache 2.0 코드는 GPLv3 프로젝트에 넣을 수 있지만 GPLv2 전용 프로젝트에는 넣을 수 없다(특허 조항 충돌).

## 프로젝트에 라이선스 붙이기

1. 저장소 루트에 `LICENSE`(또는 `LICENSE.md`, `LICENSE.txt`) 파일을 둔다. GitHub에서 새 파일 이름을 `LICENSE`로 입력하면 **라이선스 템플릿 선택** 버튼이 뜬다.
2. 연도와 저작권자 이름을 채운다.
3. 패키지 메타데이터에 **SPDX 식별자**를 적는다. `package.json`의 `"license": "MIT"`, 파일 머리의 `// SPDX-License-Identifier: Apache-2.0`처럼 쓴다. 둘 중 선택이면 `"MIT OR Apache-2.0"`(Rust 생태계의 관례)처럼 쓴다.

고르기 어려우면 choosealicense.com에서 「단순하고 허용적인 것(MIT)」, 「특허가 걱정됨(Apache 2.0)」, 「공유를 강제하고 싶음(GPLv3)」 중에서 출발한다.

## 오픈소스가 아닌 「소스 공개」 라이선스

클라우드 사업자가 오픈소스 DB를 그대로 관리형 서비스로 파는 일이 늘자, 일부 회사는 라이선스를 바꿨다. 이 라이선스들은 소스를 볼 수는 있어도 **OSI 기준으로는 오픈소스가 아니다**.

| 라이선스 | 제한 | 바꾼 예와 그 뒤 |
| --- | --- | --- |
| SSPL | 서비스로 제공하면 서비스 운영 스택 전체의 소스를 공개 | MongoDB(2018), Elasticsearch(2021). Elastic은 2024년 AGPL을 선택지로 다시 더했다 |
| BSL(Business Source License) | 경쟁하는 상용 사용 금지. 몇 년 뒤 오픈소스 라이선스로 자동 전환 | HashiCorp Terraform(2023) → 커뮤니티가 MPL 시절 코드를 포크해 OpenTofu를 만들었다 |
| RSAL·SSPL 이중 | 관리형 서비스 제공 제한 | Redis(2024) → Valkey 포크가 생겼고, Redis 8(2025)은 AGPLv3를 선택지로 더했다 |

의존성의 라이선스는 버전마다 바뀔 수 있다. 메이저 업그레이드 때 라이선스도 다시 확인한다.

## 정리

- 라이선스 없는 코드는 쓸 수 없다. 공개 저장소라도 마찬가지다.
- 허용형(MIT·BSD·Apache)은 고지만 남기면 되고, 카피레프트(GPL·AGPL)는 파생물을 같은 조건으로 공개해야 한다.
- 독점 제품에 GPL·AGPL 의존성을 넣지 않도록 자동 검사한다. AGPL은 SaaS에도 적용된다.
- 내 프로젝트에는 `LICENSE` 파일과 SPDX 식별자를 붙인다.
- BSL·SSPL은 소스 공개일 뿐 오픈소스가 아니다.

관련 노트: [[open-source-contribution|오픈소스 기여 시작하기]], [[open-source-maintenance|오픈소스 프로젝트 운영]], [[package-managers|패키지 매니저]]
