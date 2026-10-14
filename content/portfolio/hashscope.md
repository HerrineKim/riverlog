---
kind: "project"
company: "HashScope"
companyEn: "2025 HashKey Chain Hackathon"
role: "디자인 · 프론트엔드"
period: "2025.03.28 – 03.30"
start: "2025-03"
end: "2025-03"
location: "서울 · 해커하우스 현장 개발"
summary: "HashKey Chain 해커톤에서 이틀 반 동안 만든 토큰 기반 API 플랫폼. HSK를 예치하면 API 키를 받고, 호출한 만큼 온체인에서 차감됩니다. 2인 팀에서 디자인과 프론트엔드 전부를 맡았습니다."
about: "HashKey Chain이 서울에서 연 해커톤(2025 Hackathon Taiyi Seoul)입니다. 모든 프로젝트는 행사 현장에서 새로 개발해야 했습니다."
stack: ["Next.js", "Tailwind CSS", "shadcn/ui", "MetaMask", "Figma", "FastAPI", "Solidity"]
highlights:
  - { value: "2.5일", label: "기획부터 배포까지" }
  - { value: "2인", label: "PM·백엔드 1명 + 디자인·프론트엔드 1명" }
  - { value: "47개", label: "전체 96개 중 제 커밋" }
cover: "portfolio/hashscope/hs-home.png"
---

AI 에이전트가 쓸 수 있는 실시간 데이터(암호화폐 시세, 김치 프리미엄, 파생상품 지표, 소셜 트렌드)를 표준 API와 MCP로 제공하고, 사용료는 HSK 토큰으로 정산하는 플랫폼입니다. 팀원이 백엔드와 스마트 컨트랙트를, 제가 Figma 디자인과 웹 프론트엔드를 맡았습니다.

- **데모**: [hashscope.vercel.app](https://hashscope.vercel.app/)
- **저장소**: [HashkeyHSK/2025-Hackathon-Taiyi-Seoul](https://github.com/HashkeyHSK/2025-Hackathon-Taiyi-Seoul/pull/2)

## 지갑 로그인과 온체인 예치

> MetaMask로 로그인하고, HSK를 컨트랙트에 예치하면 잔액이 상단 바에 바로 반영됩니다.

- 첫날 프로젝트 세팅과 함께 MetaMask 서명 로그인을 붙였습니다. 백엔드가 지갑 서명을 검증해 JWT를 내려 줍니다.
- 예치(Deposit) 화면에서 HSK를 컨트랙트로 보내는 트랜잭션을 구현했습니다. 체인 ID와 예치 주소를 맞추느라 실제 전송을 여러 번 돌려 봤어요.
- 상단 바에 지갑 주소와 컨트랙트 잔액을 표시해, API를 쓸 때마다 줄어드는 잔액을 바로 확인할 수 있게 했습니다.

## API 탐색과 사용량 대시보드

> 인기 API 둘러보기, 검색, API 키 발급, 사용량 확인까지 플랫폼 화면 전체

- 홈, Hot(인기 API), 검색(페이지네이션), 요금 등급, 프로필, API 키(Secret) 발급·삭제, 사용량 화면을 하루 만에 만들었습니다.
- 백엔드가 준비되기 전에는 목 API로 화면을 먼저 만들고, API가 나오는 대로 Hot·검색·사용량 화면을 실제 데이터로 하나씩 바꿨습니다. 마지막에는 axios를 걷어내고 fetch로 통일했어요.
- 사이드바 구조와 로고, 카드 UI를 Figma에서 먼저 잡고 shadcn/ui 위에서 구현했습니다.

## 돌아보며

처음 다뤄 본 블록체인이었지만, 결국 프론트엔드가 할 일은 "사용자가 지금 무엇을 얼마나 쓰고 있는지"를 분명히 보여 주는 것이었습니다. 목 데이터로 화면을 먼저 세우고 백엔드와 동시에 달린 방식 덕분에 이틀 반 안에 실제 토큰이 오가는 데모까지 닿을 수 있었어요.
