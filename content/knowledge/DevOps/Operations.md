---
title: "운영"
concept: "Operations"
summary: "관측, 장애 진단과 포스트모템, 출시 전 체크리스트, 재해 복구, 시크릿, 플랫폼 엔지니어링과 ChatOps."
tags: ["devops","sre","observability"]
source: mixed
date: "2026-11-26"
---

운영 노트는 서비스가 올라간 뒤 그것을 지키고 개선하는 일을 다룬다. 로그·트레이스·메트릭, 장애 진단과 포스트모템, 출시 전 체크리스트, 재해 복구, 시크릿, DevSecOps, 플랫폼 엔지니어링과 ChatOps가 여기 있다.

## 하위 노트

- [관측 가능성: 로그, 트레이스, 메트릭](DevOps/Operations/observability.md): 세 기둥의 차이, OpenTelemetry, 풀·푸시 수집, 시계열 DB
- [서버 장애 진단 패턴](DevOps/Operations/server-incident-diagnosis.md): load average·I/O 지표, 힙 덤프, 커넥션·DNS·쿼리·Redis 메모리 장애 유형
- [장애 대응과 포스트모템](DevOps/Operations/incident-postmortem.md): 탐지 → 전파 → 해결 → 보고 → 회고, 임시 조치, 비난 없는 포스트모템과 액션 아이템
- [서비스 운영 준비 체크리스트](DevOps/Operations/production-readiness-checklist.md): 회복력·확장·무중단 배포·로그·알림·지표·백업·보안 등 열두 분야의 출시 전 최소 기준, 지금은 따르지 않는 항목
- [서버 이전(마이그레이션) 절차: 조사, 리허설, 전환, 롤백](DevOps/Operations/server-migration.md): 스택 조사와 영향도 평가, 백업과 리허설 스크립트, 다운타임을 줄이는 전환, 롤백 절차와 사후 점검
- [고가용성과 재해 복구 설계](DevOps/Operations/disaster-recovery.md): HA와 DR의 차이, RTO·RPO, 백업·파일럿 라이트·웜 스탠바이·액티브-액티브, 운영 도구까지 포함한 전 계층 다중화와 전환 훈련
- [DevOps, SRE, 플랫폼 엔지니어링, NoOps와 클라우드 거버넌스](DevOps/Operations/devops-sre-platform-engineering.md): 협업 문화, SLO·에러 버짓, 내부 플랫폼, 서버리스 지향의 차이, 클라우드 운영 조직 모델(CCoE)과 가드레일 거버넌스
- [플랫폼 엔지니어링: 내부 개발자 플랫폼과 골든 패스](DevOps/Operations/platform-engineering.md): 개발자를 고객으로 보는 IDP, 다섯 구성 요소와 오케스트레이터, 포털과 플랫폼, 골든 패스 설계, 최소 실행 가능 플랫폼
- [DevSecOps와 클라우드 보안: 개발 흐름에 보안 넣기, 위협과 대응](DevOps/Operations/devsecops.md): 위협 모델링, 코드·의존성·이미지·IaC 자동 검사, 비밀 관리, 취약점 관리, 클라우드의 관리적·기술적 위협과 CVE·CCE 점검, 보안 솔루션 배치
- [시크릿 관리: 저장소 밖에 두고, 짧게 쓰고, 새면 바로 교체한다](DevOps/Operations/secrets-management.md): OIDC로 시크릿 없애기, 범위를 좁혀 시크릿 매니저에서 주입, 로컬 `.env` 대안, 시크릿 스캔과 푸시 보호, 교체와 유출 뒤 대응 순서
- [개발자를 노리는 사회공학 공격](DevOps/Operations/developer-targeted-social-engineering.md): 가짜 채용 코딩 과제(Contagious Interview)·가짜 화상 회의·레지스트리 사칭 피싱, 남이 준 코드를 격리 환경에서 돌리는 법
- [ChatOps: 채팅에서 운영하기](DevOps/Operations/chatops.md): 채팅방 봇 명령으로 배포·조회·장애 대응, 투명성과 온보딩, 도입 단계, 권한·비밀·알림 피로
