---
title: "Swift Codable: JSON 인코딩과 디코딩"
concept: "Codable"
summary: "Swift에서 타입을 JSON 같은 외부 표현으로 바꾸고 되돌리는 Codable. Encodable과 Decodable을 합친 타입 별칭이라는 정체, 자동 합성 조건, JSONEncoder·JSONDecoder 사용법, CodingKeys로 키 이름 맞추기와 snake_case 변환 전략을 정리한다."
tags: ["mobile", "swift", "ios", "json"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/7ff7204ed08f4d0dbfc0835f202b654b", "https://developer.apple.com/documentation/foundation/encoding-and-decoding-custom-types"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「(Swift) Codable 그리고 Encoding, Decoding」을 바탕으로 재구성한 노트다.

**Codable**은 Swift 타입이 **자기 자신을 외부 표현(JSON, Property List 등)으로 바꾸거나, 외부 표현에서 자기 자신을 만들 수 있다**는 약속이다. 서버 응답 JSON을 구조체로 받고, 구조체를 JSON으로 보내는 일이 대부분 이것으로 끝난다. SwiftUI 튜토리얼의 모델 코드에 설명 없이 붙어 나오는 `: Codable`이 바로 이것이다.

## 정체: 두 프로토콜의 별칭

```swift
typealias Codable = Decodable & Encodable
```

Codable은 프로토콜이 아니라 **두 프로토콜을 합친 타입 별칭**이다.

| 프로토콜 | 방향 | 쓰는 도구 |
| --- | --- | --- |
| `Encodable` | 내 타입 → 외부 표현 (인코딩) | `JSONEncoder`, `PropertyListEncoder` |
| `Decodable` | 외부 표현 → 내 타입 (디코딩) | `JSONDecoder`, `PropertyListDecoder` |

양방향이 모두 필요하면 `Codable`, 한쪽만 필요하면 그쪽만 채택한다. 응답을 읽기만 하는 모델은 `Decodable`이면 충분하다.

## 자동 합성

모든 저장 프로퍼티가 이미 Codable이면, 채택만 해도 컴파일러가 인코딩·디코딩 코드를 **자동으로 만들어 준다.** `String`, `Int`, `Double`, `Bool` 같은 표준 타입, `Date`·`Data`·`URL` 같은 Foundation 타입, 그리고 원소가 Codable인 `Array`·`Dictionary`·`Optional`이 여기에 속한다. 직접 만든 Codable 타입을 프로퍼티로 중첩해도 된다.

```swift
struct Dinner: Codable {
    var menu: String
    var price: Int
}
```

## 인코딩과 디코딩

```swift
// 인코딩: 인스턴스 → Data(JSON)
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let data = try encoder.encode(Dinner(menu: "치킨", price: 20000))
print(String(decoding: data, as: UTF8.self))
// { "menu" : "치킨", "price" : 20000 }

// 디코딩: Data(JSON) → 인스턴스
let json = #"{"menu":"피자","price":18000}"#.data(using: .utf8)!
let dinner = try JSONDecoder().decode(Dinner.self, from: json)
print(dinner.menu) // 피자
```

- `encode`·`decode`는 `throws` 함수다. `try?`로 실패를 nil로 뭉개면 원인을 잃으니, 개발 중에는 `do`/`catch`로 `DecodingError`를 출력해 어떤 키가 없거나 타입이 틀렸는지 확인한다.
- JSON에 키가 없을 수 있으면 프로퍼티를 옵셔널(`String?`)로 선언한다. 옵셔널이 아닌데 키가 없으면 디코딩 전체가 실패한다.
- 디코딩 대상은 `Dinner.self`처럼 **타입 자체**를 넘긴다. 배열이면 `[Dinner].self`다.

## 키 이름이 다를 때

서버는 `founding_date`, Swift는 `foundingYear`처럼 이름 규칙이 다를 때가 많다.

### snake_case 일괄 변환

```swift
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase // founding_year → foundingYear
let encoder = JSONEncoder()
encoder.keyEncodingStrategy = .convertToSnakeCase
```

### CodingKeys로 하나씩 지정

```swift
struct Landmark: Codable {
    var name: String
    var foundingYear: Int
    var location: Coordinate

    enum CodingKeys: String, CodingKey {
        case name = "title"               // JSON의 "title" ↔ name
        case foundingYear = "founding_date"
        case location                     // 이름이 같으면 그대로
    }
}
```

`CodingKeys`에 **없는 프로퍼티는 인코딩·디코딩에서 빠진다.** 그 프로퍼티에는 기본값이 있어야 디코딩이 된다. 화면 전용 상태처럼 JSON과 무관한 값을 모델에 둘 때 쓴다.

### 직접 구현

날짜 형식이 섞여 있거나, 중첩 구조를 평평하게 펴거나, 값에 따라 다른 타입으로 디코딩해야 하면 `init(from decoder:)`와 `encode(to encoder:)`를 직접 구현한다. 날짜만 문제라면 먼저 `decoder.dateDecodingStrategy = .iso8601`로 해결되는지 본다.

## 정리

- `Codable` = `Encodable & Decodable`. 필요한 방향만 채택해도 된다.
- 프로퍼티가 모두 Codable이면 구현 없이 자동 합성된다.
- `JSONEncoder().encode(값)`, `JSONDecoder().decode(타입.self, from: data)`. 둘 다 `throws`다.
- 키 이름 차이는 `keyDecodingStrategy`로 일괄, `CodingKeys`로 개별 처리한다. 없을 수 있는 키는 옵셔널로 둔다.

관련 노트: [[ios-app-fundamentals|iOS 앱 기본 개념]], [[mobile-frameworks|모바일 앱 프레임워크 비교]], [[dart-language|Dart 핵심 문법]], [[ios-collection-view-layout|UICollectionView 커스텀 레이아웃]]
