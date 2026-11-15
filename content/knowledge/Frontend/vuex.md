---
title: "Vue 상태 관리: Pinia(옛 Vuex)"
concept: "Pinia"
summary: "여러 컴포넌트가 함께 쓰는 데이터를 스토어 한 곳에 모으는 Vue의 상태 관리. 지금 공식 라이브러리는 Pinia이고, defineStore로 state·getters·actions를 정의한다. Vuex의 mutations/actions 구분은 사라졌다."
tags: ["frontend", "vue", "javascript", "spa", "state-management"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/238", "https://riverkim.kr/243", "https://pinia.vuejs.org/"]
---

> 직접 만든 Vue 실습 기록과 [Pinia 공식 문서](https://pinia.vuejs.org/)를 바탕으로 재구성한 노트다.

## 스토어가 필요한 이유

여러 컴포넌트가 같은 데이터를 쓰기 시작하면 props로 내리고 이벤트로 올리는 방식은 금방 엉킨다. **공유 데이터를 스토어 한 곳에 두고 모든 컴포넌트가 거기서 읽는다.** 한 번 담아 둔 데이터는 라우터로 페이지를 오가도 남아 있어서, 다른 화면에서 API를 다시 부를 필요가 없다.

Vue 3의 공식 상태 관리 라이브러리는 **Pinia**다. Vuex는 유지보수 모드로 들어갔고 새 기능이 추가되지 않는다.

## 구성 요소

| 요소 | 역할 | Vue 컴포넌트에 빗대면 |
| --- | --- | --- |
| state | 공유 데이터 | `data` |
| getters | state에서 계산한 읽기 전용 값 | `computed` |
| actions | 동기·비동기 변경 로직. state를 직접 바꾼다 | `methods` |

과거에는(Vuex) state 변경은 동기 함수 mutations(`commit`)로만, 비동기 작업은 actions(`dispatch`)로 나눠야 했다. Pinia에는 mutations가 없고 actions 안에서 `this.x = ...`로 바로 바꾼다. 변경 추적은 Vue Devtools가 맡는다.

## 스토어 정의: defineStore

`defineStore`의 첫 인자는 앱 전체에서 유일한 id다. 반환값은 `use...Store` 이름의 함수로 내보내는 것이 관례다.

### 옵션 스토어

```javascript
// stores/movies.js
import { defineStore } from 'pinia'

export const useMovieStore = defineStore('movies', {
  state: () => ({ movieCards: [], loading: false }),
  getters: {
    count: (state) => state.movieCards.length,
  },
  actions: {
    async fetchMovieCards() {
      this.loading = true
      const res = await fetch(`/api/movies/top-rated`)
      this.movieCards = await res.json()
      this.loading = false
    },
  },
})
```

### 셋업 스토어

Composition API 문법 그대로 쓴다. `ref` → state, `computed` → getters, 함수 → actions이고, **반환한 것만** 스토어에 노출된다.

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMovieStore = defineStore('movies', () => {
  const movieCards = ref([])
  const count = computed(() => movieCards.value.length)

  async function fetchMovieCards() {
    const res = await fetch('/api/movies/top-rated')
    movieCards.value = await res.json()
  }

  return { movieCards, count, fetchMovieCards }
})
```

| 비교 | 옵션 스토어 | 셋업 스토어 |
| --- | --- | --- |
| 문법 | Options API와 비슷 | Composition API와 같음 |
| `$reset()` | 기본 제공 | 직접 구현 |
| 다른 컴포저블·`watch` 사용 | 어렵다 | 자유롭다 |

앱에는 한 번 등록한다: `createApp(App).use(createPinia()).mount('#app')`.

## 컴포넌트에서 쓰기

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useMovieStore } from '@/stores/movies'
import MovieCard from './MovieCard.vue'

const store = useMovieStore()
const { movieCards, count } = storeToRefs(store) // 구조 분해해도 반응성 유지
store.fetchMovieCards()                           // actions는 그대로 꺼내 써도 된다
</script>

<template>
  <p>{{ count }}편</p>
  <MovieCard v-for="movie in movieCards" :key="movie.id" :movie="movie" />
</template>
```

- 스토어를 `const { movieCards } = store`로 바로 구조 분해하면 반응성이 끊긴다. state·getters는 `storeToRefs`로 꺼낸다.
- 부모가 스토어에서 읽어 props로 내리고, `MovieCard` 같은 자식은 받은 값을 그리기만 하면 카드 모양을 고칠 때 한 곳만 바꾸면 된다.
- 여러 값을 한 번에 바꿀 때는 `store.$patch({ ... })`를 쓴다.

## state 변화에 반응하기

| 방법 | 쓸 때 |
| --- | --- |
| `storeToRefs` / `computed` | 화면에 보여 주거나 다른 값으로 계산할 때. 반응성으로 자동 갱신 |
| `watch` | 값이 바뀔 때 API 호출, 라우팅 같은 부수 작업을 할 때 |
| `store.$subscribe` | 스토어 변경 자체에 반응할 때(로깅, localStorage 영속화 등) |

```javascript
const auth = useAuthStore()
const { isLogin } = storeToRefs(auth)

watch(isLogin, (now) => {
  if (!now) router.push('/login')
})

auth.$subscribe((mutation, state) => {
  localStorage.setItem('auth', JSON.stringify(state))
}) // 컴포넌트가 사라지면 자동으로 구독이 해제된다
```

**스토어 값을 컴포넌트의 로컬 state에 복사하지 않는다.** 복사한 순간부터 이후 변경이 반영되지 않아 둘이 어긋난다. 항상 스토어를 직접 읽는다.

## 환경 변수

스토어에서 쓰는 API 키 같은 값은 `.env.local`에 두고, Vite 기반 Vue 프로젝트에서는 `VITE_` 접두사를 붙여 `import.meta.env`로 읽는다(과거 Vue CLI는 `VUE_APP_`와 `process.env`). 도구별 접두사와 내장 변수, 흔한 실수는 [[tooling#환경 변수|React 빌드 환경 직접 구성하기]]에 모았다.

## 정리

- 여러 컴포넌트가 같은 데이터를 쓰면 props 전달 대신 스토어에 모은다.
- 새 Vue 프로젝트는 Pinia를 쓴다. `defineStore`로 state·getters·actions를 정의하고, actions에서 state를 직접 바꾼다.
- 구조 분해는 `storeToRefs`로 한다. 스토어 값을 로컬 state로 복사하지 않는다.
- 스토어 변화에는 `computed` → `watch` → `$subscribe` 순으로 고려한다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[ajax|AJAX와 HTTP 요청]], [[quasar|Quasar 프레임워크 기초]], [[redux|Redux와 react-redux]]
