---
title: "브라우저에 URL을 입력하면 일어나는 일"
concept: "URL to Page"
summary: "주소창에 URL을 입력한 뒤 화면이 그려지기까지의 흐름. DNS 조회, TCP 연결, TLS 핸드셰이크, HTTP 요청·응답, 렌더링을 순서대로 잇고 각 단계의 상세 노트로 연결한다."
tags: ["network", "http", "web", "browser", "dns"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/320", "https://riverkim.kr/125", "https://riverkim.kr/135"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

## 한눈에 보기

면접 단골 질문이기도 한 이 흐름은 네트워크 노트 여러 편을 한 줄로 꿰는 지도 역할을 한다. 예로 `https://example.com/books/1`을 입력했다고 하자.

```text
1. URL 해석        https  ://  example.com  /books/1
                    프로토콜     도메인        경로
2. DNS 조회        example.com → 93.184.x.x   (브라우저·OS 캐시 → DNS 서버)
3. TCP 연결        3-way handshake로 서버 443 포트와 연결
4. TLS 핸드셰이크   암호화에 쓸 키를 교환 (HTTPS일 때)
5. HTTP 요청       GET /books/1  + 헤더 (+ 바디)
6. 서버 처리       웹 서버 → WAS → DB …
7. HTTP 응답       200 OK + 헤더 + HTML
8. 렌더링          HTML 파싱 → CSS 적용 → JS 실행 → 화면 그리기
```

HTTP/3를 쓰는 서버라면 3·4단계가 UDP 위의 **QUIC 핸드셰이크 하나**로 합쳐진다. TLS 1.3이 QUIC에 내장되어 있어 첫 연결은 1-RTT, 재방문은 0-RTT로 요청을 보낼 수 있다.

## 단계별 정리

| 단계 | 하는 일 | 자세히 |
| --- | --- | --- |
| URL 해석 | 도메인 뒤 슬래시(`/`) 이후의 **경로**는 서버 안의 특정 리소스(페이지, API 엔드포인트)를 가리킨다 | [[http\|HTTP 프로토콜]]의 URI·URL·URN |
| DNS 조회 | 도메인에 대응하는 서버 **IP 주소**를 알아낸다. 브라우저와 OS가 여러 층의 캐시를 먼저 보고, 없을 때만 DNS 서버에 묻는다 | [[dns\|DNS]] |
| TCP 연결 | TCP/IP로 서버와 연결한다. IP는 패킷을 목적지 주소까지 전달하고, TCP는 순서와 무결성을 책임진다 | [[tcp\|TCP]], [[network-layer\|네트워크 계층 프로토콜]] |
| TLS 핸드셰이크 | HTTPS라면 브라우저와 서버가 암호화 키를 교환하고, 이후 데이터를 암호화해 주고받는다 | [[https\|HTTPS와 TLS]] |
| HTTP 요청 | 요청 라인(메서드·경로·버전), 헤더(클라이언트 정보·인증·콘텐츠 타입), 필요하면 바디를 보낸다 | [[http\|HTTP 프로토콜]] |
| 서버 처리 | 웹 서버가 받아 정적 파일을 내주거나 WAS로 넘겨 로직을 처리한다 | [[web-server-and-nginx\|웹 서버, WAS, 그리고 Nginx]] |
| HTTP 응답 | 상태 라인(200, 404 등), 응답 헤더(캐시 정책·콘텐츠 타입·인코딩), 바디(HTML·JSON·이미지)를 돌려준다 | [[http-cache\|HTTP 캐시]] |
| 렌더링 | 브라우저가 응답을 해석해 HTML 파싱, CSS 적용, JS 실행을 거쳐 화면을 그린다 | [[browser-rendering\|브라우저 렌더링 과정]] |

## 정리

- URL 입력 → **DNS로 IP 찾기 → TCP 연결 → (TLS) → HTTP 요청·응답 → 렌더링** 순서다.
- 각 단계에 캐시가 끼어 있어(DNS 캐시, HTTP 캐시, CDN) 두 번째 방문은 훨씬 빠르다.
- 답할 때는 단계 이름만 나열하기보다 "누가 무엇을 알아내고 무엇을 넘기는지"를 말하면 깊이가 드러난다.

관련 노트: [[osi-7-layer|OSI 7계층]], [[cdn|CDN]], [[browser-rendering|브라우저 렌더링 과정]]

참고 자료

- [What happens when you type a URL into your browser? (AWS 블로그)](https://aws.amazon.com/ko/blogs/korea/what-happens-when-you-type-a-url-into-your-browser/)
- [웹 브라우저에 URL을 입력하면 어떤 일이 일어날까 (F-Lab)](https://f-lab.kr/insight/web-browser-url-process)
- [브라우저는 어떻게 동작하는가? (NAVER D2)](https://d2.naver.com/helloworld/59361)
- [프론트엔드 개발자라면 알고 있어야 할 브라우저의 동작 과정 (재그지그)](https://wormwlrm.github.io/2021/03/27/How-browsers-work.html)
