---
title: "Vuex 상태 관리"
concept: "Vuex"
summary: "여러 컴포넌트가 함께 쓰는 데이터를 스토어 한 곳에 모으고, actions와 mutations로 역할을 나눠 변경하는 Vue 2의 상태 관리 방식."
tags: ["frontend", "vue", "javascript", "spa"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/238", "https://riverkim.kr/243"]
---

Vuex는 Vue의 **중앙 집중식 상태 관리** 라이브러리다. 여러 컴포넌트가 같은 데이터를 쓰기 시작하면 props로 내려주고 이벤트로 올리는 방식은 금방 복잡해진다. 그래서 공유 데이터를 스토어 한 곳에 두고 모든 컴포넌트가 거기서 읽는다.

> 이 노트의 예시는 Vue 2 + Vuex 3 기준이다. Vue 2는 2023년 12월 31일 지원이 종료(EOL)되었다([Vue 2 LTS 안내](https://v2.vuejs.org/lts/)). 현재 Vue 3의 공식 상태 관리 라이브러리는 Vuex 대신 **Pinia**이며, mutations 없이 actions에서 state를 직접 바꿀 수 있다. 개념(단방향 데이터 흐름, 한 곳에 모으기)은 그대로 통한다.

## 구성 요소

| 요소 | 역할 | 규칙 |
| --- | --- | --- |
| state | 공유 데이터 | 컴포넌트에서 직접 바꾸지 않는다 |
| mutations | state를 바꾸는 유일한 방법 | **동기** 함수. `commit`으로 호출 |
| actions | API 호출 같은 비동기 작업 | 결과를 mutations에 `commit`. `dispatch`로 호출 |
| getters | state에서 계산한 값 (computed와 비슷) | 읽기 전용 |

## 데이터 흐름

```text
컴포넌트 created()
   └─ dispatch('fetchMovieCards')        ← actions: axios로 API 호출 (비동기)
          └─ commit('SET_MOVIE_CARDS')   ← mutations: state 변경 (동기)
                 └─ state.movieCards      → mapState로 여러 컴포넌트에서 읽기
```

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    movieCards: [],
  },
  mutations: {
    SET_MOVIE_CARDS(state, movies) {
      state.movieCards = movies
    },
  },
  actions: {
    fetchMovieCards({ commit }) {
      axios.get('https://api.themoviedb.org/3/movie/top_rated', {
        params: { api_key: process.env.VUE_APP_TMDB_KEY, language: 'ko-KR' },
      }).then((res) => commit('SET_MOVIE_CARDS', res.data.results))
    },
  },
})
```

- 비동기는 actions, state 변경은 mutations로 **역할을 분리**하면 상태가 언제 어떻게 바뀌었는지 추적하기 쉽다.
- 한 번 state에 담아 두면 다른 화면에서 API를 다시 부르지 않고 꺼내 쓸 수 있다.
- API 키는 `.env.local`의 `VUE_APP_` 접두 환경 변수로 분리하고 저장소에는 올리지 않는다.

## 컴포넌트에서 쓰기

`mapState`로 스토어의 state를 `computed`에 연결하고, 목록은 `v-for`로 자식 컴포넌트에 props로 내려준다.

```vue
<!-- HomeView.vue -->
<template>
  <div class="row">
    <movie-card v-for="movie in movieCards" :key="movie.id" :movie="movie" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: { ...mapState(['movieCards']) },
  created() { this.$store.dispatch('fetchMovieCards') },
}
</script>
```

- 부모는 스토어에서 읽어 `props`로 내리고, `MovieCard`처럼 자식은 받은 값을 그리기만 한다. 컴포넌트를 잘게 나누면 카드 하나의 모양만 고쳐도 목록 전체에 반영된다.
- 사용자가 직접 추가하는 데이터(보고 싶은 영화 목록 등)도 스토어에 두면 라우터로 페이지를 오가도 유지된다.

## state 변화에 반응하기: computed, watch, subscribe

스토어 값이 바뀌었을 때 화면을 갱신하거나 부수 작업을 하려면 세 가지 방법이 있다. 위에서부터 먼저 고려한다.

| 방법 | 쓸 때 |
| --- | --- |
| `computed` + `mapState`/`mapGetters` | 스토어 값을 화면에 보여 주거나 다른 값으로 계산할 때. 반응성을 따라 자동으로 다시 그린다 |
| `watch` | 값이 바뀔 때 API 호출, 라우팅 같은 부수 작업을 할 때 |
| `$store.subscribe` | 특정 **mutation이 일어난 사건** 자체에 반응해야 할 때(로깅, 영속화 플러그인 등) |

`mapGetters`로 가져온 값도 `computed` 속성이므로, **같은 이름으로 `watch`** 하면 된다.

```js
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['isLogin']),
  },
  watch: {
    isLogin(newVal, oldVal) {
      if (!newVal) this.$router.push('/login')
    },
  },
}
```

`subscribe`는 모든 mutation마다 호출되고 `mutation.type`과 `mutation.payload`를 받는다.

```js
created() {
  this.unsubscribe = this.$store.subscribe((mutation, state) => {
    if (mutation.type === 'SET_CART' && mutation.payload.length === 0) {
      this.showEmptyBanner = true
    }
  })
},
beforeDestroy() {
  this.unsubscribe() // 구독 해제. 안 하면 컴포넌트가 사라져도 콜백이 남는다
},
```

Nuxt 2에서 `layouts/`의 컴포넌트가 스토어 변경을 반영하지 않는 것처럼 보일 때, `subscribe`로 mutation을 감시해 로컬 데이터를 바꾸는 식으로 급히 해결할 수 있다. 하지만 이 방법은 스토어 상태를 컴포넌트 데이터로 **복사**하는 것이라 코드가 복잡해지고 둘이 어긋나기 쉽다. 스토어 값을 `data`에 한 번 복사해 두면 이후 변경은 반영되지 않는다. `computed`로 스토어를 직접 읽게 바꾸면 Vue의 반응성과 생명주기를 따라 자연스럽게 갱신되므로, 이쪽이 더 간단하고 읽기도 좋다.

## 정리

- 여러 컴포넌트가 같은 데이터를 쓰면 props 전달 대신 스토어에 모은다.
- 비동기 → actions(`dispatch`), 동기 변경 → mutations(`commit`), 읽기 → `mapState`/getters.
- 스토어 변화에 반응할 때는 `computed` → `watch` → `subscribe` 순으로 고려한다. 스토어 값을 `data`에 복사하지 않는다.
- 새 프로젝트라면 Vue 3 + Pinia를 쓴다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[ajax|AJAX와 HTTP 요청]], [[quasar|Quasar 프레임워크 기초]], [[redux|Redux와 react-redux]]
