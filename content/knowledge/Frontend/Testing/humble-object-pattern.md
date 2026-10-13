---
title: "험블 객체 패턴: 테스트하기 쉬운 코드가 좋은 코드인 이유"
concept: "Humble Object"
summary: "목은 비용에 따라 네트워크 목·전역 목·스파이·더미/스텁 네 단계로 나뉘고, 비싼 목이 많다는 것은 설계 문제의 신호다. 전역 객체·네트워크처럼 테스트하기 어려운 코드를 얇은 험블 객체로 떼어 내 인터페이스 뒤에 두면 나머지는 더미와 스텁만으로 테스트되고, 코드는 자연스럽게 SOLID에 가까워진다."
tags: ["testing", "frontend", "architecture", "typescript", "design-pattern"]
source: other
date: "2026-10-13"
sources: ["https://d2.naver.com/helloworld/9921217"]
---

> 서동유의 「[테스트는 어떻게 좋은 코드를 만드는가(feat. 험블 객체 패턴)](https://d2.naver.com/helloworld/9921217)」(NAVER D2, 2025.03)를 바탕으로 재구성한 노트입니다.

## 테스트가 갈수록 고통스러워지는 이유

처음에는 테스트가 순조롭다. 그러다 `localStorage`, `window`, `fetch` 같은 **전역 객체나 외부 자원**을 만나면 막힌다. 테스트 프레임워크가 전역 객체를 갈아 끼우는 기능을 주기 때문에 그 자리에서는 쉽게 넘어간다. 그런데 이런 목이 쌓이면 테스트 한 줄마다 그보다 긴 목 초기화 코드가 붙고, 테스트 데이터 하나를 바꾸려고 먼 폴더의 JSON을 고치게 된다.

원인은 대개 프론트엔드나 TDD가 아니라 **설계를 고민하지 않은 것**이다. 그 신호가 가장 먼저 드러나는 곳이 목이다.

## 목의 비용 피라미드

목은 비용에 따라 네 단계로 나뉜다. 위로 갈수록 작성이 오래 걸리고, 초기화·복원이 필요하고, 상태를 추적하기 어렵다.

```text
        ▲ 비싸다
  ┌─────────────────┐
  │ 1. 네트워크 목    │  목 서버·테스트 DB를 띄운다. 테스트 밖의 코드를 고쳐야 한다
  ├─────────────────┤
  │ 2. 전역 목       │  window·localStorage·싱글턴·모듈(vi.mock/jest.mock)을 덮어쓴다.
  │                 │  테스트 전후 초기화·복원이 필요하다
  ├─────────────────┤
  │ 3. 스파이        │  기존 메서드를 감싸 호출을 기록한다. 전역을 감싸면 역시 복원이 필요하다
  ├─────────────────┤
  │ 4. 더미·스텁     │  테스트 안에서 바로 만드는 가짜 객체·데이터. 복원이 필요 없다
  └─────────────────┘
        ▼ 싸다
```

E2E·통합 테스트에는 위쪽 목이 필요하다. 하지만 수가 가장 많은 단위 테스트에서 비싼 목을 반복하면 피로와 기술 부채가 쌓인다. 테스트가 깨지기 쉬우니 설계를 바꾸기 어렵고, 설계를 못 바꾸니 다시 비싼 목을 쓰는 악순환이 생긴다.

**고수준 목은 그 자체로 코드 스멜이다.** `vi.mock`, `beforeEach`·`afterAll`의 복원 코드, `toHaveBeenCalled` 단언이 많을수록 프로그램 코드의 설계를 의심한다. 테스트 대역의 종류는 [[frontend-test-types|프론트엔드 테스트의 종류와 도구]]에 정리했다.

## 험블 객체 패턴

**험블 객체 패턴(Humble Object Pattern)은 테스트하기 어려운 부분을 최대한 얇은 객체로 떼어 내고, 테스트하기 쉬운 로직은 나머지에 남기는 설계다.** 떼어 낸 객체는 로직이 거의 없어 「겸손하다(humble)」.

### 전

```ts
class MyClass {
  save(value: number) {
    const data = `${value}점`          // 비즈니스 로직: 저장 형식
    localStorage.setItem('score', data) // 입출력: 저장 수단
  }
}
// 테스트하려면 localStorage를 전역 목으로 갈아 끼우고 복원해야 한다
```

### 후

```ts
interface Repository {
  save(key: string, data: string): void
}

class StorageRepo implements Repository {     // 험블 객체: 입출력만
  save(key: string, data: string) {
    localStorage.setItem(key, data)
  }
}

class MyClass {
  constructor(private repo: Repository) {}
  save(value: number) {
    this.repo.save('score', `${value}점`)      // 로직만 남는다
  }
}

// 테스트: 전역 목 없이 스텁 하나로 끝난다
const saved: string[] = []
new MyClass({ save: (_, d) => saved.push(d) }).save(90)
expect(saved).toEqual(['90점'])
```

이제 `MyClass`의 테스트는 `MyClass`가 바뀔 때만 깨진다. 저장소가 localStorage든 IndexedDB든 서버 API든 `MyClass`의 관심사가 아니다. 모든 전역 API를 감싸라는 뜻은 아니다. **분리할 코드가 복잡하고 여러 곳에서 쓰일수록** 효과가 크다.

험블 객체 자체는 여전히 전역 객체를 쓰므로 비싼 목이나 통합·E2E 테스트로 검증한다. 다만 테스트하기 어려운 코드가 **몇 개의 얇은 객체에 모였기 때문에** 그 비용을 한 번만 치르면 된다.

## 테스트하기 쉬운 코드는 거의 SOLID하다

험블 객체를 떼어 내면 SOLID 원칙의 대부분이 따라온다.

| 원칙 | 험블 객체 패턴에서 드러나는 모습 |
| --- | --- |
| 단일 책임(SRP) | 「변경 이유가 하나」다. 저장 형식은 기획이 바꾸고(`MyClass`), 저장 수단은 개발자가 바꾼다(`StorageRepo`). 바꾸길 원하는 사람이 다르면 책임이 다르다 |
| 개방·폐쇄(OCP) | `Repository`를 구현한 새 객체(IndexedDB, fetch)를 넣으면 `MyClass`를 고치지 않고 확장된다 |
| 리스코프 치환(LSP) | 같은 인터페이스의 구현은 서로 바꿔 끼워도 프로그램이 깨지지 않아야 한다. 더미를 단순하게 유지하면 인터페이스가 공통 행위만 담는다 |
| 인터페이스 분리(ISP) | 다른 클래스가 같은 험블 객체에 새 메서드를 원하면 기존 인터페이스를 늘리지 말고 새 인터페이스를 만든다. 늘리면 기존 더미를 쓰는 테스트가 모두 깨진다 |
| 의존 역전(DIP) | `MyClass`와 `StorageRepo`가 모두 `Repository`에 의존한다. 제어는 `MyClass`에서 `StorageRepo`로 흐르지만 의존은 인터페이스를 향한다 |

각 원칙의 자세한 설명은 [[frontend-solid|프론트엔드와 SOLID 원칙]]에 있다. 로버트 C. 마틴은 『클린 아키텍처』에서 이 패턴이 **테스트하기 쉬운 부분과 어려운 부분 사이에 아키텍처 경계를 정의한다**고 설명한다.

## 프론트엔드에서 자주 떼어 내는 것

| 테스트하기 어려운 것 | 험블 객체의 예 |
| --- | --- |
| 저장소 (`localStorage`, IndexedDB, 쿠키) | 저장소 리포지토리 |
| 네트워크 (`fetch`, SDK) | API 클라이언트. 통합 테스트에서는 MSW로 가로챈다 |
| 시간·난수 (`Date.now`, `Math.random`) | 시계·난수 공급자를 인자로 받는다 |
| 브라우저 API (`IntersectionObserver`, `matchMedia`, 위치) | 얇은 훅이나 어댑터 |
| 렌더링 | 로직은 훅·순수 함수로, 컴포넌트는 결과를 그리기만 한다 |

## 정리

- 목에는 비용 단계가 있다. 네트워크 > 전역 > 스파이 > 더미·스텁.
- 단위 테스트에 비싼 목이 많다면 **설계 문제의 신호**다.
- 테스트하기 어려운 입출력을 얇은 험블 객체로 떼어 인터페이스 뒤에 두면, 나머지 로직은 스텁만으로 테스트된다.
- 그 결과 코드는 SRP·OCP·DIP를 자연스럽게 따른다. **테스트하기 좋은 코드가 좋은 코드다.**

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[frontend-solid|프론트엔드와 SOLID 원칙]], [[separation-of-concerns|프론트엔드에서 관심사의 분리]], [[tdd|프론트엔드에서의 TDD]]
