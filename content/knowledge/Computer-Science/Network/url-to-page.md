---
title: "브라우저에 URL을 입력하면 일어나는 일"
concept: "URL to Page"
summary: "주소창에 URL을 입력한 뒤 화면이 그려지기까지의 흐름. HSTS·서비스 워커·HTTP 캐시 확인, DNS 조회, TCP 연결, TLS 핸드셰이크, HTTP 요청·응답, 렌더링을 순서대로 잇고 각 단계의 상세 노트로 연결한다."
tags: ["network", "http", "web", "browser", "dns"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/320", "https://riverkim.kr/125", "https://riverkim.kr/135"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트다.

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

## 네트워크에 나가기 전에 브라우저가 확인하는 것

주소창 입력이나 링크 클릭이 만든 **내비게이션**은 위 흐름 그대로 네트워크로 나가지 않는다. 브라우저는 요청 전후로 다음을 차례로 확인한다.

| 순서 | 확인 | 내용 |
| --- | --- | --- |
| 1 | HSTS | `http://`인데 도메인이 HSTS 목록(브라우저 내장 preload 목록 + 이전에 받은 헤더)에 있으면 `https://`로 바꿔 요청한다 |
| 2 | 서비스 워커 | 이 URL 범위에 등록된 서비스 워커가 있으면 요청을 넘긴다. 워커는 캐시로 바로 응답할 수 있다. 내비게이션 프리로드를 켜 두면 워커가 깨어나는 동안 네트워크 요청도 함께 보낸다 |
| 3 | HTTP 캐시 | `Cache-Control`의 유효 기간 안이면 캐시로 끝낸다. 만료됐으면 `If-None-Match`·`If-Modified-Since`로 재검증해 304(그대로 써라) 또는 200(새 본문)을 받는다 |
| 4 | 연결 재사용 | 같은 호스트·포트로 열린 연결이 있으면 다시 쓴다. 없으면 DNS 조회 → TCP 연결 → TLS 핸드셰이크. `rel="preconnect"`로 미리 열어 둘 수 있다 |
| 5 | 응답 처리 | 응답이 리다이렉트(`Location`)면 1번부터 다시 한다. 압축을 풀고 캐시에 기록한 뒤, MIME 타입이 HTML이면 파싱을 시작한다 |
| 6 | 방문 기록 | 이 시점에 URL이 기록에 들어가 뒤로·앞으로 가기가 가능해진다 |

캐시와 저장소는 **출처(origin = 스킴 + 호스트 + 포트)** 단위로 격리된다. 하나라도 다르면 다른 출처이고, 다른 출처의 자원을 읽으려면 그쪽이 CORS 헤더로 허락해야 한다. 서비스 워커 캐시 전략은 [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]]에 있다.

## 정리

- URL 입력 → **DNS로 IP 찾기 → TCP 연결 → (TLS) → HTTP 요청·응답 → 렌더링** 순서다.
- 각 단계에 캐시가 끼어 있어(DNS 캐시, HTTP 캐시, CDN) 두 번째 방문은 훨씬 빠르다.
- 답할 때는 단계 이름만 나열하기보다 "누가 무엇을 알아내고 무엇을 넘기는지"를 말하면 깊이가 드러난다.

관련 노트: [[osi-7-layer|OSI 7계층]], [[cdn|CDN]], [[browser-rendering|브라우저 렌더링 과정]]

참고 자료

- [What happens when you type a URL into your browser? (AWS 블로그)](https://aws.amazon.com/ko/blogs/korea/what-happens-when-you-type-a-url-into-your-browser/)
- [웹 브라우저에 URL을 입력하면 어떤 일이 일어날까 (F-Lab)](https://f-lab.kr/insight/web-browser-url-process)
- [서버에서 클라이언트로 (웹액츄얼리)](https://webactually.com/2020/06/22/%EC%84%9C%EB%B2%84%EC%97%90%EC%84%9C-%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8%EB%A1%9C/)
- [브라우저는 어떻게 동작하는가? (NAVER D2)](https://d2.naver.com/helloworld/59361)
- [프론트엔드 개발자라면 알고 있어야 할 브라우저의 동작 과정 (재그지그)](https://wormwlrm.github.io/2021/03/27/How-browsers-work.html)
