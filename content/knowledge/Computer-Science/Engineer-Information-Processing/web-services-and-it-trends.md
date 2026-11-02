---
title: "웹 서비스·시스템 통합·신기술 용어 색인"
concept: "Web Services"
summary: "정보처리기사 단답형에 나오는 웹 서비스(SOAP·WSDL·UDDI), 시스템 통합(EAI 연계 유형), 데이터·네트워크 신기술 용어가 창고의 어느 개념 노트에 있는지 잇는 색인이다. 정의는 각 개념 노트에 둔다."
tags: ["certificate", "web-service", "xml", "big-data", "network"]
source: notion
date: "2026-11-02"
---

이 영역은 용어 정의를 묻는 단답형이 많다. 비슷한 기술은 "무엇을 대체했는가"로 묶어 구분한다. 정의와 비교표는 각 개념 노트 한 곳에만 두고, 이 노트는 시험 용어에서 그 노트로 가는 길만 잇는다.

## 웹 서비스

| 용어 | 한 줄 | 노트 |
| --- | --- | --- |
| SOAP, WSDL, UDDI | XML 메시지 규약, 서비스 명세, 등록 저장소. REST가 대체했다 | [[rest-api#REST 이전: SOAP\|REST API 설계]] |
| REST | 자원을 URI로, 동작을 HTTP 메서드로 나타내는 설계 방식 | [[rest-api\|REST API 설계]] |
| AJAX, XML·JSON 비동기 통신 | 페이지를 다시 그리지 않고 서버와 데이터를 주고받는 기법 | [[ajax\|AJAX와 HTTP 요청]] |

## 시스템 통합

| 용어 | 한 줄 | 노트 |
| --- | --- | --- |
| EAI (Enterprise Application Integration) | 기업 안의 서로 다른 플랫폼·애플리케이션을 연계하는 솔루션. Point to Point, Hub & Spoke, Message Bus(ESB), Hybrid 네 유형으로 나눈다 | [[microservices-architecture#SOA·ESB와 무엇이 다른가\|마이크로서비스 아키텍처]] |
| 메시지 큐, 브로커 | ESB 대신 메시지 전달만 맡는 가벼운 미들웨어 | [[message-queue-kafka\|메시지 큐와 Kafka]] |

## 데이터

| 용어 | 한 줄 | 노트 |
| --- | --- | --- |
| 데이터 마이닝 | 대량 데이터에서 규칙·패턴을 찾는 기법. 분류(모형으로 예측), 연관(함께 나타나는 항목, 장바구니 분석), 연속(연관 + 시간 순서), 군집화(사전 정보 없이 묶기)로 나눈다 | 지도·비지도 학습 구분은 [[machine-learning-basics\|머신 러닝 기초]] |
| 빅데이터, 하둡(Hadoop) | 기존 방식으로 처리하기 어려운 대량의 정형·비정형 데이터와, 범용 서버 여러 대로 분산 저장·병렬 처리하는 프레임워크 | [[distributed-data-processing\|분산 데이터 처리: MapReduce, Spark, SQL 엔진]] |
| 블록체인 | 거래 정보를 블록으로 연결해 P2P 참여자가 분산 저장·공동 관리하는 분산 원장 | [[money-movement#은행 지갑과 블록체인 지갑\|돈이 움직이는 구조]] |

## 네트워크

| 용어 | 한 줄 | 노트 |
| --- | --- | --- |
| 애드혹(Ad hoc) 네트워크 | 기지국·AP 없이 이동 단말만으로 구성하는 망. 토폴로지가 동적이라 재난·군사용에 쓴다 | [[wireless-network#망 구조\|무선 네트워크]] |
| BLE | 대기 중 절전하는 저전력 블루투스. 4.0부터 들어갔다 | [[wireless-network#근거리 무선(WPAN)\|무선 네트워크]] |
| SDN | 제어 평면을 장비에서 떼어 소프트웨어 컨트롤러로 모으고, 장비는 데이터 평면만 맡게 하는 네트워크 | [[network-layer#제어 평면과 데이터 평면, SDN\|네트워크 계층]] |
| 운영체제 계열(UNIX, Linux) | 커널·셸·파일 시스템 구조 | [[os-overview\|운영체제 개요]] |

관련 노트: [[rest-api|REST API 설계]], [[ajax|AJAX와 HTTP 요청]], [[network-basics|네트워크 기초]], [[microservices-architecture|마이크로서비스 아키텍처]]
