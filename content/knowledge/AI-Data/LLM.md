---
title: "LLM"
concept: "LLM"
summary: "다음 토큰 예측의 원리, 행동의 흔들림, 보안 공격, 서빙 병목, 로컬 실행, 검색 증강, 프롬프트."
tags: ["ai","llm","prompt"]
source: mixed
date: "2026-11-26"
---

LLM 노트는 모델이 다음 토큰을 예측하는 방식에서 시작해, 답이 날마다 달라지는 이유, 탈옥과 인젝션, 서빙 병목, 로컬 실행, 검색 증강, 프롬프트를 짜는 법으로 이어진다.

## 하위 노트

- [LLM은 무엇을 하고 왜 작동하나](AI-Data/LLM/how-llm-works.md): 다음 토큰 예측과 온도, 파일 두 개와 손실 압축, 환각과 역전 저주, 임베딩, 트랜스포머 내부 구조, 사전·사후 학습, 스케일링 법칙, 계산 환원 불가능성과 시스템 2·자기 개선·도구로 넘는 법
- [LLM 보안 공격: 탈옥, 프롬프트 인젝션, 데이터 중독](AI-Data/LLM/llm-security-attacks.md): 역할극·Base64·최적화된 접미사 탈옥, 숨은 글씨·검색 결과·공유 문서로 데이터 빼내기, 250개 문서로 심는 백도어, 고양이와 쥐 게임
- [LLM 서빙의 병목: KV 캐시, 배치, GPU](AI-Data/LLM/llm-serving-at-scale.md): 어텐션 비용과 KV 캐시, 산술 강도와 배치 크기, 속이는 GPU 사용률, GPU를 따라가는 배치와 오토스케일 불가, PagedAttention·연속 배치·프롬프트 캐싱
- [시스템 프롬프트 설계 패턴](AI-Data/LLM/system-prompt-patterns.md): 정체성 → 거절 → 출력 형식 → 환경·도구의 골격, 유출된 제품 프롬프트에서 보이는 설계 패턴과 보안 교훈
- [프롬프트 작성법 치트시트](AI-Data/LLM/prompt-cheat-sheet.md): 목표·맥락·과제·제약·형식·예시 7칸, 이유 붙이기·금지 대신 할 일 같은 원칙, 어조·문체·형식 목록과 제약 템플릿, 제로샷·퓨샷·생각의 사슬·자기 성찰 기법
- [LLM 동작은 왜 날마다 다른가](AI-Data/LLM/llm-behavior-variability.md): 가중치 위의 층, MoE·배치 잡음, 2025년 인프라 버그 세 건, seed 없는 결정성, CLI와 SDK의 시스템 프롬프트 차이, 카나리
- [검색 증강 생성(RAG): 구성, 검색 품질, 답이 틀릴 때 진단](AI-Data/LLM/retrieval-augmented-generation.md): 롱 컨텍스트와 RAG 고르기, 청크·임베딩·벡터 검색, BM25 하이브리드·맥락 붙인 청크·리랭킹, 라우터, 엉뚱한 답의 진단 순서
- [로컬 LLM 실행과 선택 기준](AI-Data/LLM/local-llm.md): 로컬 실행의 이유, 양자화·GGUF와 메모리 어림셈, llama.cpp·Ollama·LM Studio·MLX, 로컬과 프런티어 모델의 분업
- [예측형 AI와 생성형 AI](AI-Data/LLM/predictive-vs-generative-ai.md): 출력 공간과 모델 차이, 이탈 예측·글쓰기 도우미로 본 두 개발 루프, 흔한 함정과 대응
