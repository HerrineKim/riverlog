---
title: "DNS"
concept: "DNS"
summary: "도메인 이름을 IP 주소로 바꿔 주는 DNS. 재귀·반복 질의 흐름, 주요 레코드 종류, TTL과 캐시, 프론트엔드에서 쓰는 dns-prefetch·preconnect를 정리한다."
tags: ["network", "dns", "web", "frontend"]
source: mixed
date: "2026-10-12"
---

## DNS란

DNS(Domain Name System)는 `example.com` 같은 **도메인 이름을 IP 주소로 바꿔 주는 분산 데이터베이스**다. 사람은 이름을 기억하고, 컴퓨터는 IP로 통신한다. 그 사이를 잇는 전화번호부 역할이다. 주로 UDP 53번 포트를 쓴다.

브라우저가 페이지를 열 때 가장 먼저 일어나는 네트워크 작업이 DNS 조회다. 조회가 느리면 그 뒤의 TCP·TLS 연결과 HTTP 요청이 모두 밀린다.

## 조회 흐름

```text
브라우저 캐시 → OS 캐시(hosts 파일 포함) → 리졸버(ISP·8.8.8.8·1.1.1.1)
                                              │
                         캐시에 없으면 리졸버가 대신 물어본다
                                              ▼
            루트 서버 ─▶ "com은 이 서버에 물어봐"
            .com TLD 서버 ─▶ "example.com은 이 서버에 물어봐"
            권한 있는(authoritative) 서버 ─▶ "93.184.215.14"
```

- 브라우저 → 리졸버는 **재귀 질의**다. "답을 다 찾아서 줘"라고 맡긴다.
- 리졸버 → 루트·TLD·권한 서버는 **반복 질의**다. 다음에 물을 곳을 받아 차례로 따라간다.

## 주요 레코드

| 레코드 | 의미 | 예 |
| --- | --- | --- |
| A | 도메인 → IPv4 | `example.com → 93.184.215.14` |
| AAAA | 도메인 → IPv6 | `example.com → 2606:2800::...` |
| CNAME | 다른 도메인의 별칭 | `www.example.com → example.com` |
| MX | 메일 서버 | `example.com → mail.example.com` |
| TXT | 임의 텍스트. 도메인 소유 인증, SPF 등 | `"v=spf1 ..."` |
| NS | 이 도메인을 맡은 네임서버 | `ns1.vercel-dns.com` |

배포 서비스에 커스텀 도메인을 붙일 때 "A 레코드 또는 CNAME을 이렇게 설정하라"는 안내가 바로 이 레코드들이다.

## TTL과 캐시

각 레코드에는 **TTL(Time To Live, 초 단위)** 이 있다. 리졸버와 브라우저는 TTL 동안 답을 캐시하고 다시 묻지 않는다.

- TTL이 길면 조회가 빠르지만, IP를 바꿨을 때 반영이 늦다("DNS 전파에 시간이 걸린다").
- 서버 이전 전에는 TTL을 미리 짧게 낮춰 두는 것이 관례다.

## 프론트엔드에서 쓰는 것

```html
<!-- 나중에 쓸 외부 도메인의 DNS 조회만 미리 -->
<link rel="dns-prefetch" href="https://cdn.example.com" />
<!-- DNS + TCP + TLS 연결까지 미리 -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

폰트·이미지 CDN, 분석 스크립트처럼 **다른 도메인의 리소스를 곧 부를 때** 첫 요청 지연을 줄인다. 너무 많이 걸면 오히려 낭비다.

## 정리

- DNS는 이름 → IP 변환이고, 모든 요청의 첫 단계다.
- 리졸버가 루트 → TLD → 권한 서버 순으로 찾아 준다.
- A·CNAME 레코드로 도메인을 서버·호스팅에 연결한다.
- TTL만큼 캐시되므로 변경이 즉시 반영되지 않는다.

관련 노트: [[transport-layer|전송 계층과 UDP]], [[cdn|CDN]], [[http-web-architecture|웹 앱의 요청·응답 구조]]
