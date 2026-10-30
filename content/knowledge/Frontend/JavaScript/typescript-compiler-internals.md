---
title: "TypeScript 컴파일러 내부 구조"
concept: "TS Compiler"
summary: "TypeScript 컴파일러는 스캐너(토큰) → 파서(AST) → 바인더(심볼) → 체커(타입 검사) → 이미터(JS·.d.ts·소스맵) 순으로 일한다. 문법과 의미의 차이, Program·SourceFile·Node·SyntaxKind, 주석을 담는 트리비아, 심볼과 심볼 테이블·컨테이너, 지연 검사와 진단의 종류, 소스맵, Go로 옮긴 TypeScript 7에서 달라진 점을 정리한다."
tags: ["typescript", "compiler", "ast", "frontend", "tools"]
source: other
date: "2026-10-30"
sources: ["https://basarat.gitbook.io/typescript/overview", "https://basarat.gitbook.io/typescript/overview/program", "https://basarat.gitbook.io/typescript/overview/ast", "https://basarat.gitbook.io/typescript/overview/scanner", "https://basarat.gitbook.io/typescript/overview/parser", "https://basarat.gitbook.io/typescript/overview/binder", "https://basarat.gitbook.io/typescript/overview/checker", "https://basarat.gitbook.io/typescript/overview/emitter", "https://github.com/microsoft/typescript-go", "https://www.infoq.com/news/2026/08/typescript-7-released/"]
---

