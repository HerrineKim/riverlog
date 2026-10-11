---
title: "Google Sheets vs Excel"
concept: "Google Sheets"
summary: "엑셀보다 느리지만 공동 작업·클라우드·배열 함수·Apps Script 덕분에 협업과 자동화에 강한 Google Sheets의 장점."
tags: ["spreadsheet", "productivity", "automation"]
source: notion
---

Excel은 대용량 계산이 빠르고 기능이 풍부하지만, **여러 사람이 같은 데이터를 계속 갱신하며 쓰는 업무**라면 Google Sheets가 더 유리한 경우가 많습니다.

## Google Sheets를 쓰는 이유

| 장점 | 설명 |
| --- | --- |
| 공동 작업 | 모두가 **단 하나의 최종 파일**을 함께 편집한다. "최종_진짜최종.xlsx" 문제가 없다 |
| 클라우드 | 브라우저만 있으면 어디서든 접근, 내 PC를 꺼도 작업과 공유가 유지된다 |
| 배열 함수 | `ARRAYFORMULA` 등으로 수식 하나가 범위 전체를 계산해, 행이 늘어도 수식을 고칠 필요가 없다 |
| Apps Script | JavaScript 기반 스크립트와 트리거로 정해진 시간에 자동 실행되는 업무 자동화가 가능하다 |

단점은 데이터가 커질수록 **느려진다**는 점입니다.

## IMPORTRANGE: 다른 파일의 최신 데이터 연결

다른 스프레드시트의 값을 참조하는 방식이 다릅니다.

```text
# Excel: 다른 통합 문서 참조 (원본 파일 위치가 바뀌면 깨지기 쉽다)
='[파일명.xlsx]data'!$K$13

# Google Sheets: URL(또는 키)로 참조
=IMPORTRANGE("https://docs.google.com/spreadsheets/d/<스프레드시트키>", "data!K13")
```

- 처음 연결할 때 한 번 **액세스 허용**을 눌러야 한다.
- 문법은 엑셀보다 길어 보이지만, 원본이 수정되면 자동으로 최신 값이 반영되고 권한도 Google 계정으로 관리되어 안전하다.
- 범위 전체(`"data!A1:K100"`)를 가져와 `QUERY`, `FILTER`와 조합하면 여러 파일을 하나의 대시보드로 묶을 수 있다.
