---
title: "AWS RDS에 외부 IP 접속 허용하기"
concept: "Security Group"
summary: "로컬 PC 같은 외부에서 RDS 데이터베이스에 접속할 수 있도록 보안 그룹 인바운드 규칙에 내 IP를 추가하는 방법과 주의점."
tags: ["aws", "database", "security", "infra"]
source: notion
---

AWS의 **보안 그룹(Security Group)** 은 인스턴스·RDS 앞에 놓인 가상 방화벽이다. 기본적으로 허용하지 않은 인바운드(들어오는) 트래픽은 모두 막기 때문에, 로컬 PC의 DB 클라이언트(DBeaver 등)에서 RDS에 직접 접속하려면 내 IP를 인바운드 규칙에 추가해야 한다.

## 설정 순서 (PostgreSQL 예)

1. RDS 콘솔 → **데이터베이스** → DB 식별자 클릭
2. **연결 & 보안** 탭 → **VPC 보안 그룹** 링크 클릭
3. 아래 **인바운드 규칙** → **인바운드 규칙 편집**
4. **규칙 추가**: 유형 `PostgreSQL`(포트 5432 자동 입력), 소스 **내 IP** 선택 후 저장

MySQL이면 유형을 `MySQL/Aurora`(3306)로 고른다.

## 함께 확인할 것

- RDS 인스턴스의 **퍼블릭 액세스 가능** 설정이 꺼져 있으면 보안 그룹을 열어도 외부에서 접속할 수 없다. 이 경우 같은 VPC의 배스천(점프) 서버나 SSM 포트 포워딩을 거쳐 접속한다.
- **소스를 `0.0.0.0/0`(모든 IP)으로 열지 않는다.** DB 포트를 인터넷 전체에 노출하는 것은 무차별 대입 공격의 표적이 된다.
- 집·카페처럼 IP가 바뀌는 곳에서는 접속이 다시 막힐 수 있다. 규칙에 설명(누구의 어떤 IP인지)을 적어 두고, 쓰지 않는 규칙은 지운다.

관련 노트: [DBeaver에서 SQL로 데이터 다루기](/knowledge/dictionary/tools/dbeaver), [[http-web-architecture|웹 앱의 요청·응답 구조(포트)]]
