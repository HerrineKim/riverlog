---
title: "논문 읽기와 구현: 고르고, 여러 번 나눠 읽고, 재현할 수 있게 공개하기"
concept: "Paper Reading"
summary: "머신 러닝 논문은 목록을 만들어 병렬로 훑고 일부만 깊게 읽는다. 한 편은 제목·초록·그림 → 도입·결론 → 본문 순으로 여러 번 나눠 읽고 네 가지 질문으로 이해를 점검한다. 구현은 수식을 코드로 옮기는 반복 작업이 되지 않게 저자의 의도와 실패를 상상하며 하고, 공개할 때는 의존성·학습 코드·평가 코드·사전 학습 모델·결과 표와 재현 명령의 다섯 가지를 갖춘다."
tags: ["ai", "machine-learning", "deep-learning", "research", "learning"]
source: other
date: "2026-10-31"
sources: ["https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/%EB%85%BC%EB%AC%B8-%EC%9D%BD%EA%B8%B0", "https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/%EB%85%BC%EB%AC%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0", "https://media-ai.tistory.com/7", "https://carpedm20.github.io/2018/paper-implementation/", "https://github.com/paperswithcode/releasing-research-code", "https://github.com/kweonwooj/papers/issues"]
---

> 「I want to study Data Science」 위키의 「[논문 읽기](https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/%EB%85%BC%EB%AC%B8-%EC%9D%BD%EA%B8%B0)」, 「[논문 구현하기](https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/%EB%85%BC%EB%AC%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0)」 페이지와 데이터 사이언티스트 로드맵의 논문 정리 항목을 바탕으로, 앤드류 응의 Stanford CS230 강의를 정리한 「[논문 읽기와 ML/DL 커리어 경력에 대한 조언](https://media-ai.tistory.com/7)」, 「[딥러닝 논문 구현에 대한 생각](https://carpedm20.github.io/2018/paper-implementation/)」, Papers with Code의 「[Tips for releasing research code in Machine Learning](https://github.com/paperswithcode/releasing-research-code)」, 「[kweonwooj/papers](https://github.com/kweonwooj/papers/issues)」의 정리 방식을 더해 재구성한 노트다.

## 왜 논문인가

머신 러닝·딥러닝은 2년 전 최고 결과가 금세 낡는 분야라 교재보다 논문이 앞선다. 새 주제를 익히려면 논문을 읽어야 하고, 데이터 사이언티스트·리서치 엔지니어 채용에서는 **논문을 읽고 구현하는 능력**을 직접 본다. 직군별 요구 역량은 [[data-job-roles|데이터 직군]]에 있다.

## 어떤 논문을 읽나

1. **읽을 목록을 만든다.** 블로그든 저장소든 한곳에 모은다.
2. **병렬로 훑고 취사선택한다.** 한 번에 한 편만 끝까지 읽지 않는다. 목록의 여러 편을 10~20%씩 읽으면 깊게 읽을 것과 치울 것이 갈린다.
3. 읽은 양에 따른 감각: 5~20편이면 ML 시스템을 적용할 지식은 있지만 최신 기술을 이해하기엔 부족하고, 50~100편이면 그 분야를 꽤 깊이 안다.

새 논문은 arXiv, 주요 학회(NeurIPS, ICML, ICLR, 분야별로 CVPR·ACL 등), 연구자들의 SNS, r/MachineLearning 같은 커뮤니티, Hugging Face의 Trending Papers에서 찾는다. 과거에는 Papers with Code가 논문·코드·리더보드를 묶어 보여 줬지만 2025년 7월 서비스를 종료했고 주소는 Hugging Face Papers로 넘어갔다. 영어 논문이 처음이라 막막하면 논문을 한 편씩 해설하는 리뷰 영상 시리즈(TensorFlow KR의 PR12 같은)로 시작한다.

## 한 편을 읽는 순서

처음부터 끝까지 한 번에 정독하지 않는다. **여러 번, 매번 다른 부분을 읽는다.**

| 회차 | 읽는 곳 | 얻는 것 |
| --- | --- | --- |
| 1 | 제목, 초록, 핵심 그림(아키텍처 도식, 실험 결과) | 기본 아이디어. 딥러닝 논문은 그림 한두 장에 요점이 담긴 경우가 많다 |
| 2 | 도입, 결론, 그림 다시 | 저자가 리뷰어에게 왜 이 논문이 실려야 하는지 공들여 요약한 부분이다. 관련 연구는 익숙하지 않은 분야가 아니면 건너뛴다 |
| 3 | 수식을 건너뛰며 본문 전체 | 전체 흐름 |
| 4 | 이해 안 되는 부분은 빼고 다시 | 위대한 연구일수록 이해의 경계를 넓히므로 처음엔 모르는 부분이 있는 게 정상이다. 완전히 마스터할 논문이 아니면 매달리지 않는다 |

다 읽고 나서 네 질문에 답할 수 있으면 이해한 것이다.

1. 저자가 이루려던 것은 무엇인가?
2. 접근법의 핵심 요소는 무엇인가?
3. 이 논문을 내가 쓸 수 있는가?
4. 더 찾아볼 참고 문헌은 무엇인가?

쉬운 최신 논문 한 편에 한 시간쯤, 여러 편이 얽히면 세 시간 이상 걸린다. 같은 형식을 반복해 읽을수록 빨라진다. 수학을 다 끝내고 논문을 읽겠다고 하면 지치기 쉬우니, 막히는 수학을 그때그때 공부한다. 무엇보다 **벼락치기보다 꾸준함**이 중요하다. 매주 두 편을 1년 동안 읽는 쪽이 낫다.

## 정리해 두기

읽은 논문은 블로그에 정리하거나, GitHub 저장소의 이슈 하나에 논문 하나를 적고 **태그를 붙여**(분야: NMT·CNN, 성격: Novel Idea·Empirical·SOTA, 상태: Let's Implement!·Implemented!) 관리하는 방식도 있다. 이슈 검색과 라벨 필터가 그대로 논문 목록의 검색 기능이 된다. 정리 습관 자체는 [[tech-blogging|개발자 기술 블로그]]와 같다.

## 구현하기

알고리즘을 진짜 이해하려면 **수식을 손으로 써 보고 밑바닥부터 코드로 구현한다.** 순서는 공개된 구현을 내려받아 돌려 보기 → 직접 구현하기다.

- 구현 자체는 문장과 수식을 코드로 옮기는 일이라, 익숙해지면 생각 없이 하는 반복 작업이 된다. 논문은 연구자를 성장시킨 **실패의 과정을 생략하고 정답만** 보여 준다. 많이, 빨리 구현하는 것보다 **논문에 드러나지 않은 저자의 의도를 파악하고 정답에 이르기까지의 실패를 상상하는 것**이 더 중요하다.
- 비슷한 논문만 계속 구현하면 배우는 것이 줄어든다. 다른 분야의 더 복잡한 논문으로 넓힌다.
- 구현체가 아직 없는 최신 논문을 먼저 구현해 공개하면 좋은 포트폴리오가 된다.
- 지금은 PyTorch로 구현하는 것이 기본이다. 공개된 사전 학습 가중치와 비교해 숫자를 맞춰 보면 구현의 정확성을 확인할 수 있다.

## 재현할 수 있게 공개하기

공개 코드는 아래 다섯 가지를 갖출수록 다른 사람이 믿고 이어 쓴다. NeurIPS 2019 공식 저장소를 분석해 보니 다섯 가지를 모두 갖춘 저장소의 GitHub 스타가 가장 많았다(중앙값 196). 이 체크리스트는 NeurIPS 2020부터 공식 권고가 됐다.

| 항목 | 갖출 것 |
| --- | --- |
| **1. 의존성 명세** | `requirements.txt`(pip), `environment.yml`(conda), 라이브러리면 패키지 설정 파일. README에 설치 방법을 배경지식이 없는 사람 기준으로 쓴다. 환경 전체를 고정하려면 Docker 이미지 |
| **2. 학습 코드** | 논문의 주요 결과를 얻는 학습 스크립트. 하이퍼파라미터와 쓴 트릭을 모두 담고, 문서화된 진입점(`train.py`)을 둔다. 다른 데이터셋에도 쓸 수 있게 만든다 |
| **3. 평가 코드** | 평가와 실험은 논문에 다 적지 못한 미묘한 세부에 좌우되므로 실제로 쓴 평가 코드(`eval.py`)를 공개한다 |
| **4. 사전 학습 모델** | 처음부터 학습하지 않고도 결과를 확인하고, 하위 작업에 미세 조정할 수 있게 한다. Hugging Face Hub, Zenodo, GitHub Releases 같은 곳에 올린다 |
| **5. README의 결과 표와 재현 명령** | 무엇을 기대할지 한눈에 보이게 결과 표를 넣고, 그 결과를 내는 정확한 명령을 함께 적는다 |

Kaggle 솔루션이나 개인 프로젝트를 공개할 때도 같은 원칙이 통한다. 결과 표와 재현 명령을 앞에 두는 README 구성은 [[data-job-roles#포트폴리오|데이터 직군의 포트폴리오]]에 있다.

## 정리

- 논문은 목록을 만들어 병렬로 훑고, 일부만 깊게 읽는다. 매주 두 편처럼 꾸준히 읽는다.
- 한 편은 제목·초록·그림 → 도입·결론 → 본문 순으로 여러 번 나눠 읽고, 네 질문으로 이해를 점검한다.
- 구현은 저자의 의도와 실패를 상상하며 하고, 비슷한 논문만 반복하지 않는다.
- 공개 코드는 의존성·학습·평가·사전 학습 모델·결과 표와 재현 명령의 다섯 가지를 갖춘다.

관련 노트: [[data-job-roles|데이터 직군]], [[deep-learning-intuition|딥러닝 직관으로 이해하기]], [[machine-learning-basics|머신 러닝 기초]], [[tech-blogging|개발자 기술 블로그]]
