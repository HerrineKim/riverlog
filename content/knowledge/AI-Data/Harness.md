---
title: "에이전트 하네스"
concept: "Agent Harness"
summary: "프롬프트 대신 검증·루프·권한·비용을 갖춘 작업 환경. 가드레일, 위임, 이해 부채, 평가 주도 개발."
tags: ["ai","agent","harness"]
source: mixed
date: "2026-11-26"
---

하네스 노트는 프롬프트 한 장 대신, 검증과 루프와 권한과 비용을 갖춘 작업 환경을 어떻게 짜는지를 다룬다. 가드레일, 위임, 이해 부채, 토큰 비용, 평가 주도 개발이 여기 있다.

## 하위 노트

- [디자인 시스템을 아는 화면 생성 에이전트 설계하기](AI-Data/Harness/design-system-agent-harness.md): 구체화·검증·메모리 루프로 일관된 결과를 내는 에이전틱 코딩 하네스
- [AI 슬롭: 만드는 비용과 검토하는 비용의 비대칭](AI-Data/Harness/ai-slop.md): 슬롭의 정의, 생성·검토 비용의 비대칭, 우선순위 다섯 가지, 토큰맥싱, 검토 병목과의 균형
- [AI 코딩 실무 가드레일](AI-Data/Harness/ai-coding-guardrails.md): 규모별 세 가지 모드, CLAUDE.md·앵커 주석, 사람이 쓰는 테스트, AI가 건드리면 안 되는 영역
- [AI로 개발 가속하기: AI 네이티브 작업 방식과 규칙을 키우는 개발](AI-Data/Harness/ai-accelerated-development.md): AI부터 시도하고 검증하기, 도구 네 범주와 생명 주기별 활용, PRD → 태스크 리스트, 바이브 코딩의 현실적 패턴, Rule-Growing Development, AI가 찾기 쉬운 주석·이름, 작업 길이, 팀·윤리 규칙
- [AI에게 일 맡기기: 권한·정보·도구](AI-Data/Harness/ai-delegation-toolkit.md): 위임 단계와 모니터링, STICC와 인지 작업 분석(CTA), 되묻게 하기·불확실성 지도·메타 프롬프트, 템플릿, MCP 선별과 검증 장치, 계획까지 커밋하는 작업 흐름
- [루프 엔지니어링](AI-Data/Harness/loop-engineering.md): 자동화·워크트리·스킬·서브에이전트·상태 파일로 에이전트가 스스로 도는 루프 설계하기
- [프롬프트에서 하네스로: 에이전틱 패턴의 진화](AI-Data/Harness/harness-engineering.md): 프롬프트 → 컨텍스트 → 하네스 엔지니어링, 플로우 엔지니어링(AlphaCodium), Write/Select/Compress/Isolate와 KV 캐시, 하네스 네 사분면, 치명적 삼요소와 2의 규칙
- [이해 부채와 사고의 외주화](AI-Data/Harness/comprehension-debt.md): 이해 부채의 정의와 기술 부채와의 차이, 에이전트 실수의 네 유형, 리뷰 병목, 자동화 편향, 리뷰 의식·설명해 보기·소유 규칙
- [에이전트 토큰 비용 관리](AI-Data/Harness/token-efficiency.md): 토큰맥싱 안티패턴, 토큰이 새는 곳, 출력 거르기·필요한 부분만 읽기·맥락 비우기·캐시·모델 라우팅, 작업당 비용으로 재기
- [평가 주도 개발(EDD): AI 기능을 테스트하며 다듬기](AI-Data/Harness/evaluation-driven-development.md): AI용 TDD, 결정적·주관적 지표, 코드·사람·LLM 심판, 프롬프트 CI
