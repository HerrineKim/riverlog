---
title: "Vue와 Vuex로 만든 영화 SPA"
concept: "Vue SPA"
summary: "Vue Router로 페이지를 나누고 Vuex 스토어에 TMDB 영화 데이터를 모아, 영화 목록·랜덤 추천·보고 싶은 영화 목록을 구현한 첫 SPA 프로젝트."
tags: ["vue", "vuex", "javascript", "spa", "project"]
source: til
---

pjt10은 관통 프로젝트의 마지막 단계로, 서버가 HTML을 그려 주던 방식에서 벗어나 **Vue로 만든 SPA(Single Page Application)** 를 구성했습니다. 하나의 HTML 위에서 라우터가 화면만 바꿔 끼우고, 데이터는 Vuex 스토어 한 곳에 모아 여러 컴포넌트가 함께 씁니다. 역시 짝과 Live Share로 페이지를 번갈아 구현했습니다.

## 화면 구성

| 경로 | 컴포넌트 | 기능 |
| --- | --- | --- |
| `/` | `HomeView` | TMDB 인기 영화 카드 목록 |
| `/random-view` | `RandomView` | 버튼을 누르면 영화 한 편을 무작위 추천 |
| `/watch-list` | `WatchListView` | 보고 싶은 영화를 직접 추가하는 목록 |

![홈 화면](/images/til/My-Projects/SSAFY/pjt10/README.assets/image-20220515211251042.png)

## 데이터 흐름: Vuex

```text
컴포넌트 created()
   └─ dispatch('fetchMovieCards')        ← actions: axios로 TMDB API 호출 (비동기)
          └─ commit('SET_MOVIE_CARDS')   ← mutations: state 변경 (동기)
                 └─ state.movieCards      → mapState로 여러 컴포넌트에서 읽기
```

```javascript
// store/index.js (Vue 2 + Vuex 3 기준, 구조 요약)
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

- **actions**는 API 호출 같은 비동기 작업, **mutations**만 state를 직접 바꾼다는 역할 분리가 핵심이다.
- 한 번 state에 담아 두면 Home에서도 Random에서도 API를 다시 부르지 않고 꺼내 쓸 수 있다.
- API 키는 `.env.local`의 `VUE_APP_` 접두 환경 변수로 분리하고 저장소에는 올리지 않는다.

## 구현 과정

### Home

1. `App.vue`에 `<router-link>`로 Home / Random / WatchList 메뉴를 만든다.
2. `HomeView`의 `created`에서 action을 dispatch해 영화 목록을 불러온다.
3. `computed`에서 `mapState(['movieCards'])`로 목록을 가져오고, `v-for`로 `MovieCard` 컴포넌트를 반복하며 영화 하나씩 **props**로 내려준다.
4. `MovieCard`는 props로 받은 포스터·제목·줄거리를 카드 형태로 그리기만 한다.

```vue
<!-- HomeView.vue -->
<template>
  <div class="row">
    <movie-card v-for="movie in movieCards" :key="movie.id" :movie="movie" />
  </div>
</template>
```

### Random

1. `computed`에서 `mapState`로 같은 `movieCards`를 가져온다.
2. `v-on:click`(`@click`) 버튼에 무작위 선택 메서드를 연결한다.
3. 뽑힌 영화의 제목과 포스터 경로를 `data`에 저장하고, `<img>`와 `<h2>`에 바인딩한다.

```javascript
methods: {
  pickRandom() {
    const index = Math.floor(Math.random() * this.movieCards.length)
    const movie = this.movieCards[index]
    this.title = movie.title
    this.posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  },
},
```

### Watch List

입력창에서 영화 제목을 추가하고 목록으로 보여줍니다. 직접 추가한 데이터도 스토어에 두면 페이지를 오가도 유지됩니다.

## 배운 점

- 같은 영화 서비스를 Django 템플릿(서버 렌더링)과 Vue(클라이언트 렌더링)로 모두 만들어 보면서, 화면을 **누가 언제 그리는지**의 차이를 체감했다.
- 컴포넌트를 잘게 나누고 props로 내려 주면, 카드 하나의 모양만 고쳐도 전체 목록에 반영된다.
- 상태를 한 곳(스토어)에 모으는 이유를 직접 느꼈다. 여러 화면이 같은 데이터를 쓰기 시작하면 props로만 전달하기는 금방 복잡해진다.

> 참고: 현재 Vue 3 공식 상태 관리 라이브러리는 Vuex 대신 **Pinia**이며, mutations 없이 actions에서 state를 직접 바꿀 수 있습니다.
