---
title: "Quasar 프레임워크 기초"
concept: "Quasar"
summary: "Vue 3 기반 UI 프레임워크 Quasar의 q- 컴포넌트와 유틸리티 클래스, 레이아웃·페이지 구조와 중첩 라우팅, 플러그인으로 쓰는 기능(Dialog), 폼 검증 라이브러리 연동을 정리한다."
tags: ["vue", "frontend", "layout", "design"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/47", "https://riverkim.kr/45", "https://riverkim.kr/63"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다. Quasar 공식 [영상 튜토리얼](https://quasar.dev/video-tutorials)(TODO 앱 만들기)과 공식 문서를 바탕으로 2022년(Quasar 2, Vue 3) 기준으로 썼습니다.

**Quasar**는 Vue.js 기반 프레임워크다. 머티리얼 디자인 스타일의 UI 컴포넌트를 많이 제공해서 화면을 빠르게 만들 수 있고, 같은 코드로 SPA·SSR·PWA·모바일 앱(Capacitor/Cordova)·데스크톱 앱(Electron)까지 빌드할 수 있다. CSS 프레임워크처럼 쓰면서도 레이아웃·라우팅 구조까지 정해 주는 점이 특징이다.

## 문법 규칙

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 | 모두 `q-`로 시작한다 | `<q-btn>`, `<q-list>`, `<q-drawer>` |
| 유틸리티 CSS 클래스 | 기존 CSS 개념 앞에 `q-`를 붙인 축약형 | `q-pa-sm`: 사방(a)에 작은(sm) padding(p) |
| 반응형 | `breakpoint`(px)보다 화면이 좁아지면 모바일 모드로 바뀐다 | Drawer의 `breakpoint` 속성 |

간격 클래스는 `q-{p|m}{a|x|y|t|r|b|l}-{none|xs|sm|md|lg|xl}` 형태다. `q-mt-md`는 위쪽 margin 중간 크기다.

## 레이아웃과 페이지

Quasar 앱은 **레이아웃**(헤더·사이드 메뉴 같은 틀)과 그 안에 바뀌어 들어가는 **페이지**로 나뉜다. Vue Router의 중첩 라우트(nested routes)를 그대로 쓴다.

```text
<q-layout>                  ← src/layouts/MainLayout.vue
  ├─ <q-header>             ← 상단 바
  ├─ <q-drawer>             ← 햄버거 버튼으로 여닫는 사이드 메뉴(Layout Drawer)
  └─ <q-page-container>
       └─ <router-view />   ← 자식 라우트의 페이지가 들어가는 자리
            └─ <q-page>     ← src/pages/*.vue 의 최상위
```

```vue
<!-- src/layouts/MainLayout.vue -->
<template>
  <q-layout view="hHh lpR fFf">
    <q-header>...</q-header>
    <q-drawer v-model="drawerOpen" :breakpoint="767">...</q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
```

```js
// src/router/routes.js
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/TodoPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
  },
]
```

- 페이지 컴포넌트는 반드시 `<q-page>`로 감싸고, 레이아웃 안의 `<q-page-container>` 안에 들어가야 높이 계산이 맞는다.
- 페이지를 오갈 때 입력 중이던 상태를 유지하려면 `<router-view>`를 `<keep-alive>`로 감싼다(Vue 3에서는 `<router-view v-slot="{ Component }"><keep-alive><component :is="Component" /></keep-alive></router-view>` 형태).

## 자주 쓰는 컴포넌트

| 컴포넌트 | 용도 | 메모 |
| --- | --- | --- |
| `q-list` + `q-item` | 목록과 항목 | `q-item-section`으로 왼쪽 체크박스·아바타, 가운데 텍스트를 나눈다 |
| `q-item clickable` | 클릭 가능한 항목 | `clickable`을 줘야 클릭 효과(ripple)와 이벤트가 붙는다 |
| `q-drawer` | 사이드 메뉴 | `v-model`로 열림 상태 제어 |
| `q-btn`, `q-input`, `q-checkbox` | 기본 입력 | `rules` 속성으로 간단한 검증 가능 |

## 플러그인으로 쓰는 기능

Dialog, Notify, Loading처럼 컴포넌트 밖에서 호출하는 기능은 **플러그인**이라 따로 등록해야 한다.

1. `quasar.config.js`의 `framework.plugins`에 추가한다.

   ```js
   framework: {
     plugins: ['Dialog', 'Notify'],
   }
   ```

2. 컴포넌트에서 `useQuasar()`로 꺼내 호출한다.

   ```js
   import { useQuasar } from 'quasar'

   const $q = useQuasar()
   function deleteTask(index) {
     $q.dialog({
       title: '삭제',
       message: '정말 삭제할까요?',
       cancel: true,
       persistent: true,
     }).onOk(() => tasks.value.splice(index, 1))
   }
   ```

## 개발 환경 메모

- **ESLint**: Quasar CLI로 프로젝트를 만들 때 ESLint를 함께 고를 수 있고, 나중에 따로 추가해도 된다. 따로 설정할 때는 `.eslintrc.js`의 `extends`에 `plugin:vue/vue3-essential`, `eslint:recommended`, `@vue/eslint-config-prettier`를 넣었다. 설정 절차는 [ESLint와 Prettier](/knowledge/dictionary/frontend/react/tooling) 참고. Quasar 공식 문서의 [VS Code 설정](https://quasar.dev/start/vs-code-configuration)에 권장 `settings.json`이 있다.
- **폼 검증**: 간단한 검증은 `q-input`의 `rules`로 충분하다. 복잡한 폼은 VeeValidate 같은 검증 라이브러리와 연결하는데, VeeValidate 공식 문서의 [서드파티 UI 라이브러리 연동](https://vee-validate.logaretm.com/v3/guide/3rd-party-libraries.html) 가이드를 따른다(링크는 v3 문서).

## 정리

- Quasar = Vue 3 위의 UI 컴포넌트 + 빌드 대상(SPA·SSR·모바일·데스크톱)까지 묶은 프레임워크.
- 컴포넌트는 `q-`, 간격 클래스는 `q-{p|m}{방향}-{크기}`.
- 화면 구조는 `q-layout` → `q-page-container` → `router-view` → `q-page`.
- Dialog·Notify 같은 기능은 `quasar.config.js`에 플러그인으로 등록한 뒤 `useQuasar()`로 쓴다.

관련 노트: [[vuex|Vuex 상태 관리]], [[spa-csr-ssr|SPA와 CSR·SSR]]
