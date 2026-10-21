---
title: "DNS"
concept: "DNS"
summary: "도메인 이름을 IP 주소로 바꿔 주는 DNS. 재귀·반복 질의 흐름, 주요 레코드 종류, TTL과 캐시, 프론트엔드에서 쓰는 dns-prefetch·preconnect를 정리한다."
tags: ["network", "dns", "web", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://bytebytego.com/guides/how-does-the-domain-name-system-dns-lookup-work", "https://bytebytego.com/guides/dns-record-types-you-should-know", "https://bytebytego.com/guides/internet-traffic-routing-policies", "http://hacks.mozilla.or.kr/2019/10/a-cartoon-intro-to-dns-over-https/"]
---

> 여러 자료를 종합한 노트에, ByteByteGo의 System Design 101 가이드 「[How Does the DNS Lookup Work?](https://bytebytego.com/guides/how-does-the-domain-name-system-dns-lookup-work)」, 「[DNS Record Types You Should Know](https://bytebytego.com/guides/dns-record-types-you-should-know)」의 서버 계층과 레코드 종류를 보강했다. DNS 라우팅 정책은 「[Internet Traffic Routing Policies](https://bytebytego.com/guides/internet-traffic-routing-policies)」로 보강했다.
> DNS 프라이버시와 DoH 부분은 Mozilla 웹 기술 블로그의 「[만화로 보는 DNS over HTTPS](http://hacks.mozilla.or.kr/2019/10/a-cartoon-intro-to-dns-over-https/)」를 바탕으로 보강했다.

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
- 캐시가 모두 빗나가면 조회 한 번에 보통 수십~100여 ms가 든다. 그래서 각 층의 캐시와 TTL이 중요하다.

### 네임서버의 세 계층

DNS는 한 서버가 모든 이름을 알지 않고 **트리 모양으로 책임을 나눠** 확장성을 얻는다.

| 계층 | 아는 것 | 비고 |
| --- | --- | --- |
| 루트 네임서버 (`.`) | TLD 네임서버들의 주소 | 논리적으로 13개 이름(a~m.root-servers.net)이지만, 애니캐스트로 전 세계 수많은 인스턴스가 같은 주소로 응답한다 |
| TLD 네임서버 | 각 도메인의 권한 네임서버 주소 | 일반 TLD(`.com`, `.org`), 국가 코드 TLD(`.kr`, `.us`), 테스트·예약용(`.test`) 등 |
| 권한(authoritative) 네임서버 | 실제 레코드(최종 답) | 도메인 등록 기관이나 DNS 호스팅(Route 53, Cloudflare 등)에 등록해 둔다 |

## 주요 레코드

| 레코드 | 의미 | 예 |
| --- | --- | --- |
| A | 도메인 → IPv4 | `example.com → 93.184.215.14` |
| AAAA | 도메인 → IPv6 | `example.com → 2606:2800::...` |
| CNAME | 다른 도메인의 별칭 | `www.example.com → example.com` |
| MX | 메일 서버 | `example.com → mail.example.com` |
| TXT | 임의 텍스트. 도메인 소유 인증, SPF 등 | `"v=spf1 ..."` |
| NS | 이 도메인을 맡은 네임서버 | `ns1.vercel-dns.com` |
| PTR | IP → 도메인 (역방향 조회) | `14.215.184.93.in-addr.arpa → example.com`. 메일 서버의 신원 확인에 쓴다 |
| SRV | 특정 서비스의 호스트와 **포트** | `_sip._tcp.example.com → 10 60 5060 sip.example.com`. VoIP, XMPP 등 |

- CNAME은 서브도메인을 다른 이름에 붙일 때 쓰고, 도메인 루트(apex)에는 쓸 수 없다. 그래서 DNS 업체들이 ALIAS·CNAME flattening 같은 대안을 제공한다.
- TXT는 SPF·DKIM·DMARC 같은 메일 보안 설정과, 서비스가 「이 도메인의 주인이 맞는가」를 확인하는 인증 문자열에 쓴다.

배포 서비스에 커스텀 도메인을 붙일 때 "A 레코드 또는 CNAME을 이렇게 설정하라"는 안내가 바로 이 레코드들이다.

## TTL과 캐시

각 레코드에는 **TTL(Time To Live, 초 단위)** 이 있다. 리졸버와 브라우저는 TTL 동안 답을 캐시하고 다시 묻지 않는다.

- TTL이 길면 조회가 빠르지만, IP를 바꿨을 때 반영이 늦다("DNS 전파에 시간이 걸린다").
- 서버 이전 전에는 TTL을 미리 짧게 낮춰 두는 것이 관례다.

## DNS 라우팅 정책

권한 네임서버는 같은 이름에 대해 **누가, 어디서, 언제 묻느냐에 따라 다른 답**을 줄 수 있다. 이를 이용해 DNS 단계에서 트래픽 방향을 정하는 것이 라우팅 정책이다. 관리형 DNS(AWS Route 53 등)가 대부분 제공한다.

| 정책 | 답을 고르는 기준 | 쓰임 |
| --- | --- | --- |
| 단순(simple) | 조건 없이 정해진 레코드 하나 | 서버가 한 곳뿐일 때 |
| 장애 조치(failover) | 헬스 체크로 주 서버가 정상이면 주 서버, 아니면 보조 서버 | 재해 복구용 대기 사이트 |
| 지리(geolocation) | 질의한 사용자의 위치(국가·대륙) | 지역별 콘텐츠·언어, 데이터 주권 규정 준수 |
| 지연 시간(latency) | 사용자에게 지연이 가장 작은 리전 | 여러 리전에 배포한 서비스의 응답 속도 |
| 가중치(weighted) | 정해 둔 비율대로 나눔 | 새 버전에 10%만 보내기, 리전 간 비율 조정 |
| 다중 값 응답(multivalue) | 정상인 IP 여러 개를 함께 돌려주고 클라이언트가 고른다 | 간단한 분산. 로드 밸런서를 대신하지는 못한다 |

DNS 라우팅은 **TTL만큼 캐시된다는 한계**가 있다. 장애 조치가 반영되는 속도는 TTL과 리졸버의 캐시에 달려 있어, 초 단위 전환은 로드 밸런서나 애니캐스트가 맡는다. 여러 지역에 걸친 분산(GSLB)은 [[load-balancer|로드 밸런서]]에 정리했다.

## 프론트엔드에서 쓰는 것

```html
<!-- 나중에 쓸 외부 도메인의 DNS 조회만 미리 -->
<link rel="dns-prefetch" href="https://cdn.example.com" />
<!-- DNS + TCP + TLS 연결까지 미리 -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

폰트·이미지 CDN, 분석 스크립트처럼 **다른 도메인의 리소스를 곧 부를 때** 첫 요청 지연을 줄인다. 너무 많이 걸면 오히려 낭비다.

## DNS의 보안과 프라이버시

전통적인 DNS는 **평문 UDP**로 오가고 응답을 검증하지 않는다. 그래서 세 군데에서 새어 나가거나 조작될 수 있다.

| 위협 | 누가 | 결과 |
| --- | --- | --- |
| 추적(tracking) | 리졸버, 경로의 라우터, 질의를 받는 DNS 서버 | 어떤 IP가 어떤 사이트를 찾는지 모아 방문 기록 프로필을 만든다. 리졸버는 접속한 네트워크(카페·호텔 Wi-Fi)가 정해 주는 대로 바뀌므로 그 운영 정책을 알기 어렵다 |
| 스푸핑(spoofing) | 경로의 공격자, 악의적 리졸버 | 가짜 IP를 돌려줘 사기 사이트로 보내거나 특정 사이트를 막는다 |
| 차단·검열 | ISP의 리졸버 | 경고 페이지 IP를 대신 돌려준다 |

| 대책 | 막는 것 | 방식 |
| --- | --- | --- |
| DoT (DNS over TLS) | 경로 도청·변조 | DNS를 TLS로 감싼다. 전용 853 포트라 네트워크가 쉽게 구분·차단할 수 있다 |
| **DoH (DNS over HTTPS)** | 경로 도청·변조 | DNS 질의를 HTTPS(443) 요청으로 보낸다. 일반 웹 트래픽과 섞여 구분하기 어렵다 |
| 신뢰할 수 있는 재귀 리졸버(TRR) | 믿을 수 없는 리졸버 | 브라우저가 네트워크가 준 리졸버 대신, 로그 보관·제3자 제공을 제한하는 정책에 동의한 리졸버를 쓴다 |
| QNAME 최소화 | DNS 서버의 수집 | 리졸버가 루트·TLD 서버에는 필요한 부분(`org`)만 묻고 전체 이름(`en.wikipedia.org`)을 보내지 않는다 |
| ECS 축소 | DNS 서버의 수집 | 리졸버가 CDN 위치 선택용으로 붙이던 클라이언트 IP 앞부분(EDNS Client Subnet)을 보내지 않거나 줄인다 |
| DNSSEC | 응답 위조 | 레코드에 서명을 붙여 **응답이 진짜인지 검증**한다. 암호화는 하지 않으므로 프라이버시는 지켜 주지 않는다 |

- 주요 브라우저와 OS는 보안 DNS(DoH·DoT)를 지원한다. 설정한 리졸버가 지원하면 자동으로 올려 쓰거나, 브라우저가 고른 리졸버를 쓰는 방식이 있다.
- DNS를 암호화해도 TLS 핸드셰이크의 **SNI**에 접속할 도메인이 평문으로 남는다. 이를 숨기는 것이 ECH(Encrypted Client Hello)다([[https|HTTPS와 TLS]]).
- 회사망처럼 DNS로 접근을 통제하는 환경에서는 DoH가 정책을 우회하는 통로가 되므로, 관리 정책으로 끄거나 사내 DoH 리졸버를 지정한다.

## 정리

- DNS는 이름 → IP 변환이고, 모든 요청의 첫 단계다.
- 리졸버가 루트 → TLD → 권한 서버 순으로 찾아 준다.
- A·CNAME 레코드로 도메인을 서버·호스팅에 연결한다.
- TTL만큼 캐시되므로 변경이 즉시 반영되지 않는다.

관련 노트: [[transport-layer|전송 계층과 UDP]], [[cdn|CDN]], [[http-web-architecture|웹 앱의 요청·응답 구조]], [[url-to-page|URL을 입력하면 일어나는 일]], [[load-balancer|로드 밸런서]]
