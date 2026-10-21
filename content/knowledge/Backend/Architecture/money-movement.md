---
title: "자금 이동: 청산과 결제"
concept: "Money Movement"
summary: "온라인 결제 뒤에서 돈이 실제로 움직이는 구조를 정리했다. 정보 흐름과 자금 흐름이 분리되는 이유, 청산(clearing)과 결제(settlement)의 차이, 배치 이체망 ACH, 은행 간 메시지망 SWIFT, 외화 결제의 환전 경로, 실시간 이체망 UPI를 다루고, 은행 지갑과 블록체인 지갑·Web 3.0의 차이까지 비교한다."
tags: ["backend", "payment", "fintech", "architecture", "blockchain"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/money-movement", "https://bytebytego.com/guides/how-to-learn-payments", "https://bytebytego.com/guides/how-does-ach-payment-work", "https://bytebytego.com/guides/swift-payment-messaging-system", "https://bytebytego.com/guides/foreign-exchange-payments", "https://bytebytego.com/guides/unified-payments-interface-upi-in-india", "https://bytebytego.com/guides/digital-wallet-in-traditional-banks-vs-wallet-in-blockchain", "https://bytebytego.com/guides/what-is-web-3", "https://www.swift.com/standards/iso-20022"]
---

> ByteByteGo의 System Design 101 가이드 「[Money Movement](https://bytebytego.com/guides/money-movement)」, 「[How to Learn Payments](https://bytebytego.com/guides/how-to-learn-payments)」, 「[How ACH Payment Works](https://bytebytego.com/guides/how-does-ach-payment-work)」, 「[SWIFT Payment Messaging System](https://bytebytego.com/guides/swift-payment-messaging-system)」, 「[Foreign Exchange Payments](https://bytebytego.com/guides/foreign-exchange-payments)」, 「[Unified Payments Interface (UPI)](https://bytebytego.com/guides/unified-payments-interface-upi-in-india)」, 「[Digital Wallets: Banks vs. Blockchain](https://bytebytego.com/guides/digital-wallet-in-traditional-banks-vs-wallet-in-blockchain)」, 「[What is Web 3.0?](https://bytebytego.com/guides/what-is-web-3)」를 바탕으로 재구성한 노트다.

## 결제 산업의 구성

나라마다 제도는 다르지만 결제 산업은 대체로 같은 부품으로 이뤄진다.

| 구성 | 역할 |
| --- | --- |
| 감독 당국 | 결제 사업자 인허가와 규제 |
| 중앙은행 | 은행들의 지급준비금 계좌를 두고 최종 결제를 맡는다 |
| 상업은행 | 고객 계좌를 두고 이체를 일으킨다 |
| 비은행 결제 사업자 | PayPal, Stripe 같은 PSP·전자지갑 |
| 결제 시스템 | 카드망, 계좌 이체망 등 지급 지시를 주고받는 체계 |
| 청산망(clearing network) | 누가 누구에게 얼마를 줘야 하는지 계산한다 |
| 결제 시스템(settlement system) | 실제 돈을 준비금 계좌 사이에서 옮긴다 |

## 정보 흐름과 자금 흐름

돈의 이동은 두 개념으로 나뉜다.

| 개념 | 의미 |
| --- | --- |
| **청산(clearing)** | 누가 누구에게 얼마를 줘야 하는지 **계산**한다. 서로 상계되는 거래를 순액으로 줄인다(netting) |
| **결제(settlement)** | 실제 돈이 결제 은행에 있는 **준비금 계좌 사이에서 이동**한다 |

예를 들어 하루 동안 A은행이 B은행에 100을, B은행이 A은행에 500을 줘야 한다면, 청산 후 실제로는 B은행이 A은행에 400만 보낸다.

### 세 층

```text
거래 층(transaction)      : 온라인 구매가 일어나는 곳 (쇼핑몰, PayPal)     ┐
지급·청산 층(payment/clearing): 지급 지시와 상계가 일어나는 곳 (청산 기관)  ┘ 정보 흐름
결제 층(settlement)       : 실제 돈이 움직이는 곳 (결제 은행의 준비금 계좌)    자금 흐름
```

**정보 흐름과 자금 흐름은 분리돼 있다.** 정보 흐름에서는 한 계좌에서 빠지고 다른 계좌에 더해진 것처럼 보이지만, 실제 돈은 하루가 끝날 때 결제 은행에서 움직인다. 둘이 비동기로 움직이므로 **각 단계마다 대사(reconciliation)** 가 필요하다. 대사의 실무는 [[payment-system|결제 시스템 설계]]에서 다룬다.

### 마켓플레이스의 입금과 지급

판매자가 여럿인 마켓플레이스에서는 돈이 두 번 움직인다.

| 흐름 | 경로 |
| --- | --- |
| 입금(pay-in) | 구매자 → (PSP가 저장된 카드 토큰으로 대신 결제) → 플랫폼 계좌. 은행들은 청산 기관에 거래 내역을 보내고, 결제 은행의 준비금 계좌 사이에서 돈이 옮겨진다 |
| 지급(pay-out) | 플랫폼 → 판매자 계좌. 판매자에게 지급 예정을 알리고, 플랫폼 은행에서 판매자 은행으로 이체한다. 이것도 청산 → 결제를 거친다 |

## ACH: 배치로 움직이는 계좌 이체

ACH(Automated Clearing House)는 미국의 소액 계좌 이체망이다. 급여 입금, 자동 납부처럼 **급하지 않은 대량 이체를 묶음(batch)으로** 처리한다.

| 역할 | 의미 |
| --- | --- |
| 발신자(originator) | 이체를 시작하는 회사. 은행 계좌가 있어야 한다 |
| ODFI | 발신 은행(Originating Depository Financial Institution). 은행만 ACH 거래를 직접 일으킬 수 있다 |
| ACH 운영자 | 연준이 운영하는 FedACH와 민간 운영자 EPN 두 곳 |
| RDFI | 수신 은행(Receiving Depository Financial Institution) |

```text
급여 담당 회사 → 급여 대행사(ACH 파일 생성) → ODFI의 SFTP에 마감 시각 전 업로드
  → 영업 종료 후 ODFI가 ACH 운영자에 전달 → 밤사이 처리 → RDFI가 받음
  → 다음 영업일 아침 RDFI가 수신자 계좌에 반영
```

- 기본은 **다음 날 결제**다. 마감 전에 보낸 이체가 다음 날 아침 도착한다.
- 당일 결제(Same Day ACH)도 있다.
- 수신자는 발신자에게 특정 유형의 이체를 미리 허락해 둬야 한다.

## SWIFT: 은행 간 메시지망

SWIFT는 **돈을 옮기는 망이 아니라 송금 지시 메시지를 안전하게 전달하는 망**이다. 회원 은행들이 소유한 협동조합으로, 국경 간 송금의 표준 통로다. 실제 돈은 은행끼리 서로 개설한 계좌(환거래 계좌)나 결제 시스템에서 움직인다.

메시지 전달은 **저장 후 전달(store-and-forward)** 이고 단계마다 확인 응답을 남긴다.

```text
A은행 → 지역 처리기(형식 검증) → 저장 처리기(저장·라우팅)
  → A은행에 ACK(전달 예정) 또는 NAK(전달 안 함)
저장 처리기 → 상대 지역 처리기 → 고유 출력 번호 부여 → 검증 후 B은행에 전달
B은행 → UAK(정상 수신) 또는 UNK(체크섬 오류)
  → 수신 보고서를 양쪽 처리기에 저장
```

- 모든 단계에서 저장하고 응답하므로 메시지가 사라지지 않고, 누가 언제 받았는지 증명할 수 있다.
- 메시지 형식은 오래된 MT 형식에서 구조화된 데이터를 담는 ISO 20022(MX) 형식으로 옮겨 갔다.

## 외화 결제

구매자는 달러로 내고 판매자는 유로로 받는 경우, 결제 사업자가 중간에서 환전한다.

```text
구매자 은행 → PSP의 달러 계좌 → 환전 사업자(은행)의 PSP 달러 계좌
  → 환전 사업자의 자금 풀에 달러 매도, 유로 수령 → PSP의 유로 계좌 → 판매자 유로 계좌
```

외환 시장은 세 층이다.

| 층 | 참여자 | 역할 |
| --- | --- | --- |
| 소매(retail) | 결제 사업자, 환전 사업자의 자금 풀 | 효율을 위해 외화를 미리 사 둔다 |
| 도매(wholesale) | 투자은행, 상업은행, 환전 사업자 | 소매 시장에서 쌓인 주문을 모아 처리한다 |
| 최상위 | 여러 나라 통화를 대량 보유한 다국적 은행 | 도매 시장의 주문을 받는다 |

자금 풀의 외화가 부족하면 도매 시장에서, 도매가 충분히 모이면 최상위 참여자에게서 사 온다. 주문을 모아 위로 올리는 구조다.

## UPI: 실시간 계좌 이체망

UPI(Unified Payments Interface)는 인도의 실시간 계좌 이체 체계로, **상호운용 표준 + 지급 메시지 형식**이다. 어느 앱을 쓰든 어느 은행 계좌로든 즉시 보낼 수 있다.

| 개념 | 의미 |
| --- | --- |
| VPA(Virtual Payment Address) | `이름@은행` 꼴의 가상 결제 주소(UPI ID). 계좌 번호를 드러내지 않고 송금받는다 |
| NPCI | 인도결제공사. 송신 측 은행과 수신 측 은행 사이의 **스위치** 역할을 한다 |
| PIN | 계좌를 VPA에 연결할 때 정하고, 결제마다 2단계 인증으로 쓴다 |

```text
등록: 휴대폰 번호 → OTP 인증 → VPA 생성(앱이 은행에 요청) → 은행 계좌 연결 + PIN 설정
송금: 송금 앱 → 송금 측 은행 → NPCI → VPA를 실제 계좌로 해석
      → 보내는 계좌에서 출금 → 받는 계좌에 입금 → 성공 통지
```

UPI는 VPA라는 간접 주소와 중앙 스위치로 **모든 앱과 은행을 하나의 망으로 묶은** 사례다. 다른 나라의 실시간 이체망 설계도 비슷한 구조를 따른다.

## 은행 지갑과 블록체인 지갑

| 동작 | 은행 | 블록체인 |
| --- | --- | --- |
| 입금·출금 | 은행마다 계좌를 따로 열고 현금을 맡긴다 | 현금이 없다. 주소를 만들고 개인 키를 지갑 앱에 보관하면 바로 받을 수 있다 |
| 이체 | 장부상으로는 즉시 반영되지만 실제 돈은 은행 간 일괄 정산 때 움직인다 | 개인 키로 거래에 서명하고, 블록체인에서 확정되면 잔액이 바뀐다 |
| 계좌 | 은행마다 하나씩 | 주소 하나로 어디서나 쓴다 |

블록체인은 **분산 원장**이다. 여러 은행의 장부를 하나의 공유 장부로 합친 것처럼 동작하므로 은행 간 일괄 대사를 기다리지 않는다. 대신 확정 시간, 수수료 변동, 개인 키 분실 시 복구 불가 같은 한계가 있다.

### Web 1.0 · 2.0 · 3.0

| 세대 | 성격 | 특징 |
| --- | --- | --- |
| Web 1.0 | 읽기 | 하이퍼링크로 잇는 정적 페이지 목록 |
| Web 2.0 | 읽기·쓰기 | 검색, 소셜, 추천. 플랫폼이 사용자 데이터를 쌓고 **광고**가 주된 수익 모델이 된다 |
| Web 3.0 | 읽기·쓰기·**소유** | 블록체인과 분산 저장소(IPFS 등)로 데이터를 사용자가 소유한다는 구상. 앱이 데이터를 쓰려면 사용자의 허락과 대가가 필요하다 |

Web 3.0은 구상이자 운동에 가깝고, 실제 서비스 상당수는 여전히 중앙화된 인프라(노드 제공자, 거래소)에 기대고 있다.

## 정리

- 청산은 계산, 결제는 실제 돈의 이동이다. 정보 흐름과 자금 흐름이 분리되므로 대사가 필요하다.
- ACH는 다음 날 결제가 기본인 배치 이체망, SWIFT는 돈이 아니라 송금 메시지를 나르는 망이다.
- 외화 결제는 결제 사업자 → 환전 사업자 자금 풀 → 도매 → 최상위 은행으로 주문을 모아 올린다.
- UPI는 가상 주소(VPA)와 중앙 스위치로 앱과 은행을 하나의 실시간 이체망으로 묶었다.
- **블록체인 지갑은 여러 장부를 하나의 공유 원장으로 바꿔 일괄 정산을 없애는 대신, 키 관리와 확정 지연이라는 새 문제를 가져온다.**

관련 노트: [[payment-system|결제 시스템 설계]], [[card-payment-network|카드 결제망과 간편결제]], [[web-services-and-it-trends|웹 서비스와 IT 신기술 용어]]
