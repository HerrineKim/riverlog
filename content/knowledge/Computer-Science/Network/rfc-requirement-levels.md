---
title: "RFC와 요구 수준 키워드"
concept: "RFC 2119"
summary: "인터넷 표준 문서인 RFC가 무엇이고 어떻게 읽는지, 그리고 명세에서 MUST·SHOULD·MAY가 정확히 무엇을 뜻하는지 정한 RFC 2119·8174의 요구 수준 키워드를 정리한다."
tags: ["network", "http", "web", "api"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/0745e619a39f4bd3b8b10280ab6592a8", "https://www.rfc-editor.org/rfc/rfc2119", "https://www.rfc-editor.org/rfc/rfc8174"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「RFC 2119 Requirement level 요약」을 바탕으로 재구성한 노트다. 원문은 [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119)와 [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)이다.

## RFC란

RFC(Request for Comments)는 **인터넷 기술을 정의하는 공식 문서 시리즈**다. 이름은 "의견을 구함"이지만, IETF(Internet Engineering Task Force)가 만든 TCP, HTTP, TLS, DNS 같은 인터넷 표준이 모두 RFC로 발행된다.

| 알아 둘 점 | 내용 |
| --- | --- |
| 번호는 바뀌지 않는다 | 한 번 발행된 RFC는 고치지 않는다. 내용이 바뀌면 새 번호로 발행하고 옛 문서를 "Obsoleted by"로 표시한다. HTTP/1.1은 RFC 2616 → 7230~7235 → 9110·9112로 대체됐다 |
| 모든 RFC가 표준은 아니다 | 범주가 있다: Standards Track(표준), Best Current Practice(BCP, 권장 운영 관행), Informational, Experimental, Historic. 만우절 농담 RFC도 있다 |
| 읽는 곳 | rfc-editor.org. 각 문서 머리에 상태, 대체 관계, 정오표(errata)가 나온다 |

웹 플랫폼 기능(HTML, Fetch, DOM)은 RFC가 아니라 WHATWG의 Living Standard와 W3C 명세로 정의된다.

## 요구 수준 키워드

명세가 "해야 한다"고 할 때 그것이 절대 규칙인지 권장인지 헷갈리면 구현마다 동작이 달라진다. RFC 2119는 명세에서 쓰는 몇 개의 영어 단어에 **정확한 의미**를 정했다.

| 키워드 | 뜻 | 어기면 |
| --- | --- | --- |
| **MUST**, REQUIRED, SHALL | 절대적 요구사항 | 명세 위반. 상호 운용이 깨진다 |
| **MUST NOT**, SHALL NOT | 절대 금지 | 명세 위반 |
| **SHOULD**, RECOMMENDED | 따르는 것이 원칙. 특별한 이유가 있으면 예외가 허용되지만 **그 영향을 이해하고 신중히 판단한 뒤**에만 | 위반은 아니지만 이유를 설명할 수 있어야 한다 |
| **SHOULD NOT**, NOT RECOMMENDED | 하지 않는 것이 원칙. 특별한 경우에만 허용 | 위와 같음 |
| **MAY**, OPTIONAL | 정말로 선택. 구현해도 안 해도 된다 | 해당 없음 |

**MAY**에는 단서가 붙는다. 선택 기능을 구현하지 않은 쪽도 그 기능을 구현한 상대와 함께 동작할 수 있어야 하고(기능은 줄더라도), 반대도 마찬가지다. 선택 사항이 상호 운용을 깨서는 안 된다는 뜻이다.

## 대문자일 때만 특별한 의미

RFC 8174(2017)가 한 가지를 분명히 했다. 이 키워드는 **모두 대문자로 쓸 때만** 위의 특별한 의미를 가진다. 소문자 "must"는 일반 영어다. 그래서 요즘 RFC는 서두에 이런 문장을 둔다.

```text
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174]
when, and only when, they appear in all capitals, as shown here.
```

BCP 14는 두 문서를 묶어 부르는 이름이다.

## 명세를 읽고 쓸 때

- 구현 범위를 정할 때는 MUST부터 채우고, SHOULD는 지키지 않을 이유를 기록하고, MAY는 필요할 때만 넣는다.
- 키워드는 상호 운용과 해를 막는 데 꼭 필요한 곳에만 쓴다는 것이 RFC 2119의 원칙이다. 구현 방식을 강요하는 데 쓰지 않는다.
- 사내 API 문서나 설계 문서에도 이 관례를 그대로 빌려 쓰면 "필수인지 권장인지"를 둘러싼 오해가 줄어든다.
- OpenAPI, JSON Schema, W3C·WHATWG 명세도 같은 키워드 관례를 따른다.

## 정리

- RFC는 인터넷 표준 문서 시리즈이고, 발행 후에는 고치지 않고 새 번호로 대체한다.
- MUST는 필수, SHOULD는 이유가 있을 때만 예외, MAY는 순수한 선택이다.
- **대문자일 때만** 이 의미다(RFC 8174).

관련 노트: [[http|HTTP 프로토콜]], [[https|HTTPS와 TLS]], [[osi-7-layer|OSI 7계층]]
