---
title: "Vuex 상태 관리"
concept: "Vuex"
summary: "여러 컴포넌트가 함께 쓰는 데이터를 스토어 한 곳에 모으고, actions와 mutations로 역할을 나눠 변경하는 Vue 2의 상태 관리 방식."
tags: ["frontend", "vue", "javascript", "spa"]
source: mixed
date: "2026-10-12"
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

## 정리

- 여러 컴포넌트가 같은 데이터를 쓰면 props 전달 대신 스토어에 모은다.
- 비동기 → actions(`dispatch`), 동기 변경 → mutations(`commit`), 읽기 → `mapState`/getters.
- 새 프로젝트라면 Vue 3 + Pinia를 쓴다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[ajax|AJAX와 HTTP 요청]]
