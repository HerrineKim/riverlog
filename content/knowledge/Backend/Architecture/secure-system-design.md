---
title: "보안 시스템 설계: 원칙과 민감 데이터 관리"
concept: "Secure System Design"
summary: "보안 설계는 기밀성·무결성·가용성(CIA)을 지키는 일이고, 인증·인가·암호화·네트워크·컨테이너·API·서드파티·감사·사고 대응·재해 복구를 처음부터 기본값으로 넣는 것이다. 웹 앱의 대표 위험은 OWASP Top 10(2025)으로 점검한다. 민감 데이터는 분류하고, 전송·저장 중 암호화하고, 키를 분리 관리하고, 비식별화하고, 최소 권한과 수명 주기로 접근을 좁힌다."
tags: ["security", "backend", "architecture", "privacy"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/cybersecurity-101-in-one-picture", "https://bytebytego.com/guides/how-do-we-design-a-secure-system", "https://bytebytego.com/guides/how-do-we-manage-sensitive-data-in-a-system", "https://www.nist.gov/cyberframework", "https://owasp.org/www-project-top-ten/", "https://top10.owasp.org/2025/0x00_2025-Introduction/"]
---

> ByteByteGo의 System Design 101 가이드 「[Cybersecurity 101](https://bytebytego.com/guides/cybersecurity-101-in-one-picture)」, 「[How to Design a Secure System](https://bytebytego.com/guides/how-do-we-design-a-secure-system)」, 「[How do we manage sensitive data in a system?](https://bytebytego.com/guides/how-do-we-manage-sensitive-data-in-a-system)」를 바탕으로 재구성한 노트다. 웹 애플리케이션 위험 순위는 「[OWASP Top 10](https://owasp.org/www-project-top-ten/)」 2025년판 [소개 문서](https://top10.owasp.org/2025/0x00_2025-Introduction/)로 보강했다.

## 무엇을 지키나: CIA

| 요소 | 뜻 | 깨지는 예 | 지키는 수단 |
| --- | --- | --- | --- |
| 기밀성(Confidentiality) | 허가된 사람만 읽는다 | 데이터 유출, 도청 | 암호화, 접근 통제 |
| 무결성(Integrity) | 허가 없이 바뀌지 않는다 | 위변조, 중간자 공격 | 해시·서명, 감사 로그 |
| 가용성(Availability) | 필요할 때 쓸 수 있다 | DDoS, 랜섬웨어, 장애 | 이중화, 백업, 레이트 리밋 |

자세한 공격 기법 목록은 [[security|정보 시스템 보안]]에, 계층별 네트워크 공격은 [[network-security|네트워크 보안: 방화벽, VPN, 계층별 공격]]에 있다.

### 흔한 위협과 기본 방어

| 위협 | 기본 방어 |
| --- | --- |
| 악성 코드·랜섬웨어 | 엔드포인트 보호, 패치, 오프라인 백업 |
| 피싱·사회공학 | 피싱에 강한 인증(패스키), 교육 |
| 무차별 대입·계정 탈취 | MFA, 시도 횟수 제한 → [[two-factor-totp-passkey\|2단계 인증: TOTP와 패스키]] |
| 인젝션 | 입력 검증, 파라미터화 쿼리 → [[api-security\|API 보안 체크리스트]] |
| 서비스 거부 | 방화벽, CDN·DDoS 방어, 오토스케일링 |
| 내부자 위협 | 최소 권한, 감사 로그, 직무 분리 |

## 설계 체크리스트

보안은 출시 직전에 덧붙이는 기능이 아니라 **처음부터 기본값**이다. 설계 단계에서 아래 영역을 하나씩 점검한다.

| 영역 | 핵심 질문 | 관련 노트 |
| --- | --- | --- |
| 인증 | 누가 들어오는가. MFA·패스키를 지원하나 | [[session-vs-token-auth\|세션 기반 인증과 토큰 기반 인증]] |
| 인가 | 들어온 사람이 무엇을 할 수 있나. 기본은 거부인가 | [[access-control-models\|권한 시스템 설계: ACL, RBAC, ABAC]] |
| 암호화 | 전송 중(TLS)과 저장 중 데이터가 모두 암호화되나 | [[encoding-encryption-hashing\|인코딩·암호화·해시·토큰화와 디지털 서명]] |
| 취약점 관리 | 의존성·이미지 취약점을 지속적으로 찾고 고치나 | [[devsecops\|DevSecOps]] |
| 감사·규정 준수 | 누가 언제 무엇을 했는지 위변조 불가하게 남나 | |
| 네트워크 보안 | 기본 거부 방화벽, 사설망 분리, 관리 포트 제한 | [[network-security\|네트워크 보안: 방화벽, VPN, 계층별 공격]] |
| 단말 보안 | 직원 기기 관리, 디스크 암호화, 화면 잠금 | |
| 컨테이너 보안 | 최소 이미지, 루트 아닌 사용자, 이미지 서명 | [[devsecops\|DevSecOps]] |
| API 보안 | 입력 검증, 레이트 리밋, 응답 최소화 | [[api-security\|API 보안 체크리스트]] |
| 서드파티 관리 | 외부 업체·SDK에 넘기는 데이터와 권한이 최소인가 | |
| 사고 대응 | 탐지 → 격리 → 복구 → 사후 분석 절차와 연락망이 있나 | |
| 재해 복구 | RTO·RPO 목표와 복구 연습 | [[disaster-recovery\|고가용성과 재해 복구 설계]] |

### OWASP Top 10: 웹 애플리케이션 위험 순위

OWASP(Open Worldwide Application Security Project) Top 10은 실제 취약점 데이터와 업계 설문을 모아 **웹 애플리케이션에서 가장 치명적인 위험 열 가지**를 정한 인식 표준이다. 보안 코딩 교육과 점검의 출발점으로 쓴다. 최신판은 2025년판(여덟 번째)이다.

| 순위 | 위험(2025) | 내용 | 2021년판 대비 |
| --- | --- | --- | --- |
| A01 | 접근 통제 실패(Broken Access Control) | 권한 없는 데이터·기능에 접근. 다른 사용자 ID로 조회(IDOR), 관리자 API 노출 | 유지. SSRF를 흡수했다 |
| A02 | 보안 설정 오류(Security Misconfiguration) | 기본 계정·불필요한 기능·과한 에러 메시지·클라우드 권한 설정 실수 | 5위 → 2위 |
| A03 | 소프트웨어 공급망 실패(Software Supply Chain Failures) | 의존성·빌드 시스템·배포 인프라의 침해 | **신설**(옛 「취약하고 오래된 구성 요소」를 넓혔다) |
| A04 | 암호화 실패(Cryptographic Failures) | 평문 전송·저장, 약한 알고리즘, 잘못된 키 관리 | 2위 → 4위 |
| A05 | 인젝션(Injection) | SQL·명령어·XSS처럼 입력이 코드로 해석된다 | 3위 → 5위 |
| A06 | 안전하지 않은 설계(Insecure Design) | 위협 모델링 없이 설계 단계부터 빠진 통제 | 4위 → 6위 |
| A07 | 인증 실패(Authentication Failures) | 크리덴셜 스터핑, 약한 비밀번호 정책, 세션 관리 결함 | 이름에서 「식별」이 빠졌다 |
| A08 | 소프트웨어·데이터 무결성 실패 | 서명 검증 없는 업데이트, 신뢰할 수 없는 직렬화 데이터 | 유지 |
| A09 | 보안 로깅·경보 실패(Security Logging & Alerting Failures) | 기록은 있어도 경보가 없어 침해를 늦게 안다 | 「모니터링」이 「경보」로 바뀌었다 |
| A10 | 예외 상황 처리 미흡(Mishandling of Exceptional Conditions) | 잘못된 에러 처리, 논리 오류, 비정상 상황에서 열린 채 실패(fail open) | **신설** |

- 2021년판 10위였던 SSRF는 A01로, 「취약하고 오래된 구성 요소」는 A03으로 합쳐졌다.
- 브라우저 쪽 인젝션(XSS)과 CSRF 방어는 [[web-security|웹 보안: CSRF와 XSS]]에, API에 특화된 목록(OWASP API Security Top 10)은 [[api-security|API 보안 체크리스트]]에, LLM 앱 목록은 [[llm-security-attacks|LLM 보안 공격: 탈옥, 프롬프트 인젝션, 데이터 중독]]에 있다.

### 프레임워크

체크리스트를 조직 단위로 운영할 때는 공개 프레임워크를 뼈대로 쓴다. **NIST CSF 2.0**은 거버넌스(Govern)·식별(Identify)·보호(Protect)·탐지(Detect)·대응(Respond)·복구(Recover)의 여섯 기능으로 나누고, **ISO/IEC 27001**은 정보보호 관리 체계 인증 표준이다.

## 민감 데이터 관리

민감 데이터는 개인 식별 정보(PII), 건강 정보, 금융 정보, 지식 재산, 교육·법률 기록 등이다. GDPR 같은 개인정보 법규는 보호 의무를 지우고 위반 시 큰 과징금을 매긴다. 그래서 **데이터 보호를 설계 요구사항으로** 다룬다.

### 1. 분류부터

어떤 필드가 민감한지 모르면 보호할 수 없다. 데이터마다 등급(공개, 내부, 기밀, 제한)을 붙이고, 등급에 따라 저장소·접근 권한·로그 마스킹 규칙을 정한다.

### 2. 암호화와 키 관리

- 전송 구간은 TLS, 저장 데이터는 저장소 암호화 + 필요하면 필드 단위 암호화를 쓴다.
- 비밀번호는 암호화가 아니라 느린 해시로 저장한다 → [[password-storage|비밀번호 저장과 비밀번호 관리자]]
- **암호문과 키를 같은 곳에 두지 않는다.** 키는 KMS·HSM에 두고, 데이터 키를 마스터 키로 감싸는 봉투 암호화를 쓴다.
- 가장 중요한 키는 한 사람이 단독으로 쓰지 못하게 **키 분할**과 **이중 통제**를 건다. 예를 들어 신청자·관리자·감사자가 각자 한 조각씩 가져 모두 모여야 열리게 하거나, N명 중 M명이 모여야 복원되는 비밀 분산을 쓴다.

### 3. 비식별화

**비식별화(data desensitization)** 는 데이터에서 개인을 알아볼 수 없게 지우거나 바꾸는 일이다. 연구·통계·외부 공유는 물론, 사내에서 분석가에게 넘길 때도 쓴다.

| 기법 | 방법 | 되돌리기 |
| --- | --- | --- |
| 마스킹 | `010-****-1234`처럼 일부를 가린다 | 불가 |
| 가명화 | 식별자를 다른 값(해시·토큰)으로 바꾼다 | 대응표가 있으면 가능. 그래서 여전히 개인정보로 취급될 수 있다 |
| 토큰화 | 원본은 금고에, 시스템에는 토큰만 | 금고 권한이 있으면 가능 |
| 일반화·범주화 | 나이 34 → 30대, 주소 → 시·군·구 | 불가 |
| 집계·노이즈 | 개별 행 대신 통계, 차분 프라이버시 | 불가 |

여러 필드를 조합하면 다시 특정될 수 있다(생년월일 + 성별 + 우편번호). 한 필드씩이 아니라 **조합**을 보고 판단한다.

### 4. 최소 권한

사용자·서비스에게 업무에 필요한 최소한의 데이터 권한만 준다. 역할 기반 접근 제어(RBAC)가 흔한 출발점이다 → [[access-control-models|권한 시스템 설계: ACL, RBAC, ABAC]].

### 5. 수명 주기

| 단계 | 할 일 |
| --- | --- |
| 수집 | 필요한 것만 받는다 → [[privacy-data-minimization\|데이터 최소화와 프라이버시 실천]] |
| 개발 | 운영 데이터 대신 비식별 데이터로 개발한다. 꼭 필요하면 기한을 둔 권한만 준다 |
| 운영 | 데이터 상품(리포트·피드)이 배포되면 개발자 접근 권한을 회수한다 |
| 보관·폐기 | 보관 기한이 지나면 지운다. 백업에서도 지워지는지 확인한다 |

## 정리

- 보안 설계의 목표는 CIA이고, 인증·인가·암호화·네트워크·컨테이너·API·서드파티·감사·사고 대응·재해 복구를 처음부터 기본값으로 넣는다.
- 민감 데이터는 분류 → 암호화와 키 분리 → 비식별화 → 최소 권한 → 수명 주기 관리 순으로 다룬다.
- 키는 데이터와 떨어진 곳에 두고, 가장 중요한 키는 한 사람이 단독으로 쓰지 못하게 한다.

관련 노트: [[security|정보 시스템 보안]], [[api-security|API 보안 체크리스트]], [[devsecops|DevSecOps]], [[access-control-models|권한 시스템 설계: ACL, RBAC, ABAC]], [[privacy-encryption|프라이버시를 위한 암호화: 전송·저장·종단 간]], [[network-security|네트워크 보안: 방화벽, VPN, 계층별 공격]], [[backend-murphys-law|개발자 머피의 법칙]]
