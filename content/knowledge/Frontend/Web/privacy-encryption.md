---
title: "프라이버시를 위한 암호화: 전송·저장·종단 간"
concept: "Encryption for Privacy"
summary: "사용자 데이터를 남이 읽지 못하게 하는 세 겹의 암호화. 전송 중은 HTTPS·리다이렉트·HSTS로, 저장 중은 클라우드 기본 암호화와 직접 관리 키로, 운영자조차 못 읽게 하려면 Web Crypto로 클라이언트에서 암호화하는 종단 간 암호화로 지킨다. 각 층이 막는 위협과 한계를 정리한다."
tags: ["privacy", "security", "http", "web", "javascript"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/privacy/encryption", "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto"]
---

> web.dev의 「[Learn Privacy](https://web.dev/learn/privacy)」 강좌의 암호화 모듈을 바탕으로 재구성한 노트다.

## 세 겹의 암호화

암호화는 데이터를 가진 사람 말고는 읽지 못하게 해 프라이버시를 지킨다. 어디에서 누구로부터 숨기느냐에 따라 세 층으로 나뉜다.

| 층 | 숨기는 대상 | 막는 위협 | 수단 |
| --- | --- | --- | --- |
| 전송 중(in transit) | 네트워크 경로의 제3자(ISP, 공용 Wi-Fi, 중간자) | 도청, 변조 | HTTPS, 리다이렉트, HSTS |
| 저장 중(at rest) | 서버·디스크를 손에 넣은 공격자 | 유출, 매체 도난 | 스토리지·DB 암호화 |
| 종단 간(end-to-end) | **서비스 운영자 자신** | 내부자, 서버 침해, 강제 제출 | 클라이언트에서 암호화, 키는 사용자만 |

## 전송 중: HTTPS를 빠짐없이

HTTPS는 요청을 읽거나 바꾸지 못하게 하고, 사용자의 ISP·Wi-Fi 제공자가 어떤 데이터를 보내는지도 숨긴다. 서비스 워커, 푸시, Web Share, Web Crypto 같은 API는 보안 컨텍스트(HTTPS)에서만 동작한다. 인증서·핸드셰이크 원리는 [[https|HTTPS와 TLS]], 전환 절차는 [[https-migration|HTTPS 전환]]에 있다.

빠짐없이 덮으려면 세 가지가 함께 필요하다.

| 단계 | 역할 | 비고 |
| --- | --- | --- |
| HTTP → HTTPS 301 리다이렉트 | `http://`로 들어온 요청을 옮긴다 | HSTS를 켠 뒤에도 유지한다. preload 목록 등록 조건이기도 하다 |
| `Strict-Transport-Security` | 한 번 받은 브라우저는 이후 그 사이트를 스스로 HTTPS로만 연다. 리다이렉트를 거치지 않는다 | 짧은 `max-age`로 시작해 단계적으로 약 2년(`63072000`)까지 늘린다. 되돌리기 어렵다 |
| CSP `upgrade-insecure-requests` | 페이지 안의 `http://` 하위 리소스를 HTTPS로 올려 요청한다 | 페이지 자체는 올리지 않고 기억하지도 않는다. 링크를 고치기 전 임시 보강이다 |

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains
Content-Security-Policy: upgrade-insecure-requests
```

인증서는 Let's Encrypt 같은 ACME 발급, 호스팅의 기본 제공, CDN·프록시 앞단 중에서 고른다. 프록시는 가장 쉽고 캐시·부하 분산도 얻지만 통제권 일부를 서드파티에 넘긴다([[third-party-privacy|서드파티와 프라이버시]]).

## 저장 중: 유출의 피해 줄이기

저장 데이터를 암호화하면 디스크나 백업을 빼 간 공격자도 키 없이는 읽지 못한다.

| 방식 | 장점 | 한계 |
| --- | --- | --- |
| 제공자 관리 암호화(S3·Cloud Storage·Azure Storage, RDS·Cloud SQL·Azure SQL 등) | 대부분 기본으로 켜져 있거나 설정 하나로 켠다. 투명하다 | 제공자 인프라 침해는 막지만, **내 애플리케이션의 취약점**으로 정상 경로를 통해 읽히는 것은 못 막는다 |
| 직접 관리 암호화(애플리케이션이 필드를 암호화) | 앱이 뚫려도 키가 따로 있으면 피해가 준다 | 키를 코드에 쓸 수 있게 하면서 공격자에게서 숨기는 **키 관리**가 어렵다. 보안 전문가와 설계한다 |

두 방식은 대체재가 아니라 겹쳐 쓰는 층이다.

## 종단 간: 운영자도 읽지 못하게

**종단 간 암호화(E2EE)** 는 브라우저에서 데이터를 암호화한 뒤 서버로 보낸다. 서버에는 읽을 수 없는 암호문만 남고 키는 사용자만 가진다. 메신저가 대표 예다.

클라이언트 저장소만 쓰면 용량 제한, 브라우저의 예고 없는 삭제([[browser-tracking-protection|ITP의 7일 제한]] 등), 기기 간 동기화 불가라는 한계가 있다. E2EE는 서버 저장의 편리함을 얻으면서 내용은 서버가 모르게 한다.

### URL 조각에 키를 담는 패턴

화이트보드 앱 Excalidraw의 공유 링크가 이 방식이다. 무작위 키로 그림을 암호화해 서버에 올리고, 키는 URL의 `#` 뒤에 붙인다. **조각(fragment)은 브라우저가 서버로 보내지 않으므로** 서버는 키를 보지 못한다.

```javascript
// 키 만들기와 암호화 (Web Crypto, 보안 컨텍스트 필요)
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
const iv = crypto.getRandomValues(new Uint8Array(12))
const data = new TextEncoder().encode(JSON.stringify(drawing))
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

const { id } = await upload(iv, ciphertext)            // 서버는 암호문만 받는다
const jwk = await crypto.subtle.exportKey('jwk', key)
const shareUrl = `${location.origin}/s/${id}#key=${jwk.k}` // 키는 fragment에만
```

- 직접 암호 알고리즘을 구현하지 않는다. 브라우저 내장 `crypto.subtle`(SubtleCrypto)을 쓴다.
- fragment는 서버 로그에는 안 남지만 방문 기록·화면 공유·복사한 링크에는 남는다. 링크 자체가 비밀번호다.
- 같은 페이지의 서드파티 스크립트는 `location.hash`를 읽을 수 있다. E2EE 페이지에는 서드파티 스크립트를 싣지 않는다.

### 한계

| 한계 | 뜻 |
| --- | --- |
| 코드를 믿어야 한다 | 서버가 어느 날 암호화하지 않는 JavaScript를 내려보내도 사용자는 알아채기 어렵다. 신뢰를 완전히 대신하지 못한다 |
| 키를 잃으면 끝 | 운영자도 복구할 수 없다. 데이터가 영구히 사라질 수 있다 |
| 서비스가 내용을 봐야 하면 못 쓴다 | 서버 검색, 추천, 서버 렌더링처럼 데이터를 읽어야 하는 기능과 맞지 않는다 |
| 사용성 | 사용자가 암호 전문가처럼 키를 관리하게 만들면 안 된다 |

E2EE가 맞지 않는다면, 애초에 그 데이터를 모을 필요가 있는지부터 다시 묻는다([[privacy-data-minimization|데이터 최소화]]).

## 정리

- 전송 중은 HTTPS + 301 + HSTS를 함께 건다. `upgrade-insecure-requests`는 보조다.
- 저장 중은 제공자 기본 암호화를 켜고, 민감 필드는 키를 따로 관리해 앱 침해에도 대비한다.
- 운영자도 몰라도 되는 데이터는 Web Crypto로 클라이언트에서 암호화하고 키를 서버에 보내지 않는다.
- 어떤 암호화도 "덜 모으기"를 대신하지 않는다.

관련 노트: [[https|HTTPS와 TLS]], [[https-migration|HTTPS 전환]], [[privacy-data-minimization|데이터 최소화와 프라이버시 실천]], [[third-party-privacy|서드파티와 프라이버시]], [[security|정보 시스템 보안(공격 기법과 암호)]]
