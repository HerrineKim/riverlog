---
title: "Google Sheets vs Excel"
concept: "Google Sheets"
summary: "엑셀보다 느리지만 공동 작업·클라우드·배열 함수·Apps Script 덕분에 협업과 자동화에 강한 Google Sheets의 장점."
tags: ["spreadsheet", "productivity", "automation"]
source: notion
date: "2026-10-13"
---

Excel은 대용량 계산이 빠르고 기능이 풍부하지만, 여러 사람이 같은 데이터를 계속 갱신하며 쓰는 업무라면 Google Sheets가 더 유리한 경우가 많다.

> 참고: 아래 비교는 설치형 Excel을 기준으로 한 것이다. Microsoft 365의 Excel도 OneDrive·SharePoint에 저장하면 공동 편집이 되고, 동적 배열 수식(`FILTER`, `SORT`, `UNIQUE` 등)과 스크립트 자동화(Office Scripts)를 지원하므로 차이가 많이 줄었다. 그래도 "처음부터 브라우저에서 공유되는 하나의 파일"이라는 점은 여전히 Sheets의 강점이다.

## Google Sheets를 쓰는 이유

| 장점 | 설명 |
| --- | --- |
| 공동 작업 | 모두가 **단 하나의 최종 파일**을 함께 편집한다. "최종_진짜최종.xlsx" 문제가 없다 |
| 클라우드 | 브라우저만 있으면 어디서든 접근, 내 PC를 꺼도 작업과 공유가 유지된다 |
| 배열 함수 | `ARRAYFORMULA` 등으로 수식 하나가 범위 전체를 계산해, 행이 늘어도 수식을 고칠 필요가 없다 |
| Apps Script | JavaScript 기반 스크립트와 트리거로 정해진 시간에 자동 실행되는 업무 자동화가 가능하다 |

단점은 데이터가 커질수록 느려진다는 점이다.

엑셀로 매번 손으로 하던 작업을 Google Sheets에서는 아예 안 해도 되는 경우가 많다. 원본과 이미 연결된 데이터가 자동으로 들어오고, 필터와 배열 수식이 새 행까지 알아서 계산하며, 파일은 처음부터 공유되어 있기 때문이다. 또 셀마다 수식을 복사해 둔 예전 방식의 엑셀에서는 값 하나를 누군가 손으로 덮어써도 티가 나지 않지만, Sheets의 배열 수식은 결과가 펼쳐질 자리에 그런 칸이 생기면 결과가 깨져서(`#REF!`) 바로 드러난다. (Excel의 동적 배열도 같은 상황에서 [`#SPILL!` 오류](https://support.microsoft.com/en-US/excel/how-to-correct-a-spill-error)를 낸다.)

## IMPORTRANGE: 다른 파일의 최신 데이터 연결

다른 스프레드시트의 값을 참조하는 방식이 다르다.

```text
# Excel: 다른 통합 문서 참조 (원본 파일 위치가 바뀌면 깨지기 쉽다)
='[파일명.xlsx]data'!$K$13

# Google Sheets: URL(또는 키)로 참조
=IMPORTRANGE("https://docs.google.com/spreadsheets/d/<스프레드시트키>", "data!K13")
```

- 처음 연결할 때 한 번 **액세스 허용**을 눌러야 한다.
- 문법은 엑셀보다 길어 보이지만, 원본이 수정되면 자동으로 최신 값이 반영되고 권한도 Google 계정으로 관리되어 안전하다.
- 범위 전체(`"data!A1:K100"`)를 가져와 `QUERY`, `FILTER`와 조합하면 여러 파일을 하나의 대시보드로 묶을 수 있다.
