---
title: "에이전트"
concept: "Agents"
summary: "코딩 에이전트의 루프, 멀티 에이전트, MCP, 스펙과 신뢰 환경, 개인 하네스와 LLM 위키."
tags: ["ai","agent","mcp"]
source: mixed
date: "2026-11-26"
---

에이전트 노트는 모델이 도구를 골라 일을 끝내는 구조를 다룬다. 에이전트 루프, 여러 에이전트의 역할 분담, MCP, 스펙과 신뢰할 수 있는 환경, 개인용 하네스와 LLM이 관리하는 위키가 여기 있다.

## 하위 노트

- [바이브 코딩에서 에이전틱 엔지니어링으로](AI-Data/Agents/agentic-engineering.md): Software 3.0, 검증 가능성과 들쭉날쭉한 지능, 바이브 코딩 대 에이전틱 엔지니어링, 사람이 맡는 판단·이해, 에이전트 네이티브 인프라
- [Claude API 고급 도구 사용: 코드로 호출하기·도구 검색·예시](AI-Data/Agents/claude-advanced-tool-use.md): Programmatic Tool Calling, Dynamic Filtering, Tool Search, Tool Use Examples, Claude Code의 MCP 도구 검색
- [내 일을 줄이는 하네스 만들기](AI-Data/Agents/personal-agent-harness.md): 결과물이 아니라 생성 장치를 만드는 순서, PLAN/PROGRESS·참고 자료 캐시, 서브에이전트 분할, cron + claude -p 이슈 파이프라인, 병목의 이동
- [LLM 위키: LLM이 쓰고 관리하는 지식 창고](AI-Data/Agents/llm-wiki.md): RAG 대신 원문을 미리 종합해 쌓는 위키, 원문·위키·스키마 세 층, 입수·질의·점검, index·log 파일, 유사도 검색이 관계형 질문에 약한 이유
- [에이전트를 믿을 수 있는 환경 만들기](AI-Data/Agents/agent-trust-environment.md): 신뢰가 병렬화를 막는 이유, 검증 스킬(CLI + 기능 지도), 교정을 넣는 다섯 층, 번지는 나쁜 패턴과 복제되는 주석, 에이전트 친화 프레임워크와 정원사
- [멀티 에이전트](AI-Data/Agents/multi-agent.md): 여러 AI가 역할을 나눠 일하는 구조, 작동 흐름·구성 요소·주의점, 주요 프레임워크
- [MCP의 구조와 CLI와의 선택 기준](AI-Data/Agents/model-context-protocol.md): 호스트·클라이언트·서버, 도구·리소스·프롬프트, stdio·Streamable HTTP·OAuth, 무상태 개정, 도구 정의의 맥락 비용, CLI+스킬과 MCP 중 고르는 기준
- [AI 에이전트를 위한 스펙 작성법](AI-Data/Agents/agent-spec-writing.md): 목표·비목표·합격 기준, 여섯 핵심 영역, 항상/먼저 묻기/절대 금지 경계, 지시의 저주와 나눠 싣기, 검증을 넣은 살아 있는 스펙
- [코딩 에이전트의 작동 원리: 에이전트 루프](AI-Data/Agents/coding-agent-loop.md): 모델 호출·도구 호출·관찰 루프, 매 회차 다시 쌓는 프롬프트, 앞부분을 고정해 캐시 살리기, 압축, 샌드박스와 승인 정책
