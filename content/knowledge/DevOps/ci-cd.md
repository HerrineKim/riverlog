---
title: "CI/CD"
concept: "CI/CD"
summary: "코드 변경을 자동으로 빌드·테스트하고(CI) 배포까지 이어 주는(CD) 파이프라인의 개념과 GitLab CI/CD·Docker 활용."
tags: ["ci-cd", "devops", "docker", "gitlab", "git"]
source: notion
---

배포 과정은 사람이 손으로 할수록 **휴먼 에러**가 잦다. 빌드 명령을 빠뜨리거나, 테스트를 건너뛰거나, 엉뚱한 서버에 올리는 식이다. CI/CD는 이 과정을 파이프라인으로 자동화해 매번 같은 절차가 실행되게 만든다.

## CI와 CD

| | 의미 | 하는 일 |
| --- | --- | --- |
| **CI** (Continuous Integration, 지속적 통합) | 여러 개발자의 변경을 자주 main에 합치고 그때마다 자동 검증 | 푸시·MR마다 빌드, 린트, 테스트 실행 |
| **CD** (Continuous Delivery/Deployment, 지속적 제공/배포) | 검증된 결과물을 언제든 배포 가능한 상태로 만들고(Delivery), 나아가 자동 배포까지(Deployment) | 이미지 빌드·레지스트리 푸시, 스테이징/운영 배포 |

## Docker와 함께 쓰는 흐름

```text
git push
  → CI: 의존성 설치 → 린트/테스트 → docker build
  → 이미지에 태그를 붙여 레지스트리(GitLab Container Registry 등)에 push
  → CD: 서버(또는 오케스트레이터)가 새 이미지를 pull 해서 컨테이너 교체
```

[컨테이너](DevOps/vm-vs-container) 이미지는 "빌드된 결과물 + 실행 환경"을 하나로 묶으므로, CI에서 테스트한 것과 똑같은 것이 운영에서 실행된다는 보장을 준다.

## GitLab CI/CD 예시

GitLab은 저장소 루트의 `.gitlab-ci.yml`을 읽어 파이프라인을 실행한다. 작업(job)은 단계(stage) 순서대로 실행된다.

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test

build:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
    - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA" .
    - docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"

deploy:
  stage: deploy
  script:
    - echo "서버에서 새 이미지로 컨테이너 교체"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

비밀번호·토큰은 파일에 쓰지 않고 GitLab의 CI/CD Variables에 저장해 `$변수`로 참조한다.

## 대표 CI/CD 도구

| 도구 | 특징 |
| --- | --- |
| Jenkins | 오래된 오픈소스. 플러그인이 풍부하고 자체 서버에 설치해 운영 |
| Bamboo | Atlassian 제품. Jira·Bitbucket과 연동 |
| GitLab CI/CD | GitLab에 내장. `.gitlab-ci.yml` |
| GitHub Actions | GitHub에 내장. `.github/workflows/*.yml` |

## 핵심 정리

- CI = 합칠 때마다 자동 빌드·테스트, CD = 검증된 결과물을 자동으로 배포 가능/배포.
- Docker 이미지를 파이프라인의 산출물로 삼으면 테스트한 환경 그대로 배포된다.
- 비밀 값은 CI 변수로 관리한다.
