---
title: "네트워크"
concept: "Network"
summary: "네트워크 기초와 OSI 계층 모델부터 IP·서브넷·NAT, TCP·UDP, HTTP·HTTPS, DNS·CDN·HTTP 캐시와 프록시, 리눅스 네트워크 네임스페이스, RFC 읽는 법, WebSocket과 WebRTC까지 네트워크 노트 모음."
tags: ["network", "tcp", "udp", "ip", "http"]
source: mixed
date: "2026-10-14"
---

네트워크는 서로 다른 컴퓨터의 프로세스가 데이터를 주고받는 방법이다. 데이터 전송 과정을 계층별로 이해해 두면 애플리케이션에서 OS, 하드웨어까지 걸친 통신 문제를 어디서부터 살펴야 할지 판단할 수 있다.

- [네트워크 기초](Computer-Science/Network/network-basics.md) — 네트워크의 분류와 통신 방식, 프로토콜과 캡슐화, 이더넷과 MAC 주소
- [OSI 7계층](Computer-Science/Network/osi-7-layer.md) — OSI 7계층과 각 계층의 역할, TCP/IP 4계층과의 대응, 캡슐화와 계층별 PDU
- [네트워크 계층 프로토콜](Computer-Science/Network/network-layer.md) — IPv4 헤더와 단편화, IP 주소 체계, ARP 동작 과정, ICMP와 ping·traceroute, IPv6, NAT·포트 포워딩, 라우팅 프로토콜, 데이터 교환 방식
- [리눅스 네트워크 네임스페이스와 ip 명령](Computer-Science/Network/linux-network-namespace.md) — ip 명령 출력 읽기, 라우팅 테이블, 네임스페이스와 veth로 본 컨테이너 네트워크
- [전송 계층: 포트, TCP, UDP](Computer-Science/Network/transport-layer.md) — 전송 계층의 역할과 포트 번호, TCP 헤더·플래그·3-way handshake·순서 번호·상태 전이·4-way handshake와 TIME_WAIT, UDP, TCP와 UDP 비교
- [HTTP 프로토콜](Computer-Science/Network/http.md) — HTTP 요청·응답 형식, 메서드, 상태 코드, URI·URL·URN, HTTP/1.1·2·3 비교
- [HTTPS와 TLS](Computer-Science/Network/https.md) — HTTP를 TLS로 암호화하는 HTTPS, 대칭키·공개키와 TLS 핸드셰이크, Mixed Content, HSTS와 preload, 종단 간 암호화
- [웹 PKI의 변천: 인증서 생태계는 왜 바뀌었나](Computer-Science/Network/web-pki-evolution.md) — CA 침해·감청·SHA-1·Heartbleed가 바꾼 인증서 체계, 전방 비밀성, CT 로그, 폐기의 한계, ACME, 47일 유효 기간과 수명 주기 자동화
- [SSH의 동작: 전송·인증·연결 계층](Computer-Science/Network/ssh.md) — 키 교환과 호스트 키 확인, 공개키 인증, 셸·포트 포워딩·파일 전송 채널
- [네트워크 보안: 방화벽, VPN, 계층별 공격](Computer-Science/Network/network-security.md) — 패킷 필터에서 차세대 방화벽까지, VPN 터널, OSI 계층별 공격과 다층 방어
- [RFC와 요구 수준 키워드](Computer-Science/Network/rfc-requirement-levels.md) — 인터넷 표준 문서 RFC를 읽는 법과 MUST·SHOULD·MAY의 정확한 뜻
- [HTTP 캐시](Computer-Science/Network/http-cache.md) — Cache-Control과 ETag로 응답을 재사용하는 HTTP 캐시, 자산별 캐시 전략
- [DNS](Computer-Science/Network/dns.md) — 도메인을 IP로 바꾸는 조회 흐름, 레코드 종류, TTL, dns-prefetch·preconnect
- [이메일 전달 과정: SMTP, IMAP, 발신자 인증](Computer-Science/Network/email-delivery.md) — MUA·MTA·MDA와 MX 레코드, SMTP 릴레이, IMAP·POP3, SPF·DKIM·DMARC
- [CDN](Computer-Science/Network/cdn.md) — 엣지 서버에 콘텐츠를 캐시해 가까운 곳에서 응답하는 CDN과 캐시 무효화
- [프록시: 포워드 프록시와 리버스 프록시](Computer-Science/Network/proxy.md) — 누구를 대리하느냐로 나뉘는 두 프록시, TLS 종료·로드 밸런싱, X-Forwarded-For
- [WebSocket](Computer-Science/Network/websocket.md) — HTTP Upgrade로 시작하는 양방향 실시간 통신, 폴링·SSE·WebRTC와 비교
- [WebRTC](Computer-Science/Network/webrtc.md) — 브라우저끼리 P2P로 오디오·비디오·데이터를 주고받는 WebRTC의 구조
- [VoIP 전화망: SIP, SDP, RTP](Computer-Science/Network/voip-sip-rtp.md) — PSTN·PBX·게이트웨이, 음성 디지털화와 G.711, SIP·SDP 통화 협상, RTP와 지터 버퍼
- [브라우저에 URL을 입력하면 일어나는 일](Computer-Science/Network/url-to-page.md) — 주소창에 URL을 입력한 뒤 DNS·TCP·TLS·HTTP·렌더링을 거쳐 화면이 뜨기까지의 흐름
