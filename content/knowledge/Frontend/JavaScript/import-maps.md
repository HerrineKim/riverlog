---
title: "임포트 맵과 번들러 없는 npm 임포트"
concept: "Import Maps"
summary: "임포트 맵은 브라우저가 import 'vue' 같은 패키지 이름(bare specifier)을 URL로 바꾸게 하는 JSON 표다. imports·접두사 매핑·scopes·integrity 문법, 모듈보다 먼저 와야 하고 인라인만 되는 규칙, 여러 맵 병합, 외부 임포트 맵을 흉내 내는 주입 스크립트, JSPM·Nudeps로 npm 의존성을 번들러 없이 쓰는 방법, CDN 방식의 한계, Node.js의 패키지 맵을 정리한다."
tags: ["javascript", "frontend", "browser", "build", "tooling"]
source: other
date: "2026-11-25"
sources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap", "https://lea.verou.me/blog/2026/web-deps/", "https://lea.verou.me/blog/2026/external-import-maps-today/", "https://github.com/nudeps/nudeps", "https://nodejs.org/api/packages.html", "https://caniuse.com/wf-import-maps-multiple"]
---

> Lea Verou의 「[Web dependencies are broken. Can we fix them?](https://lea.verou.me/blog/2026/web-deps/)」(2026.01), 「[External import maps, today!](https://lea.verou.me/blog/2026/external-import-maps-today/)」(2026.03)와 [Nudeps](https://github.com/nudeps/nudeps)를 바탕으로, 문법은 MDN 「[importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)」, 패키지 맵은 Node.js 공식 문서로 확인해 재구성한 노트다.

## 임포트 맵이란

브라우저의 ES 모듈은 `./utils.js`나 `https://…`처럼 **경로나 URL**만 해석한다. `import { createApp } from 'vue'`의 `'vue'` 같은 **패키지 이름(bare specifier)** 은 어디서 가져올지 알 수 없어 오류가 난다([[es-modules|모듈: export와 import]]). Node.js는 `node_modules`를 거슬러 올라가며 찾고, 번들러는 빌드 때 그 경로를 코드에 박아 넣는다.

**임포트 맵(import map)** 은 이 해석을 브라우저에 맡기는 표준이다. `<script type="importmap">` 안의 JSON이 「이 이름은 이 URL」을 정하고, 문서 안의 모든 `import`·`import()`가 그 표를 따른다. 2023년 3월부터 주요 브라우저에서 모두 동작한다(Baseline 널리 사용 가능).

패키지 이름이 필요한 이유는 코드를 파일 위치·버전·환경에서 떼어 놓기 위해서다. 특히 **의존성의 의존성**은 자기가 가져올 패키지를 이름으로만 안다. 경로를 직접 적는 방식은 내 코드에서는 되지만 전이 의존성에서 무너진다.

## 문법

```html
<script type="importmap">
{
  "imports": {
    "vue": "/vendor/vue@3.5.0/vue.esm-browser.prod.js",
    "lodash-es/": "/vendor/lodash-es@4.17.21/"
  },
  "scopes": {
    "/legacy/": { "vue": "/vendor/vue@2.7.16/vue.esm.browser.js" }
  },
  "integrity": {
    "/vendor/vue@3.5.0/vue.esm-browser.prod.js": "sha384-…"
  }
}
</script>
<script type="module">
  import { createApp } from 'vue'
  import debounce from 'lodash-es/debounce.js'
</script>
```

| 키 | 하는 일 | 규칙 |
| --- | --- | --- |
| `imports` | 이름 → URL | 값은 절대 URL이거나 `/`, `./`, `../`로 시작한다. 여러 키가 맞으면 가장 구체적인(긴) 키가 이긴다 |
| `imports`의 `/`로 끝나는 키 | 접두사 매핑. `lodash-es/debounce.js` 같은 하위 경로를 한 줄로 연다 | 키가 `/`로 끝나면 값도 `/`로 끝나야 한다 |
| `scopes` | 가져오는 **쪽** 스크립트의 URL에 따라 다른 표를 쓴다. 한 페이지에 같은 패키지의 두 버전을 둘 때 쓴다 | 가장 구체적인 스코프부터 찾고, 없으면 덜 구체적인 스코프, 마지막에 `imports`로 내려간다 |
| `integrity` | 모듈 URL → 무결성 해시. 정적·동적 `import`로 가져오는 모듈에도 SRI를 건다 | `<script integrity>`와 같은 형식. 요청에 이미 integrity가 있으면 그쪽이 우선이다 |

### 지켜야 할 규칙

- **모듈보다 먼저 와야 한다.** 어떤 이름이 한 번 해석되면 뒤에 온 맵은 그 결과를 바꾸지 못한다.
- **인라인만 된다.** `<script type="importmap" src="…">`는 표준에 없다(명세에서 빠진 뒤 진척이 없다). 그래서 맵을 **페이지마다** HTML에 반복해 넣어야 한다.
- **문서의 모듈에만 적용된다.** `<script src>`, CSS `@import`, 워커·워클릿에서 불러오는 모듈에는 적용되지 않는다.
- **여러 맵은 하나로 합쳐진다.** 충돌하면 먼저 온 쪽이 이긴다. Chromium 133+와 Safari 18.4+가 지원하고, 그 전 브라우저는 맵을 하나만 받는다. Firefox 지원은 2026년 11월 기준 caniuse에서 확인한다. 못 쓰는 환경은 `es-module-shims` 폴리필로 채운다.

## 외부 임포트 맵 흉내 내기

맵을 파일 하나로 두고 모든 페이지가 공유하려면 **동기 클래식 스크립트로 맵을 DOM에 주입**한다. `type="module"`·`async`·`defer` 없이 `<head>`에 두면 모듈보다 먼저 실행되므로, 임포트 맵을 지원하는 모든 브라우저(Chrome 89, Safari 16.4, Firefox 108 이상)에서 동작한다.

```javascript
// importmap.js: <script src="/importmap.js"></script>로 <head>에 넣는다
(() => {
  const map = { imports: { vue: './vendor/vue.esm-browser.prod.js' }, scopes: {} }
  const current = document.currentScript
  if (!current?.src) throw new Error('클래식 스크립트로 불러와야 한다')
  const rebase = (m) => {
    for (const k in m) m[k] = new URL(m[k], current.src).href // 상대 경로를 이 파일 기준으로
    return m
  }
  rebase(map.imports)
  for (const s in map.scopes) rebase(map.scopes[s])
  current.after(Object.assign(document.createElement('script'), {
    type: 'importmap',
    textContent: JSON.stringify(map),
  }))
})()
```

인라인 맵의 상대 경로는 **페이지 URL** 기준으로 풀리므로, 주입 스크립트 자신의 URL 기준 절대 경로로 바꿔 넣는 것이 핵심이다. 모듈 스크립트 안에서는 `document.currentScript`가 `null`이라 이 방법을 쓸 수 없다.

## 번들러 없이 npm 의존성 쓰기

임포트 맵을 손으로 쓰면 전이 의존성까지 모두 적어야 한다. 그래서 `node_modules`의 의존성 그래프를 따라 맵을 생성하는 도구를 쓴다.

| 방식 | 하는 일 | 한계 |
| --- | --- | --- |
| **Nudeps** | `npx nudeps install`이 npm 훅을 걸어, 설치·삭제할 때마다 쓰는 패키지만 로컬 디렉터리로 복사하고 버전을 붙인 경로로 임포트 맵(`importmap.js`)을 다시 만든다. JSPM Generator로 그래프를 추적한다 | CommonJS 패키지는 자동 심(shim)이 들어가는 실험 기능이다 |
| **JSPM** | 같은 그래프 추적으로 맵을 만든다. 4.0부터 위의 주입 방식으로 외부 맵을 낸다 | - |
| CDN 직접 링크 | 맵 값을 CDN의 ESM URL로 둔다 | 제3자 서버가 장애 지점·공급망 위험이 되고, 브라우저 캐시가 사이트별로 나뉘어(double-keyed cache) 「다른 사이트가 이미 받아 둔 파일」이라는 이점도 사라졌다. 쓴다면 버전을 고정하고 `integrity`를 건다 |
| `node_modules` 경로 직접 import | 가장 단순하다 | 전이 의존성이 이름으로 가져오는 순간 깨지고, 내부 디렉터리 구조가 노출된다 |

```html
<!-- Nudeps: 모듈보다 먼저 클래식 스크립트로 -->
<script src="/importmap.js"></script>
<script type="module">
  import { format } from 'date-fns' // npm install한 패키지를 이름으로
</script>
```

### 언제 번들러를 빼나

| 번들러 없이 충분하다 | 번들러가 낫다 |
| --- | --- |
| 정적 사이트, 사내 도구, 프로토타입, 의존성이 몇 개인 페이지 | JSX·TypeScript·Vue SFC처럼 변환이 필요한 소스 |
| 모듈 단위 캐시 무효화가 오히려 유리한 자주 바뀌는 앱 | 수백 개 모듈을 한 번에 받는 큰 앱(요청 수, 트리 셰이킹, 코드 스플리팅) |
| 빌드 단계 없이 HTML만 배포하고 싶을 때 | CSS·이미지 import, 환경 변수 주입 같은 빌드 기능을 쓸 때 |

번들러가 해 주는 일 전체는 [[bundlers-and-vite|번들러의 역사와 Vite]]에 있다. 브라우저 안에서 번들과 임포트 맵을 조합한 실제 구조는 [[in-browser-preview-runtime|브라우저 안 빌드·프리뷰 환경]]에 있다.

## Node.js의 패키지 맵

Node.js 26.4는 같은 발상을 서버 쪽에 들인 **패키지 맵(package maps)** 을 실험 기능으로 넣었다. `node_modules`를 뒤지는 대신 정적 JSON 표로 패키지 이름을 해석한다.

```bash
node --experimental-package-map=./package-map.json app.js
```

```json
{
  "packages": {
    "app": { "url": "./packages/app", "dependencies": { "@myorg/utils": "utils" } },
    "utils": { "url": "./packages/utils" }
  }
}
```

| 임포트 맵(브라우저) | 패키지 맵(Node.js) |
| --- | --- |
| 이름 → URL. 가져오는 쪽에 따라 바꾸려면 `scopes` | 패키지마다 `dependencies`에 「이 이름은 이 패키지 ID」를 적는다. 선언하지 않은 이름은 `MODULE_NOT_FOUND` |
| 문서 하나에 전역으로 적용 | 각 패키지가 선언한 의존성만 보이므로 **유령 의존성**(선언 안 했는데 호이스팅 덕에 되던 import)을 막는다 |
| 파일 위치와 무관 | `url`은 `file:`만 된다. 찾은 위치부터는 `exports` 같은 기존 해석을 그대로 탄다 |

상대·절대 경로와 `node:` 내장 모듈은 패키지 맵의 영향을 받지 않는다. 맵은 시작할 때 동기로 한 번 읽는 정적 파일이다. 유령 의존성이 생기는 이유는 [[package-managers|자바스크립트 패키지 매니저]]에 있다.

## 정리

- 임포트 맵은 bare specifier를 URL로 바꾸는 브라우저 표준이고, 모듈보다 먼저 인라인으로 와야 한다.
- 외부 파일은 표준에 없으니 동기 클래식 스크립트로 맵을 주입해 페이지 간에 공유한다.
- npm 의존성은 Nudeps·JSPM처럼 의존성 그래프에서 맵을 생성하는 도구로 관리하고, CDN을 쓰면 버전 고정과 `integrity`를 건다.
- 변환이 필요 없는 작은 앱은 번들러 없이 충분하고, 큰 앱의 요청 수와 최적화는 여전히 번들러 몫이다.
- Node.js 26.4의 패키지 맵은 같은 발상으로 `node_modules` 탐색을 정적 표로 바꾸고 유령 의존성을 막는다(실험 기능).

관련 노트: [[es-modules|모듈: export와 import, export default]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[in-browser-preview-runtime|브라우저 안 빌드·프리뷰 환경]], [[package-managers|자바스크립트 패키지 매니저: npm, yarn, pnpm]], [[micro-frontends|마이크로 프론트엔드: 도입 기준, 통합 방식, 트레이드오프]]
