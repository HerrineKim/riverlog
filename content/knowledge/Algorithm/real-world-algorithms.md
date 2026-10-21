---
title: "현실 시스템을 움직이는 알고리즘과 자료구조"
concept: "Applied Algorithms"
summary: "일상 소프트웨어에서 자료구조가 쓰이는 곳(피드의 리스트, 실행 취소의 스택, 캐시의 해시 테이블, DOM의 트리, 지도 검색의 R-트리), 대규모 시스템 설계에 자주 나오는 알고리즘(일관된 해싱, 지오해시·쿼드트리, 블룸 필터, HyperLogLog, 토큰 버킷, 머클 트리, 합의 알고리즘), 세상을 움직이는 아홉 가지 알고리즘을 정리한다. 블룸 필터는 중복 URL 크롤링 방지 예로 자세히 본다."
tags: ["algorithm", "data-structure", "architecture", "scalability", "search"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/10-key-data-structures-we-use-every-day", "https://bytebytego.com/guides/algorithms-you-should-know-before-taking-system-design-interviews", "https://bytebytego.com/guides/the-9-algorithms-that-dominate-our-world", "https://bytebytego.com/guides/how-to-avoid-crawling-duplicate-urls-at-google-scale"]
---

> ByteByteGo의 System Design 101 가이드 「[10 Key Data Structures We Use Every Day](https://bytebytego.com/guides/10-key-data-structures-we-use-every-day)」, 「[Algorithms for System Design Interviews](https://bytebytego.com/guides/algorithms-you-should-know-before-taking-system-design-interviews)」, 「[The 9 Algorithms That Dominate Our World](https://bytebytego.com/guides/the-9-algorithms-that-dominate-our-world)」, 「[How to Avoid Crawling Duplicate URLs at Google Scale?](https://bytebytego.com/guides/how-to-avoid-crawling-duplicate-urls-at-google-scale)」를 바탕으로 재구성한 노트다.

## 이 노트의 관점

알고리즘 공부는 구현에 치우치기 쉽다. 시스템을 설계할 때는 **"이 알고리즘이 실제 시스템의 어느 문제를 푸는가"**를 아는 것이 구현 세부보다 중요하다. 이 노트는 자료구조와 알고리즘을 쓰임새 중심으로 묶는다.

## 일상 속 자료구조

| 자료구조 | 쓰이는 곳 | 왜 그것인가 |
| --- | --- | --- |
| 리스트 | SNS 피드 | 순서대로 이어 붙이고 훑는다 |
| 배열 | 수학 연산, 이미지 픽셀 | 인덱스로 즉시 접근, 메모리에 연속 배치 |
| 스택 | 편집기의 실행 취소·다시 실행 | 마지막에 한 것을 먼저 되돌린다([[stack\|스택]]) |
| 큐 | 프린터 작업, 게임의 사용자 입력 전송 | 들어온 순서대로 처리한다([[queue-deque\|큐와 덱]]) |
| 해시 테이블 | 캐시 시스템 | 키로 평균 O(1) 조회 |
| 힙 | 작업 스케줄링 | 우선순위가 가장 높은 것을 빨리 꺼낸다([[heap-priority-queue\|힙과 우선순위 큐]]) |
| 트리 | HTML 문서(DOM), AI의 결정 트리 | 계층 구조를 표현한다([[tree\|트리와 이진 탐색 트리]]) |
| 접미사 트리 | 문서 안 문자열 검색 | 모든 접미사를 미리 색인해 부분 문자열을 빠르게 찾는다 |
| 그래프 | 친구 관계, 길 찾기 | 관계와 연결을 표현한다([[graph-basics\|그래프의 기본]]) |
| R-트리 | 가까운 장소 찾기 | 공간을 겹치는 사각형으로 나눠 위치 범위 질의를 빠르게 한다 |
| 버텍스 버퍼 | GPU 렌더링 | 정점 데이터를 GPU 메모리에 한 번에 보낸다 |

기초 자료구조의 구현은 [[data-structures|기초 자료구조]]에 있다.

## 시스템 설계에 자주 나오는 알고리즘

| 알고리즘·자료구조 | 푸는 문제 | 쓰이는 곳 |
| --- | --- | --- |
| **일관된 해싱(Consistent Hashing)** | 노드가 늘거나 줄 때 다시 옮길 키를 최소화한다 | 분산 캐시, 샤딩, 로드 밸런서([[database-sharding\|데이터베이스 샤딩]]) |
| **지오해시(Geohash)·쿼드트리(Quadtree)** | 2차원 위치를 인덱싱해 "근처에 무엇이 있나"를 빨리 답한다 | 주변 가게 찾기, 차량 호출 |
| **블룸 필터(Bloom Filter)** | 원소가 집합에 "확실히 없다"를 적은 메모리로 판정한다 | 크롤러의 중복 URL, DB의 불필요한 디스크 읽기 줄이기 |
| HyperLogLog | 고유 원소 개수를 아주 적은 메모리로 근사한다 | 고유 방문자 수 집계([[redis\|Redis]]) |
| Count-Min Sketch | 스트림에서 원소별 빈도를 근사한다 | 실시간 인기 검색어, 상위 K개 |
| 토큰 버킷·누출 버킷 | 요청 속도를 제한한다 | API 속도 제한(rate limiting) |
| 트라이(Trie) | 접두사로 문자열을 찾는다 | 검색어 자동 완성([[data-structures\|기초 자료구조]]) |
| 머클 트리(Merkle Tree) | 두 데이터 집합에서 다른 부분만 빨리 찾는다 | 복제본 동기화, Git, 블록체인 |
| Raft·Paxos | 여러 노드가 하나의 값에 합의한다 | 리더 선출, 분산 설정 저장소(etcd, ZooKeeper) |
| 운영 변환(OT)·CRDT | 동시에 일어난 편집을 충돌 없이 합친다 | 공동 문서 편집 |
| 증분 동기화(rsync) | 바뀐 블록만 보내 파일을 맞춘다 | 파일 동기화·백업 |

이 중 일관된 해싱, 블룸 필터, 지오해시·쿼드트리처럼 여러 설계 문제에 반복해서 나오는 것을 먼저 이해한다. 합의 알고리즘이나 CRDT는 선임 수준에서 원리를 알아 두면 된다.

## 블룸 필터: 중복 URL 걸러 내기

웹 크롤러는 수십억 개의 URL 중 이미 본 것을 다시 넣지 않아야 한다. 선택지는 셋이다.

| 방법 | 장점 | 단점 |
| --- | --- | --- |
| 메모리의 집합(Set) | 빠르고 정확하다 | URL 전체를 저장해 메모리가 감당이 안 된다 |
| DB에 저장하고 조회 | 정확하다 | 조회마다 DB 부하가 크다 |
| **블룸 필터** | 비트 배열만 써서 메모리가 매우 적고 빠르다 | 가끔 "있다"고 잘못 답한다 |

```text
비트 배열(크기 m)     0 0 0 0 0 0 0 0 0 0 0 0
                     
추가: url1 → 해시 A, B, C → 위치 1, 5, 9를 1로
추가: url2 → 해시 A, B, C → 위치 3, 5, 11을 1로   (5는 겹친다)

조회: url3 → 해시 A, B, C → 위치 1, 3, 5
      세 칸 모두 1 → "아마 있다"   ← 실제로는 없다(거짓 양성)
조회: url4 → 위치 2, 5, 9
      2가 0 → "확실히 없다"
```

- **거짓 음성은 없고 거짓 양성만 있다.** "없다"는 답은 항상 맞다. 크롤러가 새 URL을 가끔 놓치는 것은 감수할 수 있으므로 잘 맞는다.
- 거짓 양성률은 비트 배열 크기, 해시 함수 개수, 넣은 원소 수로 정해진다. 기대 원소 수에 맞춰 크기를 미리 잡는다.
- 해시 함수는 고르게 퍼지고 빨라야 한다. 암호 해시 대신 MurmurHash, xxHash 같은 비암호 해시를 쓴다.
- 기본 블룸 필터는 원소를 지울 수 없다. 삭제가 필요하면 카운팅 블룸 필터나 쿠쿠 필터를 쓴다.

크롤러 전체 설계에서 블룸 필터가 놓이는 자리는 [[web-crawler-at-scale|대규모 웹 크롤러 설계]]에 있다.

## 세상을 움직이는 아홉 가지 알고리즘

검색 엔진, SNS, Wi-Fi, 휴대폰, 위성까지 일상 기술 밑에는 다음 알고리즘이 있다.

| 알고리즘 | 하는 일 | 쓰이는 곳 |
| --- | --- | --- |
| 정렬 | 데이터를 순서대로 놓는다 | 검색 결과, 데이터베이스, 거의 모든 곳([[merge-quick-sort\|병합 정렬과 퀵 정렬]]) |
| 다익스트라 | 그래프에서 최단 경로를 찾는다 | 지도 길 찾기, 네트워크 라우팅([[dijkstra\|다익스트라 최단 경로]]) |
| 트랜스포머 | 어텐션으로 시퀀스의 관계를 학습한다 | 대규모 언어 모델, 번역 |
| 링크 분석(PageRank) | 링크 구조로 페이지의 중요도를 매긴다 | 검색 순위 |
| RSA | 공개키로 암호화하고 개인키로 푼다 | HTTPS 키 교환·서명([[encoding-encryption-hashing\|인코딩·암호화·해시]]) |
| 정수 인수분해 | 큰 수를 소인수로 나눈다. **어렵다는 사실** 자체가 RSA의 안전 근거다 | 암호학 |
| 합성곱 신경망(CNN) | 이미지의 지역 패턴을 학습한다 | 이미지 인식, 얼굴 인식 |
| 허프만 부호화 | 자주 나오는 기호에 짧은 부호를 준다 | 압축(ZIP, JPEG, PNG의 일부 단계) |
| 보안 해시(SHA) | 임의 데이터를 고정 길이 지문으로 만든다 | 무결성 검사, 디지털 서명, Git, 블록체인 |

## 정리

- 자료구조는 쓰임새로 기억한다. 실행 취소는 스택, 캐시는 해시 테이블, 스케줄링은 힙, 위치 검색은 R-트리다.
- 대규모 시스템의 단골 알고리즘은 일관된 해싱, 지오해시·쿼드트리, 블룸 필터, 근사 집계(HyperLogLog, Count-Min Sketch), 속도 제한, 머클 트리, 합의다.
- 블룸 필터는 "확실히 없다"를 싸게 판정한다. 거짓 양성을 감수할 수 있는 곳에 쓴다.
- 설계에서는 구현보다 **어떤 문제를 어떤 대가로 푸는지**를 설명할 수 있어야 한다.

관련 노트: [[data-structures|기초 자료구조]], [[web-crawler-at-scale|대규모 웹 크롤러 설계]], [[database-sharding|데이터베이스 샤딩]], [[system-design-choices|시스템 설계의 선택지와 흔한 문제의 해법]], [[big-o|빅오 표기법과 시간 복잡도]]
