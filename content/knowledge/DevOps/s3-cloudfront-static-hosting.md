---
title: "S3·CloudFront로 정적 사이트 배포하기"
concept: "Static Hosting on AWS"
summary: "빌드한 SPA·정적 사이트를 AWS에 올리는 표준 구성. 비공개 S3 버킷을 원본으로 두고 CloudFront가 OAC로만 읽어 HTTPS·압축·엣지 캐시를 맡으며, ACM 인증서(us-east-1)와 Route 53 별칭 레코드로 커스텀 도메인을 붙인다. SPA 라우팅 처리, 캐시 헤더와 무효화, GitHub Actions에서 OIDC로 배포하는 워크플로까지 정리한다."
tags: ["aws", "cdn", "deployment", "ci-cd", "devops", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/AWS%20s3%2C%20CloudFront%2C%20Route53%20%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%20%EB%B0%B0%ED%8F%AC.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/CI%2CCD%20%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0%20with%20GitHub%20Action%2C%20aws%20s3%2C%20route53%2C%20ACM.md", "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html", "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html", "https://github.com/aws-actions/configure-aws-credentials", "https://github.com/grab/front-end-guide"]
---

> 「[Frontend_TIL: AWS s3, CloudFront, Route53 프론트엔드 배포](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/AWS%20s3%2C%20CloudFront%2C%20Route53%20%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%20%EB%B0%B0%ED%8F%AC.md)」와 「[CI/CD 구축하기 with GitHub Action, aws s3, route53, ACM](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/CI%2CCD%20%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0%20with%20GitHub%20Action%2C%20aws%20s3%2C%20route53%2C%20ACM.md)」를 바탕으로, AWS 공식 문서로 확인해 재구성한 노트다.
> Grab의 「[Front End Guide](https://github.com/grab/front-end-guide)」를 바탕으로 보강했다.

## 무엇을 배포하나

React·Vue SPA나 SSG 결과물은 `npm run build`가 만든 **정적 파일(HTML·CSS·JS·이미지)** 뿐이다. 실행할 서버 코드가 없으므로 파일 저장소에 올리고 CDN으로 나눠 주면 된다. 빌드가 하는 일(번들링, 압축, 파일 이름에 해시 붙이기)은 [[bundlers-and-vite|번들러와 Vite]]에 있다. SSR이 필요한 Next.js 앱은 이 구성으로 안 되고 서버나 서버리스 런타임이 필요하다.

## 구성 요소

```text
사용자 ──DNS──▶ Route 53 ──별칭──▶ CloudFront (엣지, HTTPS·캐시·압축)
                                      │  ACM 인증서 (us-east-1)
                                      ▼  OAC로 서명한 요청만
                                 S3 버킷 (비공개, 원본)
```

| 서비스 | 맡는 일 |
| --- | --- |
| **S3** | 객체 스토리지. 버킷에 빌드 결과를 둔다. 버킷 이름은 전 세계에서 유일하다 |
| **CloudFront** | AWS의 CDN. 사용자와 가까운 엣지에서 캐시한 파일을 주고, 없으면 원본(S3)에서 받아 채운다. HTTPS 종단, 압축, 오류 페이지 처리를 맡는다 |
| **ACM** | 공개 TLS 인증서를 무료로 발급·자동 갱신한다 |
| **Route 53** | DNS. 도메인을 CloudFront 배포로 연결한다 |

CDN이 캐시하는 원리는 [[cdn|CDN]]에, DNS 질의 흐름과 네임서버는 [[dns|DNS]]에 있다.

## S3만으로는 부족한 이유

S3에도 **정적 웹사이트 호스팅** 기능이 있지만 그것만 쓰지 않는다.

| S3 웹사이트 엔드포인트만 쓰면 | CloudFront를 앞에 두면 |
| --- | --- |
| **HTTP만** 된다 | HTTPS, HTTP → HTTPS 리다이렉트 |
| 버킷을 **공개**해야 한다 | 버킷은 비공개, CloudFront만 읽는다 |
| 한 리전에서만 응답한다 | 전 세계 엣지에서 캐시로 응답한다 |
| 압축·캐시 정책을 세밀하게 못 정한다 | 자동 압축(gzip·Brotli), 캐시 정책, 보안 헤더 |

데이터 전송 비용도 S3에서 직접 나가는 것보다 CloudFront를 거치는 편이 대개 싸다.

## 설정 순서

### 1. S3: 비공개 버킷

- 사용자 가까운 리전에 버킷을 만들고 **퍼블릭 액세스 차단을 켠 채** 둔다.
- 정적 웹사이트 호스팅은 **켜지 않는다.** 아래 OAC는 S3 **REST 엔드포인트**(`버킷.s3.리전.amazonaws.com`)에만 붙고, 웹사이트 엔드포인트(`s3-website-…`)는 일반 HTTP 원본 취급이라 버킷을 공개해야만 쓸 수 있다.
- `build/` 폴더 자체가 아니라 **그 안의 파일들**을 버킷 루트에 올린다.

### 2. CloudFront: OAC로 원본 잠그기

**OAC(Origin Access Control)** 는 CloudFront가 S3에 보내는 요청에 서명하고, 버킷 정책이 **그 배포의 요청만** 허용하게 하는 방식이다. 과거에는 OAI(Origin Access Identity)를 썼고, 지금은 OAC가 권장이다.

1. 배포를 만들 때 원본으로 S3 버킷을 고르고 원본 액세스를 **OAC**로 정한다.
2. 콘솔이 보여 주는 **버킷 정책을 복사해 S3 버킷 정책에 붙인다.** 이 단계를 빼면 403이 난다.
3. 그 밖의 설정:

| 항목 | 값 |
| --- | --- |
| 뷰어 프로토콜 정책 | Redirect HTTP to HTTPS |
| 객체 자동 압축 | 켠다 |
| 기본 루트 객체 | `index.html` (`/` 요청에 줄 파일) |
| 대체 도메인 이름(CNAME) | `example.com`, `www.example.com` |
| SSL 인증서 | ACM에서 발급한 인증서 |
| Origin Shield | 선택. 엣지와 원본 사이에 캐시 층을 하나 더 둬 원본 요청을 줄인다. 요청마다 비용이 붙는다 |

#### SPA 라우팅

`/about`을 새로고침하면 CloudFront는 S3에서 `about`이라는 객체를 찾는다. 없으니 비공개 버킷은 **403**(목록 권한이 없으면 404 대신 403)을 돌려준다. 클라이언트 라우터가 처리하게 하려면 **사용자 정의 오류 응답**으로 403·404를 `/index.html`, 응답 코드 200으로 바꾼다. 경로 규칙을 세밀하게 다루려면 CloudFront Functions로 확장자 없는 요청을 `/index.html`로 다시 쓴다.

### 3. ACM: 인증서는 us-east-1

**CloudFront에 붙일 인증서는 반드시 미국 동부(버지니아 북부, `us-east-1`)에서 발급한다.** 다른 리전에서 만든 인증서는 CloudFront 설정 화면에 나타나지 않는다. CloudFront가 전역 서비스라 인증서를 한 리전에서만 읽기 때문이다.

- 도메인(`example.com`)과 와일드카드나 `www`를 함께 요청한다.
- 소유권 검증은 **DNS 검증**을 고른다. Route 53을 쓰면 「Route 53에서 레코드 생성」 버튼이 검증용 CNAME을 넣어 주고, 이후 갱신도 자동이다.

인증서 종류와 HTTPS 전환 점검은 [[https-migration|HTTPS 전환]]에 있다.

### 4. Route 53: 별칭 레코드

- Route 53에서 도메인을 사면 **호스팅 영역**이 자동으로 생긴다(NS·SOA 레코드). 다른 등록 업체의 도메인이면 그 업체 설정에서 **네임서버를 Route 53 호스팅 영역의 NS 네 개로 바꾼다.**
- 도메인을 CloudFront로 보내는 레코드는 **A(와 IPv6면 AAAA) 별칭(Alias) 레코드**로 만들고 대상에 CloudFront 배포를 고른다.
- `www` 같은 서브도메인은 CNAME도 되지만, **루트 도메인(`example.com`)에는 CNAME을 둘 수 없다**(DNS 규칙상 다른 레코드와 공존 불가). 별칭 레코드는 이 제약이 없고 조회 요금도 없어서 둘 다 별칭으로 만드는 것이 보통이다.

완성된 호스팅 영역에는 NS·SOA, 루트와 `www`의 A 별칭, ACM 검증용 CNAME이 있다.

## 배포 자동화: GitHub Actions

`main`에 푸시하면 빌드 → S3 동기화 → CloudFront 무효화를 돈다. AWS 인증은 **OIDC**로 한다. 오래 사는 액세스 키를 GitHub Secrets에 넣는 대신, GitHub이 발급한 짧은 토큰으로 IAM 역할을 맡는다.

```yaml
name: Deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write      # OIDC 토큰 발급
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build

      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: ap-northeast-2

      # 해시가 붙은 정적 자산: 오래 캐시
      - run: aws s3 sync dist s3://${{ vars.S3_BUCKET }} --delete --exclude index.html --cache-control "public,max-age=31536000,immutable"
      # index.html: 항상 다시 확인
      - run: aws s3 cp dist/index.html s3://${{ vars.S3_BUCKET }}/index.html --cache-control "no-cache"
      - run: aws cloudfront create-invalidation --distribution-id ${{ vars.CF_DISTRIBUTION_ID }} --paths "/index.html"
```

| 단계 | 요점 |
| --- | --- |
| `npm ci` | lockfile 그대로 설치한다. CI에서는 `npm install` 대신 쓴다 |
| `aws s3 sync … --delete` | 로컬 폴더와 버킷을 맞춘다. `--delete`는 **로컬에 없는 객체를 버킷에서 지운다**(로컬 파일을 지우지 않는다) |
| 캐시 헤더 | 파일 이름에 해시가 붙은 자산은 내용이 바뀌면 이름이 바뀌므로 1년 캐시해도 된다. 그 이름을 가리키는 `index.html`만 짧게(`no-cache`) 둔다 |
| 무효화 | 엣지에 남은 옛 파일을 지운다. 위처럼 캐시를 나눴으면 `index.html`만 무효화하면 된다. `"/*"` 하나는 경로 하나로 계산되지만 모든 엣지 캐시를 비워 원본 요청이 몰린다 |
| IAM 역할 | 그 버킷의 `s3:PutObject`·`DeleteObject`·`ListBucket`, 그 배포의 `cloudfront:CreateInvalidation`만 허용한다. 신뢰 정책은 이 저장소·브랜치(`repo:org/repo:ref:refs/heads/main`)에서 온 토큰만 받는다 |

과거 예제는 IAM 사용자의 `AWS_ACCESS_KEY_ID`·`AWS_SECRET_ACCESS_KEY`를 Secrets에 넣었다. 키가 새면 회수할 때까지 계속 쓸 수 있으니 OIDC로 바꾼다. 버킷 이름 같은 비밀이 아닌 값은 `secrets` 대신 `vars`에 둔다. 워크플로 문법(`on`·`jobs`·`needs`)과 파이프라인 개념은 [[ci-cd|CI/CD]]에 있다.

### 빌드와 배포를 나누기: 버전별 산출물

위 워크플로는 푸시마다 빌드하고 바로 올린다. 환경이 여럿이거나 롤백이 잦으면 **빌드 한 번, 배포 여러 번**으로 나눈다. 정적 번들은 그 자체로 불변 산출물이라 이 방식이 특히 쉽다.

```text
CI (커밋·태그마다)
  린트 → 테스트(커버리지 업로드) → 빌드
  → dist를 <커밋 해시>.tar.gz, 릴리스 태그면 v1.0.1.tar.gz로 묶어 산출물 버킷에 올림
  → 결과를 채팅으로 알림

배포 (사람이 버전과 환경을 골라 실행, workflow_dispatch)
  1. 산출물 버킷에서 v1.0.1.tar.gz를 내려받아 푼다
  2. 그 환경의 설정 파일(config.json)을 끼워 넣는다
  3. 호스팅 버킷에 sync하고 index.html을 무효화한다
  4. 배포 결과를 알린다
```

- **롤백은 이전 태그를 다시 배포하는 것**이다. 다시 빌드하지 않으니 수십 초면 끝나고, 무엇이 나갔는지 태그로 정확히 안다.
- 환경 설정은 빌드에 굽지 않는다. Vite의 `import.meta.env`처럼 빌드 때 문자열로 박히는 값은 환경마다 다시 빌드하게 만든다. 환경마다 다른 값(API 주소, 기능 플래그)은 앱이 시작할 때 `fetch('/config.json')`으로 읽게 하고, 배포 단계에서 그 파일만 바꿔 넣는다.
- 산출물 버킷에는 수명 주기 규칙을 걸어 오래된 커밋 빌드를 지우고, 릴리스 태그 빌드는 남긴다.

과거에는 Travis CI가 빌드해 S3에 tar를 쌓고 Ansible Tower 같은 별도 배포 도구가 환경을 골라 올렸다. 지금은 GitHub Actions의 `workflow_dispatch`·environment 보호 규칙(승인자 지정)으로 같은 흐름을 한 곳에서 만든다.

## 정리

- 정적 결과물은 **비공개 S3 + CloudFront(OAC)** 로 배포한다. S3 웹사이트 호스팅은 켜지 않는다.
- CloudFront가 HTTPS 리다이렉트·압축·캐시를 맡고, SPA는 403·404를 `/index.html`로 돌린다.
- 인증서는 **us-east-1**의 ACM에서 DNS 검증으로, 도메인은 Route 53 **별칭 레코드**로 붙인다.
- 해시 자산은 길게, `index.html`은 짧게 캐시하고 `index.html`만 무효화한다.
- CI에서 AWS 인증은 액세스 키가 아니라 OIDC 역할로 한다.

관련 노트: [[ci-cd|CI/CD]], [[cdn|CDN]], [[dns|DNS]], [[aws-cloud-basics|AWS 클라우드 기초]], [[https-migration|HTTPS 전환]], [[http-cache|HTTP 캐시]], [[deployment-strategies|배포 전략]]
