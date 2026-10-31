---
title: "서비스 운영 준비 체크리스트"
concept: "Production Readiness"
summary: "서버 애플리케이션을 프로덕션에 올리기 전에 확인할 최소 기준을 회복력, 수평 확장, 무중단 배포, 프로세스 감독, 로그, 알림과 헬스 체크, 지표, 고가용성, 부하·장애 테스트, 백업 복구, 보안, 법 열두 분야로 나누고 각 항목을 자세한 노트로 잇는다. 오래된 보안 헤더(X-XSS-Protection, HPKP)처럼 지금은 따르지 않는 항목도 정리한다."
tags: ["devops", "backend", "monitoring", "security", "infra", "architecture"]
source: other
date: "2026-10-21"
sources: ["https://github.com/mr-mig/going-to-production", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection", "https://developer.mozilla.org/en-US/docs/Glossary/HPKP"]
---

> 「[Going To Production Checklist](https://github.com/mr-mig/going-to-production)」의 서버 체크리스트를 뼈대로, 보안 헤더는 MDN 문서로 확인해 오늘 기준으로 재구성한 노트다. 프런트엔드 쪽은 [[frontend-launch-checklist|프론트엔드 출시 전 체크리스트]]에 있다.

## 체크리스트를 쓰는 법

체크리스트는 「프로덕션에서 처음 알게 되면 비싼 것」의 목록이다. 항목마다 예/아니오로 답할 수 있게 쓴다. 「모니터링이 잘 되어 있다」가 아니라 「오류율 임계치 알림이 있다」처럼 쓴다. 답이 「아니오」인 항목은 고치거나, 감수한다고 명시적으로 결정한다.

## 분야별 항목

| 분야 | 예라고 답할 수 있어야 하는 질문 | 자세히 |
| --- | --- | --- |
| 회복력 | 의존 서비스가 죽어도 핵심 기능을 일부라도 유지하나? 과부하가 지나가면 스스로 회복하나? 끊긴 DB·큐 연결을 다시 맺나? 내 장애가 다른 서비스로 번지지(연쇄 장애) 않나? | [[resiliency-patterns\|회복력 패턴]] |
| 수평 확장 | 여러 CPU·여러 인스턴스에서 돌 수 있나(상태를 프로세스 밖에 두나)? 로드 밸런서 뒤에서 도나? 중단 없이 노드를 더할 수 있나? | [[load-balancer\|로드 밸런서]], [[twelve-factor-app\|12요소 앱]] |
| 무중단 배포 | 사용자 세션을 잃지 않고 노드를 넣고 뺄 수 있나? 롤링·블루그린·카나리 배포가 되나? 되돌리기(롤백)가 한 단계인가? | [[deployment-strategies\|배포 전략]] |
| 프로세스 감독 | 서버 재시작 뒤 자동으로 뜨나? 죽으면 자동으로 다시 시작하나? | [[daemon-and-systemd\|데몬과 systemd]], [[kubernetes-architecture\|쿠버네티스 아키텍처]] |
| 로그 | 삼킨(catch만 하고 넘긴) 오류까지 모두 기록하나? 로그 수준이 구분되고 구조화(JSON)돼 있나? 한곳으로 모아 검색할 수 있나? | [[observability\|관측 가능성]] |
| 알림·헬스 체크 | 재시작, 오류율 임계치, 자원 고갈 임박(CPU·메모리·I/O 90% 이상), 타임아웃, 5xx 응답에 알림이 오나? 모든 구성 요소에 헬스 체크(liveness·readiness)가 있나? | [[observability\|관측 가능성]], [[server-incident-diagnosis\|서버 장애 진단]] |
| 지표 | 엔드포인트별 요청 수와 지연 시간, 핵심 비즈니스 연산의 소요 시간을 시간축으로 볼 수 있나? | [[observability\|관측 가능성]] |
| 고가용성 | 서로 독립된 데이터 센터(가용 영역·리전)에서 돌 수 있나? | [[high-availability-redundancy\|고가용성과 이중화]] |
| 테스트 | 부하(스트레스) 테스트를 했나? 네트워크 분할 상황을 시험했나? | [[server-incident-diagnosis\|서버 장애 진단]] |
| 백업 | 백업에서 실제로 복구해 봤나? 복구 목표 시간(RTO)과 데이터 손실 허용 범위(RPO)가 정해져 있나? | [[disaster-recovery\|재해 복구]] |
| 보안 | OWASP Top 10을 점검했나? 모든 엔드포인트가 TLS인가? 보안 헤더를 붙였나? 비밀 값이 코드·이미지에 없나? | [[web-security\|웹 보안]], [[devsecops\|DevSecOps]] |
| 법·정책 | 의존성 라이선스를 어기지 않나? 암호화 규제와 조직 기준을 지키나? | [[open-source-licenses\|오픈소스 라이선스]] |

백업은 복구해 본 것만 백업이다. 복구 절차를 한 번도 돌려 보지 않은 백업은 있다고 믿는 것일 뿐이다.

## 보안 헤더: 지금 붙이는 것과 버린 것

| 헤더 | 지금 |
| --- | --- |
| `Strict-Transport-Security` | 붙인다. 브라우저가 HTTPS로만 접속하게 한다 |
| `Content-Security-Policy` | 붙인다. XSS 방어의 핵심이다. 클릭재킹 방지도 `frame-ancestors`로 한다 |
| `X-Content-Type-Options: nosniff` | 붙인다. MIME 추측을 막는다 |
| `X-Frame-Options` | CSP `frame-ancestors`가 대체한다. 오래된 브라우저를 위해 함께 둘 수 있다 |
| `X-XSS-Protection` | **붙이지 않는다**(또는 `0`). 브라우저의 XSS 필터는 제거됐고, 켜 두면 오히려 새 취약점을 만들 수 있다. CSP를 쓴다 |
| `Public-Key-Pins`(HPKP) | **쓰지 않는다.** 잘못 설정하면 사이트를 장기간 접속 불가로 만들 수 있어 브라우저에서 제거됐다. 인증서 투명성(Certificate Transparency)이 대신한다 |

## 정리

- 체크리스트는 예/아니오로 답할 수 있는 질문으로 쓴다.
- 상태를 프로세스 밖에 두어야 수평 확장, 무중단 배포, 자동 재시작이 가능하다.
- 로그·알림·지표·헬스 체크가 있어야 장애를 사용자보다 먼저 안다.
- 백업은 복구해 봐야 백업이다.
- 보안 헤더는 HSTS·CSP·nosniff를 붙이고, X-XSS-Protection과 HPKP는 버린다.

관련 노트: [[frontend-launch-checklist|프론트엔드 출시 전 체크리스트]], [[observability|관측 가능성]], [[deployment-strategies|배포 전략]], [[resiliency-patterns|회복력 패턴]], [[disaster-recovery|재해 복구]], [[high-availability-redundancy|고가용성과 이중화]]
