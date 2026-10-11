---
title: "DOM 조작"
concept: "DOM API"
summary: "JavaScript로 DOM 요소를 선택하고, 만들고, 붙이고, 지우고, 속성을 바꾸는 방법."
tags: ["javascript", "dom", "browser", "frontend"]
source: til
---

DOM 조작은 항상 **① 선택(select) → ② 변경(manipulation)** 두 단계다. 먼저 바꿀 요소를 찾고, 그 요소의 내용·속성·자식을 바꾼다. DOM의 개념과 노드 구조는 [DOM과 BOM](/knowledge/dictionary/frontend/web/dom) 노트에 있다.

## 선택

| 메서드 | 반환 |
| --- | --- |
| `document.querySelector(selector)` | CSS 선택자와 일치하는 **첫 번째** 요소(없으면 `null`) |
| `document.querySelectorAll(selector)` | 일치하는 모든 요소의 **NodeList**(static) |
| `document.getElementById(id)` | 단일 요소 |
| `document.getElementsByTagName(name)` | HTMLCollection(live) |
| `document.getElementsByClassName(names)` | HTMLCollection(live) |

`querySelector`/`querySelectorAll`은 id·class·태그·속성·결합자 등 **모든 CSS 선택자**를 쓸 수 있어 더 구체적이고 유연하므로 주로 이것을 쓴다.

```html
<h1>Hello</h1>
<h2 id="location-header">Location</h2>
<ul>
  <li class="location">서울</li>
  <li class="location">대전</li>
  <li class="location">광주</li>
</ul>
```

```javascript
const h1 = document.querySelector('h1')
const header = document.querySelector('#location-header') // id로 선택하는 편이 더 명확
const liTags = document.querySelectorAll('li')            // NodeList(3)
const locations = document.querySelectorAll('.location')  // NodeList(3)
```

### HTMLCollection과 NodeList

둘 다 인덱스로 접근하는 **유사 배열**이다.

| | HTMLCollection | NodeList |
| --- | --- | --- |
| 접근 | name, id, index | index |
| `forEach` | 없음 | 있음 |
| 갱신 | **live**: DOM 변경이 실시간 반영 | `childNodes` 등은 live, **`querySelectorAll` 결과는 static** |

live collection은 반복문 도중 DOM을 바꾸면 컬렉션도 함께 바뀌어 예상치 못한 결과를 낼 수 있다. static한 `querySelectorAll` 결과를 쓰는 편이 안전하다. 진짜 배열 메서드가 필요하면 `Array.from(nodeList)`로 변환한다.

## 생성과 삽입

```javascript
const li = document.createElement('li') // 태그 이름으로 요소 생성
li.innerText = '부울경'

const ul = document.querySelector('ul')
ul.append(li)              // 마지막 자식 뒤에 추가
ul.append('텍스트', li2)    // 문자열과 여러 노드를 한 번에 추가 가능
ul.appendChild(li3)        // 노드 하나만, 추가한 노드를 반환
```

| | `Element.append()` | `Node.appendChild()` |
| --- | --- | --- |
| 추가 가능한 것 | Node와 문자열(DOMString) | Node만 |
| 개수 | 여러 개 | 하나 |
| 반환값 | 없음 | 추가된 Node |

이미 문서에 있는 노드를 다시 append하면 복사되지 않고 **새 위치로 이동**한다.

## 내용 변경: innerText vs innerHTML

| 속성 | 동작 |
| --- | --- |
| `innerText` | 사람이 읽을 수 있는 텍스트만 다룬다. 스타일이 적용된 최종 모습 기준(숨긴 요소 무시, 줄바꿈 인식) |
| `textContent` | 숨긴 요소까지 포함한 원본 텍스트 |
| `innerHTML` | 요소 안의 HTML 마크업을 문자열로 읽고 쓴다 |

`innerHTML`에 사용자 입력을 그대로 넣으면 그 안의 `<script>`나 이벤트 속성이 실행될 수 있어 **XSS 공격**에 취약하다. 텍스트를 넣을 때는 `innerText`/`textContent`를 쓴다([웹 보안](/knowledge/dictionary/frontend/web/web-security) 참고).

## 삭제

```javascript
li.remove()            // 자기 자신을 트리에서 제거
ul.removeChild(li)     // 부모가 자식을 제거하고, 제거된 노드를 반환
```

## 속성

```javascript
const a = document.querySelector('a')
a.setAttribute('href', 'https://example.com') // 있으면 갱신, 없으면 추가
a.getAttribute('href')                         // 'https://example.com'

a.classList.add('active')    // class 조작은 classList가 편하다
a.classList.toggle('hidden')
```

## 핵심 정리

- 선택은 `querySelector`(하나) / `querySelectorAll`(여러 개, static NodeList).
- 만들기 `createElement` → 붙이기 `append` → 지우기 `remove`.
- 텍스트는 `innerText`/`textContent`, `innerHTML`은 XSS 위험을 알고 쓴다.
