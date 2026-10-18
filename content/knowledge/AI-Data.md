---
title: "AI-Data"
concept: "AI & Data"
summary: "LLM·에이전트 도구(Claude Code, 스킬, 루프 엔지니어링)와 AI 활용법, 머신 러닝·딥러닝·강화 학습·자연어 처리의 기초 개념, 파이썬 데이터 분석·Jupyter 같은 데이터 도구에 관한 노트."
tags: ["data-science", "python", "analysis", "ai", "llm"]
source: notion
date: "2026-10-14"
---

AI와 데이터는 "데이터와 모델로 더 나은 결과를 만든다"는 목표를 공유하는 분야이다. 이 분야에는 Claude Code·스킬·루프 엔지니어링 같은 LLM 에이전트 도구와 프롬프트 설계, AI로 UI를 만드는 방법, 퍼셉트론·트리 앙상블·강화 학습·자연어 처리 같은 머신 러닝 기초 개념, 그리고 파이썬 데이터 분석 흐름과 표준 도구인 Jupyter Notebook을 정리했다.

## 하위 노트

- [파이썬 데이터 분석 프로세스](AI-Data/python-data-analysis.md): 데이터 수집 → 처리 → EDA·시각화 → 성능 개선
- [데이터의 위치 추정: 평균·절사평균·가중평균·중앙값](AI-Data/location-estimation.md): 이상치에 흔들리는 산술평균과 그 대안, 상황별 대푯값 고르기
- [newspaper로 기사 본문 추출하기](AI-Data/newspaper-article-scraping.md): 사이트별 파서 없이 기사 제목·본문·메타데이터 추출, newspaper4k, Source로 기사 URL 모으기, 설정과 한계
- [네이버 블로그 크롤링](AI-Data/naver-blog-crawling.md): 검색 API로 글 목록, PostView 주소로 iframe 속 본문 받기, 선택자 변경·예외 처리 함정
- [Jupyter Notebook](AI-Data/jupyter-notebook.md): 코드·문서·시각화를 한데 담는 "실행되는 문서"
- [문자열·문서 유사도: 편집 거리와 코사인 유사도](AI-Data/text-similarity.md): 오타에 강한 제목 검색(Jaro-Winkler)과 키워드 벡터 기반 영화 추천
- [머신 러닝 기초: 네 단계 추상화](AI-Data/machine-learning-basics.md): 데이터 → 모델 → 손실 → 최적화, 지도·비지도, 최소제곱법, 과적합·MLE·MAP·정규화
- [퍼셉트론과 다층 퍼셉트론](AI-Data/perceptron-mlp.md): 인공 뉴런·활성화 함수, 퍼셉트론 학습과 XOR 한계, MLP와 오류 역전파
- [결정 트리와 앙상블: 랜덤 포레스트와 부스팅](AI-Data/decision-tree-ensemble.md): 지니 불순도, 배깅과 부스팅 비교, 정형 데이터에 강한 트리 모델, 서버·엣지 배포
- [분류 모델 성능 평가 지표](AI-Data/classification-metrics.md): 혼동 행렬, 정밀도·재현율·정확도·F1, 객체 탐지의 IoU·PR 곡선·AP·mAP
- [불확실한 지식으로 추론하기: 베이지안 분류기와 퍼지 추론](AI-Data/bayesian-fuzzy-inference.md): 베이즈 정리·최소 오류/위험 분류기·나이브 베이즈, 퍼지 집합·관계·논리
- [강화 학습: 에이전트·MDP·가치 함수와 알고리즘 분류](AI-Data/reinforcement-learning.md): 상태·행동·보상, MDP, 리턴·Q 함수·벨만 방정식, 모델 기반/프리·가치/정책·온/오프 정책
- [자연어 처리 파이프라인: 전처리부터 언어 모델까지](AI-Data/nlp-pipeline.md): 말뭉치 → 토큰화·정규화·인코딩 → 언어 모델(n-gram → 트랜스포머 → LLM) → 평가
- [LLM은 무엇을 하고 왜 작동하나](AI-Data/how-llm-works.md): 다음 토큰 예측과 온도, 임베딩, 트랜스포머 내부 구조, 사전·사후 학습, 계산 환원 불가능성과 추론·도구로 넘는 법
- [시스템 프롬프트 설계 패턴](AI-Data/system-prompt-patterns.md): 정체성 → 거절 → 출력 형식 → 환경·도구의 골격, 유출된 제품 프롬프트에서 보이는 설계 패턴과 보안 교훈
- [프롬프트 작성법 치트시트](AI-Data/prompt-cheat-sheet.md): 목표·맥락·과제·제약·형식·예시 7칸, 이유 붙이기·금지 대신 할 일 같은 원칙, 어조·문체·형식 목록과 제약 템플릿, 제로샷·퓨샷·생각의 사슬·자기 성찰 기법
- [AI 모델로 완성도 높은 프론트엔드 디자인 뽑기](AI-Data/ai-frontend-design-prompting.md): 디자인 시스템·와이어프레임·스크린샷·무드보드로 보여 주고 기본 폰트·아이콘을 바꿔 템플릿 티를 없애는 프롬프트 기법
- [미드저니 프롬프트 파라미터](AI-Data/midjourney-prompt-parameters.md): --ar·--s·--c·--w·--sref·--sw·--p·--v의 뜻과 범위, 크리스마스 디자인용 프롬프트 예시
- [AI 이미지를 쓸모 있는 벡터로 바꾸기](AI-Data/ai-image-to-vector.md): Midjourney → 업스케일러 → Illustrator 이미지 추적 → 확장, 단계별 역할과 추적 설정
- [디자인 시스템을 아는 화면 생성 에이전트 설계하기](AI-Data/design-system-agent-harness.md): 구체화·검증·메모리 루프로 일관된 결과를 내는 에이전틱 코딩 하네스
- [Claude Code 활용 가이드](AI-Data/claude-code-guide.md): 설치, 슬래시 명령·단축키, MCP, Skills·CLAUDE.md, Claude Code에 맞는 프롬프트 습관, 개발 팀장처럼 위임하기
- [AI 코딩 실무 가드레일](AI-Data/ai-coding-guardrails.md): 규모별 세 가지 모드, CLAUDE.md·앵커 주석, 사람이 쓰는 테스트, AI가 건드리면 안 되는 영역
- [AI로 개발 가속하기: 규칙을 키우는 개발](AI-Data/ai-accelerated-development.md): 한 방 프롬프트와 도메인 지식 문서, PRD → 태스크 리스트, 바이브 코딩의 현실적 패턴, Rule-Growing Development, AI가 찾기 쉬운 주석·이름, AI가 맡을 수 있는 작업 길이
- [Claude 스킬 만들기 가이드](AI-Data/claude-skill-building-guide.md): 프로그레시브 디스클로저, description 작성, 테스트·배포, 팀 공용 스킬 패키지화, 실전 패턴 5가지
- [루프 엔지니어링](AI-Data/loop-engineering.md): 자동화·워크트리·스킬·서브에이전트·상태 파일로 에이전트가 스스로 도는 루프 설계하기
- [프롬프트에서 하네스로: 에이전틱 패턴의 진화](AI-Data/harness-engineering.md): 프롬프트 → 컨텍스트 → 하네스 엔지니어링, Write/Select/Compress/Isolate와 KV 캐시, 하네스 네 사분면, 치명적 삼요소와 2의 규칙
- [멀티 에이전트](AI-Data/multi-agent.md): 여러 AI가 역할을 나눠 일하는 구조, 작동 흐름·구성 요소·주의점, 주요 프레임워크
- [AI 네이티브 엔지니어의 작업 방식](AI-Data/ai-native-engineer.md): AI부터 시도하고 검증하기, 도입 단계, 도구 네 범주, 개발 생명 주기별 활용, 팀·윤리 규칙
- [AI 시대 개발자의 역할](AI-Data/ai-era-developer.md): LLM의 구조적 한계, 지시에서 위임으로, 하네스와 오라클, 맥락 보존, 갈라지는 역할과 길러야 할 역량
- [AI 네이티브 프론트엔드 개발](AI-Data/ai-native-frontend.md): 대화로 뽑은 리팩터링 스킬, 의도 정렬 순서, 이슈·PR 맥락 관리, 픽셀 diff·상태 재현 환경, BE·디자인을 정본으로 FE 얇게 만들기, 통합과 완성도로 옮겨 가는 역할
- [AI 기능 기획: 시스템 블루프린트와 유스케이스 발굴](AI-Data/ai-feature-blueprint.md): 기회·솔루션·거버넌스 블루프린트, 가치 5범주와 사용자 여정 매핑, 비용·실패 모드 추정, 프로토타입
- [예측형 AI와 생성형 AI](AI-Data/predictive-vs-generative-ai.md): 출력 공간과 모델 차이, 이탈 예측·글쓰기 도우미로 본 두 개발 루프, 흔한 함정과 대응
- [책임 있는 AI: 프라이버시·공정성·신뢰](AI-Data/responsible-ai-governance.md): 세 축을 데이터·지능·UX 층별로, PII 최소화, 편향 시험, 보정된 신뢰
- [웹 AI 플랫폼 고르기: 클라이언트, 서버, 하이브리드](AI-Data/web-ai-platform-choice.md): 내장 AI·커스텀 모델·관리형 API·자체 호스팅 비교, 요구 사항에서 고르기, 클라이언트 우선 하이브리드
- [클라이언트 사이드 웹 AI: 내장 AI API, 라이브러리, 런타임](AI-Data/client-side-web-ai.md): Chrome 내장 AI API 상태와 쓰는 순서, Transformers.js·WebLLM 등, Wasm·WebGPU·WebNN
- [평가 주도 개발(EDD): AI 기능을 테스트하며 다듬기](AI-Data/evaluation-driven-development.md): AI용 TDD, 결정적·주관적 지표, 코드·사람·LLM 심판, 프롬프트 CI
- [AI 기능의 UX 패턴: 배경형·제한형·개방형](AI-Data/ai-ux-patterns.md): 노출 단계별 예와 모범 사례, 배경형과 제한형 사이에서 고르기, 투명성·제어·신뢰 보정 패턴 표
