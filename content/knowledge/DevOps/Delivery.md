---
title: "배포 자동화"
concept: "Delivery"
summary: "CI/CD, 롤링·카나리 같은 배포 전략, 12요소 앱, 상태를 복원하는 내구성 워크플로."
tags: ["devops","ci-cd","deployment"]
source: mixed
date: "2026-11-26"
---

배포 자동화 노트는 코드를 사용자에게 반복해서 올리는 경로를 다룬다. CI/CD, 롤링·블루-그린·카나리 같은 배포 전략, 12요소 앱, 중간에 죽어도 이어서 도는 내구성 워크플로가 여기 있다.

## 하위 노트

- [CI/CD](DevOps/Delivery/ci-cd.md): 지속적 통합·배포의 의미, Docker와 함께 쓰는 흐름, GitHub Actions 예시와 도구
- [배포 전략: 롤링, 블루-그린, 카나리, 섀도, 피처 토글](DevOps/Delivery/deployment-strategies.md): 다운타임·롤백 속도·비용·노출 범위로 비교한 배포 방식, 배포와 출시 분리
- [내구성 워크플로와 Temporal: 스케줄 배치를 코드로 짜고 상태를 복원하기](DevOps/Delivery/durable-workflow-temporal.md): 스케줄 배치의 디스크 포화·알림 누락 문제, Workflow·Activity·서버·워커 구조, cron·Jenkins와의 역할 차이, 중복 실행 방지 같은 운영 주의점
- [12요소 앱](DevOps/Delivery/twelve-factor-app.md): 설정·백엔드 서비스·폐기 가능성·개발·운영 일치 같은 열두 원칙과 지금의 구현
