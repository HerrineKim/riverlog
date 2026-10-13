---
title: "HTTPS 전환: 인증서 고르기부터 리다이렉트까지"
concept: "HTTPS Migration"
summary: "사이트를 HTTPS로 옮기는 실무 흐름. 인증서는 검증 수준(DV·OV·EV)과 도메인 범위(단일·다중·와일드카드)로 고르는데, 웹사이트에는 ACME로 자동 발급·갱신하는 DV가 표준이다. 설치 뒤 301 리다이렉트·혼합 콘텐츠 제거·HSTS·서버 설정 점검까지 해야 전환이 끝난다."
tags: ["web", "security", "http", "network", "devops"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2018/11/16/http%ec%97%90%ec%84%9c-https%eb%a1%9c-%ec%a0%84%ed%99%98%ed%95%98%ea%b8%b0-%ec%9c%84%ed%95%9c-%ec%99%84%eb%b2%bd-%ea%b0%80%ec%9d%b4%eb%93%9c/", "https://ssl-config.mozilla.org/", "https://letsencrypt.org/docs/"]
---

> Vladislav Denishev의 「HTTP에서 HTTPS로 전환하기 위한 완벽 가이드」(웹액츄얼리 번역, 2018.11)를 바탕으로 재구성한 노트입니다.

## HTTPS 전환이란

HTTPS는 HTTP를 TLS로 감싸 기밀성·무결성·인증을 보장한다. 원리(대칭키·공개키, 핸드셰이크, HSTS)는 [[https|HTTPS와 TLS]]에 있다. 이 노트는 **이미 HTTP로 운영하던 사이트를 HTTPS로 옮기는 절차**를 다룬다.

HTTPS는 선택 사항이 아니다. 브라우저는 HTTP 페이지를 "안전하지 않음"으로 표시하고, 서비스 워커·위치·카메라·클립보드 같은 API는 보안 컨텍스트에서만 동작하며, HTTP/2와 HTTP/3도 사실상 TLS 위에서만 쓴다.

## 인증서 고르기

### 검증 수준

| 종류 | 검증 내용 | 쓰임 |
| --- | --- | --- |
| DV (Domain Validated) | 신청자가 그 도메인을 통제하는지만 확인 | 웹사이트의 표준. ACME로 무료·자동 발급 |
| OV (Organization Validated) | 도메인 + 법인 실재 확인 | 기관 내부 정책상 요구될 때 |
| EV (Extended Validation) | OV보다 엄격한 법인 확인 | 과거에는 주소창에 회사 이름을 띄웠지만, 주요 브라우저가 이 표시를 없애 사용자가 보는 차이는 없다 |

브라우저 자물쇠는 셋 다 같다. **검증 수준은 암호화 강도와 무관하다.**

### 도메인 범위

| 종류 | 덮는 이름 | 비고 |
| --- | --- | --- |
| 단일 도메인 | `example.com`, `www.example.com` | 주체 대체 이름(SAN) 필드에 둘 다 넣는 것이 보통이다 |
| 다중 도메인 (SAN) | 목록에 적은 서로 다른 도메인·서브도메인 | 인증서를 보면 묶인 도메인이 다 드러난다. 관련 있는 도메인끼리만 묶는다 |
| 와일드카드 | `*.example.com`의 한 단계 서브도메인 | `a.b.example.com`은 덮지 않는다. ACME에서는 DNS 검증으로만 받는다 |

### 키 종류

ECDSA(ECC) 키는 RSA보다 작고 빠르다. P-256이면 충분하다. RSA는 호환성이 필요할 때 2048비트를 쓴다. 4096비트는 핸드셰이크 비용만 늘린다.

## 발급과 갱신

```text
개인 키 생성 ─▶ CSR(인증서 서명 요청: 공개 키 + 도메인 정보) ─▶ CA 검증 ─▶ 서명된 인증서 ─▶ 서버 설치
```

- 개인 키는 서버 밖으로 내보내지 않고, 권한을 최소(600)로 둔다. 유출이 의심되면 즉시 **폐기(revoke)** 하고 새로 받는다.
- 파일 형식은 텍스트(Base64)인 PEM과 바이너리인 DER이 있다. 확장자(`.crt`, `.cer`, `.key`)는 관례일 뿐이다.
- **수동 발급·갱신은 하지 않는다.** Let's Encrypt 같은 CA에 ACME 프로토콜로 자동 발급·갱신한다. certbot, Caddy, Traefik, 클라우드 로드 밸런서, Vercel·Netlify·Cloudflare 같은 호스팅이 이 일을 대신한다.
- 공개 인증서의 최대 유효 기간은 CA/Browser Forum 결정에 따라 2026년 3월부터 200일로 줄었고, 단계적으로 47일까지 줄어든다. Let's Encrypt 인증서는 90일이다. 사람이 달력을 보고 갱신하는 방식은 더 이상 성립하지 않는다.
- 한 IP에서 여러 HTTPS 사이트를 운영하는 것은 SNI(Server Name Indication)로 해결된다. 모든 현대 클라이언트가 지원한다.

## 전환 체크리스트

| 순서 | 할 일 | 이유 |
| --- | --- | --- |
| 1 | 인증서 설치 후 HTTPS로 모든 페이지가 열리는지 확인 | |
| 2 | 혼합 콘텐츠(mixed content) 제거 | HTTPS 페이지가 `http://` 이미지·스크립트를 부르면 브라우저가 차단하거나 경고한다. 자원 URL을 `https://`나 상대 경로로 바꾸고, 남은 것은 CSP `upgrade-insecure-requests`로 올린다 |
| 3 | HTTP → HTTPS **301** 리다이렉트 | 검색 엔진이 새 URL로 신호를 옮긴다. canonical·사이트맵·내부 링크도 https로 바꾼다([[seo-basics|SEO 기초]]) |
| 4 | HSTS 헤더 추가 | 첫 요청 이후 브라우저가 스스로 HTTPS로만 접속한다. 짧은 `max-age`로 시작해 늘리고, 안정되면 preload 목록 등록을 검토한다 |
| 5 | 쿠키에 `Secure` 속성 | 인증 쿠키가 평문으로 새지 않게 한다 |
| 6 | 서버 TLS 설정 점검 | TLS 1.2 이상만 허용하고 1.3을 우선한다. Mozilla SSL Configuration Generator로 설정을 만들고, Qualys SSL Labs 서버 테스트로 확인한다 |
| 7 | 외부 연동 갱신 | 분석 도구·검색 콘솔·결제·웹훅에 등록된 URL을 https로 바꾼다 |

## 정리

- HTTPS는 보안·SEO·최신 API 사용의 전제다.
- 웹사이트 인증서는 DV면 충분하다. EV의 시각적 이점은 사라졌다.
- 범위는 단일·다중(SAN)·와일드카드 중 고르고, 키는 ECDSA를 우선한다.
- 발급·갱신은 ACME로 자동화한다. 유효 기간은 계속 짧아진다.
- 설치로 끝나지 않는다. **혼합 콘텐츠, 301, HSTS, Secure 쿠키, TLS 설정**까지 챙겨야 전환이 끝난다.

관련 노트: [[https|HTTPS와 TLS]], [[local-https-mkcert|로컬 개발 환경에 HTTPS 적용하기]], [[seo-basics|SEO 기초]], [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]
