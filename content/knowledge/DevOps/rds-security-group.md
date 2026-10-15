---
title: "AWS RDS에 외부 IP 접속 허용하기"
concept: "Security Group"
summary: "로컬 PC 같은 외부에서 RDS 데이터베이스에 접속할 수 있도록 보안 그룹 인바운드 규칙에 내 IP를 추가하는 방법과 주의점, 퍼블릭 액세스 없이 배스천 SSH 터널로 접속하는 방법."
tags: ["aws", "database", "security", "infra"]
source: notion
date: "2026-10-14"
sources: ["https://80000coding.notion.site/99481ed22b3e4d0da3f57f8930f8d8e7"]
---

> 「SSH 터널」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「DB와 DataGrip 연결하기」를 바탕으로 보강했다.

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

## 퍼블릭 액세스 없이 접속하기: SSH 터널

운영 DB는 퍼블릭 액세스를 끄고 VPC 안에만 두는 것이 안전하다. 이때는 같은 VPC에 있는 EC2(배스천 호스트)를 거쳐 **SSH 터널**로 접속한다. 내 PC의 포트로 보낸 연결이 SSH로 배스천까지 암호화되어 가고, 배스천이 RDS로 전달한다.

```text
DB 클라이언트 ──▶ localhost:3307 ══SSH══▶ EC2(배스천) ──▶ RDS 엔드포인트:3306
```

```bash
ssh -i key.pem -N -L 3307:mydb.xxxx.ap-northeast-2.rds.amazonaws.com:3306 ec2-user@<배스천 퍼블릭 DNS>
# 이제 클라이언트에서 Host=127.0.0.1, Port=3307 로 접속
```

DataGrip·DBeaver 같은 GUI 클라이언트는 연결 설정의 **SSH/SSL(SSH Tunnel)** 탭에서 같은 일을 해 준다.

| 입력 칸 | 값 |
| --- | --- |
| 일반 탭 Host / Port | RDS 엔드포인트와 DB 포트 (터널 너머에서 보이는 주소) |
| User / Password / Database | DB 계정과 접속할 DB 이름 |
| SSH Host | 배스천 EC2의 퍼블릭 DNS 또는 IP |
| SSH User | EC2 기본 사용자 (Amazon Linux는 `ec2-user`, Ubuntu는 `ubuntu`) |
| 인증 방식 | Key pair, Private key 파일에 `.pem` 경로 |

SSH 터널 탭에서 먼저 Test Connection으로 배스천 접속을 확인하고, 일반 탭에서 다시 DB 접속을 확인한다. 이 경우 RDS 보안 그룹의 인바운드 소스는 내 IP가 아니라 **배스천의 보안 그룹**으로 지정한다. 열어 둔 SSH 포트를 없애고 싶다면 AWS Systems Manager의 Session Manager 포트 포워딩이 같은 역할을 한다.

관련 노트: [DBeaver에서 SQL로 데이터 다루기](/knowledge/dictionary/tools/dbeaver), [[http-web-architecture|웹 앱의 요청·응답 구조(포트)]], [[aws-cloud-basics|AWS 클라우드 기초]]
