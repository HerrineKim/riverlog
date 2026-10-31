---
title: "카드 결제망과 간편결제"
concept: "Card Payment Network"
summary: "카드를 긁는 순간부터 가맹점이 돈을 받기까지의 승인·매입·정산 흐름과, 발급사·매입사·카드 네트워크·PG·프로세서가 각각 맡는 일, 수수료가 나뉘는 구조를 정리했다. 카드 번호 대신 토큰을 쓰는 Apple Pay·Google Pay, QR 결제의 네 가지 방식과 「스캔해서 결제」 흐름까지 다룬다."
tags: ["backend", "payment", "fintech", "security", "architecture"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-does-visa-work-when-we-swipe-a-credit-card-at-a-merchant's-shop", "https://bytebytego.com/guides/how-does-visa-make-money", "https://bytebytego.com/guides/the-payments-ecosystem", "https://bytebytego.com/guides/how-applegoogle-pay-works", "https://bytebytego.com/guides/4-ways-of-qr-code-payment", "https://bytebytego.com/guides/how-does-scan-to-pay-work", "https://support.apple.com/en-us/101554", "https://developers.google.com/pay/api"]
---

> ByteByteGo의 System Design 101 가이드 「[How VISA Works When Swiping a Credit Card](https://bytebytego.com/guides/how-does-visa-work-when-we-swipe-a-credit-card-at-a-merchant's-shop)」, 「[How does Visa make money?](https://bytebytego.com/guides/how-does-visa-make-money)」, 「[The Payments Ecosystem](https://bytebytego.com/guides/the-payments-ecosystem)」, 「[How do Apple Pay and Google Pay work?](https://bytebytego.com/guides/how-applegoogle-pay-works)」, 「[4 Ways of QR Code Payment](https://bytebytego.com/guides/4-ways-of-qr-code-payment)」, 「[How Scan to Pay Works](https://bytebytego.com/guides/how-does-scan-to-pay-work)」를 바탕으로 재구성한 노트다.

## 카드 결제의 참여자

카드 결제에는 최소 네 당사자가 있고, 그 사이를 **카드 네트워크(card network, card scheme)** 가 잇는다. 발급사와 매입사는 보통 서로 다른 은행이다. 네트워크가 없으면 모든 은행이 다른 모든 은행과 일대일로 정산해야 하므로, 네트워크가 중개하며 수수료를 받는다.

| 참여자 | 역할 |
| --- | --- |
| 카드 소지자(cardholder) | 카드로 결제하는 고객 |
| 발급사(issuing bank, issuer) | 카드를 발급하고 고객 계좌·한도를 관리한다. 승인 여부를 정한다 |
| 가맹점(merchant) | 물건을 파는 쪽 |
| 매입사(acquiring bank, acquirer) | 가맹점과 계약해 카드 거래를 받아 주고 대금을 지급한다. 단말기를 제공한다 |
| 카드 네트워크 | Visa, Mastercard 등. 매입사와 발급사 사이에서 거래를 라우팅하고 청산한다 |

### 결제 생태계의 다른 역할

실제로는 은행 사이에 기술 사업자가 끼어 있다. 결제 스타트업은 보통 이 중 한 영역에서 시작해 옆 영역으로 넓힌다.

| 역할 | 하는 일 |
| --- | --- |
| 결제 게이트웨이(payment gateway) | 가맹점에서 결제 정보를 받아 프로세서로 넘기는 입구. 온라인 결제의 PG가 여기 해당한다 |
| 매입 프로세서(acquiring processor) | 매입사를 대신해 카드 네트워크와 통신하고, 정산 기간 동안 가맹점 계정을 운영한다 |
| 발급 프로세서(issuing processor) | 발급사를 대신해 카드 네트워크와 통신하고 고객 계정을 검증한다 |
| ISO / MSP | 오프라인 가맹점을 모집해 프로세서와 연결해 주는 영업 대행 |

## 승인 흐름과 매입·정산 흐름

카드 결제는 **두 번 나눠서** 일어난다. 긁는 순간에는 승인만 하고, 돈은 나중에 묶음으로 움직인다.

```text
[승인(authorization)] 카드를 긁는 순간
  카드 → POS 단말 → 매입사 → 카드 네트워크 → 발급사
                                              └ 한도 확인, 승인 시 금액을 묶어 둠(hold)
  승인/거절 ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ┘

[매입·정산(capture & settlement)] 하루 영업이 끝난 뒤
  가맹점 "매입" → 매입사에 거래 묶음(batch) 전송 → 카드 네트워크
  카드 네트워크: 여러 매입사의 거래를 청산(clearing)해 발급사별 청산 파일 발송
  발급사: 청산 파일 확인 → 매입사로 대금 이체
  매입사 → 가맹점 계좌로 입금
```

- **청산(clearing)** 은 서로 상계되는 거래를 순액으로 줄여 실제 이체 건수를 줄이는 과정이다. 청산과 결제(settlement)의 차이는 [[money-movement|자금 이동]]에서 자세히 다룬다.
- 승인과 매입이 분리돼 있으므로 온라인 쇼핑몰은 주문 시 승인만 받고 **출고 시점에 매입**하거나, 승인을 취소(void)할 수 있다.

## 수수료는 어떻게 나뉘나

가맹점은 카드 결제로 매출이 늘어나는 대가로 **가맹점 수수료(merchant discount fee)** 를 낸다. 이 수수료가 참여자들에게 나뉜다.

| 항목 | 누가 받나 | 성격 |
| --- | --- | --- |
| 가맹점 수수료 | 매입사가 가맹점에게서 받는다 | 아래 항목을 모두 덮어야 한다 |
| 매입사 마진(acquiring markup) | 매입사 | 가맹점 수수료 중 매입사가 남기는 몫 |
| 교환 수수료(interchange fee) | 발급사 | 카드 네트워크가 정한다. 발급사마다 가맹점마다 협상하면 비효율적이기 때문이다 |
| 네트워크 이용료(assessments) | 카드 네트워크 | 거래액 비율 + 건당 수수료로 은행들이 네트워크에 낸다 |
| 연회비·이자 | 발급사 | 카드 소지자가 발급사에 낸다 |

발급사가 교환 수수료를 가장 크게 받는 이유는 위험과 비용을 지기 때문이다.

- 카드 소지자가 갚지 못해도 발급사는 가맹점에 지급한다(신용 위험).
- 카드 소지자가 갚기 전에 먼저 지급한다(자금 부담).
- 계정 관리, 명세서, 부정 거래 탐지, 청산·정산 운영 비용이 든다.

교환 수수료율은 카드 종류, 가맹점 업종·규모, 국가 규제에 따라 다르다. 구체적인 요율은 수시로 바뀌므로 각 네트워크와 감독 당국의 공시를 확인한다.

## 토큰 결제: Apple Pay와 Google Pay

간편결제는 **실제 카드 번호(PAN)를 가맹점에 넘기지 않고 대체 값(토큰)을 쓴다.** 토큰이 유출돼도 다른 곳에서 쓸 수 없다. 두 서비스는 토큰을 어디에 두느냐가 다르다.

| 단계 | Apple Pay | Google Pay |
| --- | --- | --- |
| 카드 등록 | Apple은 카드 정보를 저장하지 않고 카드 네트워크·발급사에 넘긴다. 발급된 **기기 계정 번호(DAN, Device Account Number)** 토큰을 기기의 보안 칩(Secure Element)에 저장한다 | 카드 정보를 Google 서버에 저장하고, 기기에는 결제 토큰을 내려 준다. 매장 결제용으로는 네트워크 토큰을 쓴다 |
| 결제 | 기기가 DAN과 거래마다 바뀌는 암호값(cryptogram)을 가맹점에 보내고, 가맹점은 이를 매입사·네트워크로 보낸다 | 가맹점이 받은 결제 토큰을 Google·네트워크가 해석해 실제 카드로 결제한다 |
| 결과 | 카드 번호가 Apple 서버와 가맹점 어디에도 남지 않는다 | 카드 정보가 Google 서버에 있으므로 Google이 중개자 역할을 한다 |

둘 다 생체 인증으로 결제를 허락하고, 거래마다 일회용 암호값을 붙여 재사용을 막는다.

## QR 결제

QR 결제는 **누가 QR을 보여 주는가**와 **QR이 고정인가 매번 만들어지는가** 두 축으로 나뉜다.

| | 정적 QR(static) | 동적 QR(dynamic) |
| --- | --- | --- |
| **고객 제시형(consumer-presented)**: 고객이 QR을 보여 주고 가맹점이 스캔 | 고객 계정 식별 정보만 담는다. 가맹점이 고객 계정에서 **직접 출금(direct debit)** 한다 | 앱이 몇 초마다 새로 만든다. 일회용이라 캡처해도 재사용할 수 없다 |
| **가맹점 제시형(merchant-presented)**: 가맹점이 QR을 보여 주고 고객이 스캔 | 가게에 붙여 둔 QR. 계좌 정보만 담고 금액은 고객이 입력한다. 고객이 **직접 이체(direct credit)** 한다 | 계산대에서 주문마다 만든다. 금액·주문 번호·거래 유형까지 담는다 |

### 「스캔해서 결제」 흐름 (가맹점 제시형 + 동적 QR)

```text
[QR 생성] 1초 이내
  계산대: 합계 확정, 주문 ID 생성 → "결제" 클릭
  가맹점 서버 → PSP: 주문 ID + 금액
  PSP: DB에 저장, QR 코드 URL 생성 → 결제 게이트웨이 → 가맹점 → 계산대 화면에 QR 표시

[결제]
  고객 지갑 앱: QR 스캔 → 금액 확인 → "결제"
  지갑 앱 → PSP: 이 QR을 결제했다
  PSP 결제 게이트웨이: QR을 "결제됨"으로 표시 → 지갑 앱에 성공 응답
  PSP → 가맹점: 결제 완료 통지
```

QR 하나가 주문 하나에 묶이므로 PSP는 **같은 QR이 두 번 결제되지 않게** 상태를 확인한다. [[payment-system|결제 시스템]]의 멱등성과 같은 문제다.

## 정리

- 카드 결제는 즉시 일어나는 **승인**과 나중에 묶음으로 일어나는 **매입·청산·정산**으로 나뉜다.
- 카드 네트워크는 수많은 발급사·매입사 사이의 일대일 정산을 대신하고 수수료를 받는다.
- 가맹점 수수료는 매입사 마진, 교환 수수료(발급사), 네트워크 이용료로 나뉜다. 발급사 몫이 큰 것은 신용 위험과 자금 부담을 지기 때문이다.
- 간편결제는 카드 번호 대신 토큰과 일회용 암호값을 쓴다. Apple Pay는 기기에, Google Pay는 서버에 카드 정보를 둔다.
- QR 결제는 "누가 보여 주나 × 정적·동적" 네 가지이고, 동적 QR은 주문 단위 일회용이라 안전하다.

관련 노트: [[payment-system|결제 시스템 설계]], [[money-movement|자금 이동: 청산과 결제]], [[payment-address-forms|결제·주소 폼]], [[security|정보 시스템 보안(공격 기법과 암호)]]
