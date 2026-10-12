---
title: "네트워크"
concept: "Network"
summary: "네트워크 기초와 OSI 계층 모델부터 IP·TCP·UDP·HTTP·HTTPS, DNS·CDN·HTTP 캐시, WebSocket과 브라우저 간 실시간 통신 WebRTC까지 네트워크 노트 모음."
tags: ["network", "tcp", "udp", "ip", "http"]
source: mixed
---

네트워크는 서로 다른 컴퓨터의 프로세스가 데이터를 주고받는 방법이다. 데이터 전송 과정을 계층별로 이해해 두면 애플리케이션에서 OS, 하드웨어까지 걸친 통신 문제를 어디서부터 살펴야 할지 판단할 수 있다.

- **network-basics** — 네트워크의 분류와 통신 방식, 프로토콜과 캡슐화, 이더넷과 MAC 주소
- **osi-7-layer** — OSI 7계층과 각 계층의 역할·전송 단위
- **network-layer** — IP 주소 체계, ARP, ICMP, IPv6, NAT·포트 포워딩, 라우팅 프로토콜, 데이터 교환 방식
- **transport-layer** — 전송 계층의 역할, 포트 번호, UDP, TCP와 UDP 비교
- **tcp** — TCP 헤더와 플래그, 3-way handshake, 순서 번호와 상태 전이
- **http** — HTTP 요청·응답 형식, 메서드, 상태 코드, URI·URL·URN, HTTP/1.1·2·3 비교
- **https** — HTTP를 TLS로 암호화하는 HTTPS, 대칭키·공개키와 TLS 핸드셰이크, Mixed Content, HSTS와 preload, 종단 간 암호화
- **http-cache** — Cache-Control과 ETag로 응답을 재사용하는 HTTP 캐시, 자산별 캐시 전략
- **dns** — 도메인을 IP로 바꾸는 조회 흐름, 레코드 종류, TTL, dns-prefetch·preconnect
- **cdn** — 엣지 서버에 콘텐츠를 캐시해 가까운 곳에서 응답하는 CDN과 캐시 무효화
- **websocket** — HTTP Upgrade로 시작하는 양방향 실시간 통신, 폴링·SSE·WebRTC와 비교
- **webrtc** — 브라우저끼리 P2P로 오디오·비디오·데이터를 주고받는 WebRTC의 구조