> basarat의 「[TypeScript Deep Dive](https://basarat.gitbook.io/typescript)」의 TypeScript Compiler Internals 장을 바탕으로, Go로 옮긴 TypeScript 7([typescript-go](https://github.com/microsoft/typescript-go))의 변화를 더해 재구성한 노트다.

## 컴파일러가 하는 일

TypeScript 컴파일러는 코드를 **읽어서(구문), 뜻을 따지고(의미), JavaScript로 내보낸다.** 대부분의 트랜스파일러(Babel, esbuild)는 구문만 다룬다. TypeScript를 「타입 검사기」로 만드는 것은 그 사이의 의미 분석, 즉 바인더와 체커다.

**문법(syntax)과 의미(semantics)는 다르다.** `const foo: number = 'not a number'`는 문법적으로 완벽하다. 파서는 문제없이 트리를 만든다. 틀린 것은 뜻이고, 그것은 체커가 잡는다.

```text
소스 코드 ──scanner──▶ 토큰 열 ──parser──▶ AST (SourceFile)
                                              │
                                   binder ────┤  AST 노드 ↔ Symbol 연결
                                              ▼
                              checker: AST + Symbol로 타입 검사 ──▶ 진단(오류 목록)
                                              │
                              emitter: AST + checker의 판단 ──▶ .js · .d.ts · .map
```

| 단계 | 입력 → 출력 | 하는 일 | 찾아내는 오류 |
| --- | --- | --- | --- |
| 스캐너(scanner) | 문자열 → 토큰 | 키워드·식별자·리터럴·구두점으로 자른다 | 끝나지 않은 문자열, 잘못된 문자 |
| 파서(parser) | 토큰 → AST | 문법 규칙대로 트리를 만든다 | 구문 오류(괄호 짝, 예상하지 못한 토큰) |
| 바인더(binder) | AST → Symbol | 선언마다 심볼을 만들고 같은 실체의 선언을 묶는다. 스코프를 정한다 | 중복 선언, strict mode 위반(`eval`을 변수 이름으로) |
| 체커(checker) | AST + Symbol → 타입 | 각 식의 타입을 구하고 대입·호출이 맞는지 본다 | 타입 오류 대부분 |
| 이미터(emitter) | AST → 파일 | 타입을 지우고 target에 맞게 바꿔 쓴다 | 선언 파일을 만들 수 없는 경우 |

## 주요 자료 구조

| 이름 | 뜻 |
| --- | --- |
| `Program` | 컴파일 컨텍스트 하나([[typescript-project-config\|tsconfig]])를 나타낸다. `SourceFile` 목록과 컴파일러 옵션을 갖고, 체커를 만든다 |
| `CompilerHost`, `System` | 파일 읽기·쓰기 같은 운영 환경 접근을 감싼다. Program → CompilerHost → System 순으로 기대므로, 메모리 파일 시스템으로 바꿔 끼워 테스트할 수 있다 |
| `SourceFile` | 파일 하나의 AST 루트 노드 |
| `Node` | AST 노드. 종류는 `kind`(`SyntaxKind` enum 값), 위치는 `pos`·`end`(파일 안 문자 위치), 위로는 `parent` |
| `SyntaxKind` | 모든 토큰·노드 종류의 enum(`VarKeyword`, `Identifier`, `VariableStatement` …). 값이 숫자라 디버깅할 때는 이름으로 바꿔 본다 |
| `Symbol` | 「같은 실체」를 가리키는 의미 단위. 여러 선언 노드를 묶는다 |
| `Type` | 체커가 계산한 타입 |
| `Diagnostic` | 오류 하나. 코드(`TS2322`), 메시지, 위치를 담는다 |

## 스캐너와 파서

스캐너는 파서가 부를 때마다 다음 토큰 하나를 돌려준다. 매번 새로 만들지 않고 하나를 재사용하며, 파서가 파일을 시작할 때 텍스트와 옵션으로 상태를 다시 맞춘다. `var foo = 123;`은 이렇게 잘린다.

```text
VarKeyword  Identifier  EqualsToken  NumericLiteral  SemicolonToken
  0-3          3-7         7-9           9-13            13-14
```

`foo`의 범위가 `3-7`인 것은 앞 공백까지 포함하기 때문이다(아래 「트리비아」). 파서는 이 토큰으로 트리를 만든다.

```text
SourceFile 0-14
└─ VariableStatement 0-14
   ├─ VariableDeclarationList 0-13
   │  └─ VariableDeclaration 3-13
   │     ├─ Identifier "foo" 3-7
   │     └─ NumericLiteral "123" 9-13
   └─ SemicolonToken 13-14
EndOfFileToken 14-14
```

AST를 직접 보려면 [TypeScript AST Viewer](https://ts-ast-viewer.com) 같은 도구가 편하다. 코드로는 `typescript` 패키지의 API로 순회한다.

```ts
import ts from 'typescript';

const sf = ts.createSourceFile('a.ts', 'var foo = 123;', ts.ScriptTarget.Latest, true);

function walk(node: ts.Node, depth = 0): void {
  console.log(' '.repeat(depth * 2) + ts.SyntaxKind[node.kind], node.pos, node.end);
  ts.forEachChild(node, (child) => walk(child, depth + 1));
}
walk(sf);
```

`forEachChild`는 의미 있는 자식만 돌고 키워드·구두점 토큰은 건너뛴다. 토큰까지 모두 보려면 `node.getChildren()`을 쓴다. `SyntaxKind`에는 범위 표시용 별칭(`FirstStatement`, `FirstLiteralToken`, `FirstAssignment`)이 같은 숫자로 들어 있어서, `ts.SyntaxKind[node.kind]`는 `VariableStatement` 대신 `FirstStatement`처럼 별칭 이름을 돌려주기도 한다.

### 트리비아: 주석과 공백

공백, 줄바꿈, 주석처럼 실행에는 상관없는 텍스트를 **트리비아(trivia)** 라 한다. AST에 노드로 저장하지 않아 트리를 가볍게 유지하고, 필요할 때 원문에서 다시 읽는다. 그래서 노드에는 시작점이 두 개다.

| 위치 | 뜻 | API |
| --- | --- | --- |
| full start | 직전 의미 있는 토큰이 끝난 곳. 앞 트리비아를 포함한다 | `node.getFullStart()` (= `pos`) |
| token start | 토큰 글자가 실제로 시작하는 곳 | `node.getStart()` |

- 같은 줄에서 토큰 뒤에 오는 트리비아는 그 토큰의 것이고, 다음 줄부터의 주석은 뒤 토큰의 것이다.
- 파일 맨 앞 트리비아는 첫 토큰이, 맨 끝 트리비아는 길이 0인 파일 끝 토큰이 갖는다.
- `ts.getLeadingCommentRanges`, `ts.getTrailingCommentRanges`로 노드 앞뒤 주석을 꺼낸다. JSDoc 기반 도구, 주석을 보존하는 codemod가 이것을 쓴다.

## 바인더: 심볼과 스코프

**심볼(Symbol)은 AST의 선언 노드들을 「같은 것」으로 잇는 의미 단위다.** `interface User`를 두 번 선언하면 노드는 둘이지만 심볼은 하나이고, 체커는 그 심볼의 선언 목록을 합쳐 본다. 선언 병합이 이렇게 일어난다. 반대로 같은 공간에 `let x`가 두 번이면 바인더가 「Cannot redeclare block-scoped variable」을 낸다.

| 개념 | 내용 |
| --- | --- |
| `symbol.declarations` | 이 심볼을 만든 선언 노드 목록. 노드에서는 `node.symbol`로 거꾸로 간다 |
| `SymbolFlags` | 심볼의 분류 비트(함수 스코프 변수, 블록 스코프 변수, 클래스, 인터페이스, 값 모듈 …). 어떤 선언끼리 합쳐도 되는지 이 플래그로 판단한다 |
| 심볼 테이블 | 이름 → 심볼 맵. 노드의 `locals`(지역 이름), 심볼의 `members`(클래스·인터페이스·객체 리터럴 멤버), `exports`(모듈·네임스페이스가 내보낸 것) |
| 컨테이너(container) | 지역 이름을 담는 노드(함수, 모듈, 클래스 등). 블록은 `let`·`const`만 담는 블록 스코프 컨테이너다. 함수 본문 바로 안의 블록은 따로 두지 않아, 같은 함수의 `var x`와 `let x`가 충돌로 잡힌다 |

바인더는 파일 단위로 돌고, 체커가 초기화될 때 모든 파일을 바인딩한 뒤 **전역 스크립트 파일의 `locals`를 전역 심볼 테이블 하나로 합친다.** import·export가 없는 파일의 선언이 다른 파일에서 보이는 이유가 이것이다([[typescript-project-config#모듈: 파일 모듈과 전역 스크립트\|파일 모듈과 전역 스크립트]]).

## 체커: 지연 검사와 진단

체커는 컴파일러에서 가장 큰 부분이다. 프로그램이 처음 만들어질 때 모든 타입을 계산하지 않고, **누군가 물을 때 필요한 만큼만 계산하고 캐시한다.** 편집기에서 마우스를 올려 타입을 볼 때, `tsc`가 진단을 모을 때가 그 「물음」이다. 그래서 언어 서비스는 파일 하나만 바뀌어도 그 주변만 다시 계산한다.

진단은 어디서 나왔는지에 따라 나뉜다.

| 종류 | 만드는 곳 | 예 |
| --- | --- | --- |
| 구문(syntactic) | 스캐너·파서 | `')' expected` |
| 바인드 | 바인더 | 중복 선언 |
| 의미(semantic) | 체커 | `Type 'string' is not assignable to type 'number'` |
| 선언(declaration) | `.d.ts` 생성 | 내보낸 함수의 반환 타입을 이름 붙여 쓸 수 없음 |
| 옵션·전역 | Program | `tsconfig` 옵션 충돌, lib 누락 |

오류 메시지를 읽는 법과 자주 보는 코드는 [[typescript-error-messages|TypeScript 오류 메시지 읽기와 흔한 오류]]에 있다.

## 이미터: JavaScript, 선언 파일, 소스맵

이미터는 출력할 파일마다 AST를 **변환기(transformer)** 사슬에 통과시킨다. 타입 표기를 지우고, target보다 새 문법(데코레이터, 클래스 필드 등)을 낮추고, 모듈 형식을 맞춘 뒤 텍스트로 쓴다. 체커는 「이 import는 값으로 쓰였나」 같은 판단을 이미터에 넘겨준다(emit resolver). 그래서 타입 정보 없이 파일 하나씩만 변환하는 Babel·esbuild는 이 판단에 기대는 코드를 처리하지 못하고, `isolatedModules`·`verbatimModuleSyntax`가 그런 코드를 미리 막는다.

| 출력 | 옵션 |
| --- | --- |
| `.js` | 기본. `noEmit`이면 검사만 한다 |
| `.d.ts` | `declaration`. 공개 API의 타입만 남긴다 |
| `.js.map` | `sourceMap`, `inlineSourceMap`, `inlineSources` |
| `.d.ts.map` | `declarationMap`. 사용처에서 정의로 이동하면 원본 `.ts`로 간다 |

**소스맵(source map)** 은 출력 파일의 위치를 원본 위치로 되돌리는 지도다. JSON 안의 `mappings` 문자열에 「출력의 몇 번째 줄 몇 번째 열 ↔ 원본 파일의 몇 번째 줄 몇 번째 열」을 이전 값과의 차이로, Base64 VLQ로 압축해 담는다. 디버거와 에러 리포터(Sentry 등)가 이것으로 스택 트레이스를 원본 코드로 보여 준다.

## TypeScript 7: Go로 옮긴 컴파일러

TypeScript 7.0(2026)은 컴파일러를 TypeScript에서 Go로 **옮겨 쓴(port)** 버전이다. 새로 설계한 것이 아니라 같은 단계와 같은 검사 규칙을 그대로 옮겼기 때문에, 6.0과 같은 구문 오류와 같은 타입을 낸다.

| 달라진 점 | 내용 |
| --- | --- |
| 속도 | 네이티브 코드와 공유 메모리 병렬 처리로 큰 프로젝트의 전체 빌드가 대략 8~12배 빨라졌다. 메모리도 줄었다 |
| 실행 파일 | 명령은 그대로 `tsc`다. 미리보기 시절에는 `@typescript/native-preview` 패키지의 `tsgo`였다 |
| 편집기 | 언어 서비스가 LSP(Language Server Protocol) 서버로 바뀌었다 |
| 프로그래밍 API | 7.0에는 안정 API가 없다. 컴파일러 API에 기대는 도구(typescript-eslint의 타입 정보 규칙, Vue·Svelte·Astro·Angular 템플릿 검사, ts-morph)는 그동안 TypeScript 6 패키지를 함께 쓴다. API는 7.1(2026.10 베타)에서 다시 들어온다 |
| 옵션 | 6.0에서 폐기 예고한 옵션(`node10` 해석, `baseUrl`, `outFile`, ES5 출력 등)이 모두 오류가 된다 |

위의 `ts.createSourceFile` 예시처럼 JavaScript로 된 컴파일러 API를 쓰는 스크립트는 `typescript@6`에서 돌린다.

## 정리

- 스캐너·파서는 **구문**을, 바인더·체커는 **의미**를 다룬다. 트랜스파일러에 없는 것이 바인더와 체커다.
- AST는 `SyntaxKind`로 종류를, `pos`·`end`로 위치를 나타내고, 주석·공백은 트리비아로 따로 다룬다.
- 심볼은 여러 선언을 하나로 묶는다. 선언 병합, 중복 선언 오류, 전역 스크립트의 이름 공유가 모두 여기서 나온다.
- 체커는 물을 때만 계산한다. 그래서 편집기가 빠르다.
- 이미터는 변환기로 타입을 지우고 문법을 낮추며, `.d.ts`와 소스맵을 함께 낸다. TypeScript 7은 같은 구조를 Go로 옮겨 빨라졌다.

**타입 검사는 「구문 트리 위에 심볼을 얹고, 필요한 순간에 타입을 계산하는」 일이다.**

관련 노트: [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-project-config|TypeScript 프로젝트 설정]], [[typescript-error-messages|TypeScript 오류 메시지 읽기와 흔한 오류]], [[babel|Babel과 AST 변환]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]
