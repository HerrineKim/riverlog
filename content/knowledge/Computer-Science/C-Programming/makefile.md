---
title: "Makefile과 make"
concept: "Makefile"
summary: "make는 타깃과 의존 파일의 수정 시각을 비교해 바뀐 부분만 다시 빌드하는 도구다. 규칙·변수·자동 변수·패턴 규칙·내장 규칙, -MMD -MP로 헤더 의존성 자동화, .PHONY, 리링크 방지, 하위 디렉터리 빌드와 병렬 빌드에서 생기는 함정을 정리한다."
tags: ["c", "build", "compile", "tools", "makefile"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/8b5f8a97fe134adba47fbbb3b00969d5", "https://80000coding.notion.site/bb5a3d33a6f54b44afa95d008afd28d5", "https://80000coding.notion.site/9828b3b803464ac5aa7434a944de9489", "https://80000coding.notion.site/b553047b42f640669f30f4aef0b0503d", "https://80000coding.notion.site/1c295f7bcfbc41df8e8a23a66f6266d3", "https://80000coding.notion.site/237e8818beeb45f6ac714084ca477e55", "https://80000coding.notion.site/de20a702d17043b287545c861ab15457", "https://80000coding.notion.site/a8702bfc6af7405195b549a24411f843", "https://80000coding.notion.site/6172b58680564cb18c4f2179009aef3f", "https://80000coding.notion.site/d25159318abd4e7caeeee3cc8023008d", "https://80000coding.notion.site/d73b19bf218645fca662b2a06e2887bd", "https://80000coding.notion.site/41ab07b7d40f4cc5b45e95320174fb4c", "https://80000coding.notion.site/38ce31eb01e444f78ae1ec9f1802b7f8", "https://80000coding.notion.site/5196284cbb1c4cf095aa6da1046840b3", "https://80000coding.notion.site/bac2c93a62794b3d8ad3b9a84a6ed709", "https://www.gnu.org/software/make/manual/make.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「한글로 Makefile 가볍게 읽어보기」 연재, 「Makefile 개념 및 사용법 정리」, 「Makefile 의존성 처리」, 「Makefile에 헤더 파일의 의존성 정보를 자동으로 반영시키기」, 「Makefile 리링크(re-link)를 방지하는 법」, 「`re: fclean all`을 쓰지 마세요!」, 「Makefile 없는 C/C++ 개발환경」 등을 GNU make 매뉴얼과 함께 재구성한 노트입니다.

## make란

**make**는 "무엇을 만들려면 무엇이 필요하고, 어떤 명령으로 만드는가"를 적은 **Makefile**을 읽어 빌드를 자동화하는 도구다. 핵심 기능은 **증분 빌드(incremental build)**다. 타깃 파일과 의존 파일의 **최종 수정 시각**을 비교해, 의존 파일이 더 새로울 때만 타깃을 다시 만든다. 소스 100개 중 하나만 고쳤다면 그 파일만 다시 컴파일하고 링크한다. 셸 스크립트로 빌드 명령을 나열하면 이 판단을 직접 짜야 한다.

## 규칙의 모양

```makefile
target: prerequisites
	recipe
```

| 요소 | 뜻 |
| --- | --- |
| 타깃(target) | 만들 파일 이름. `clean`처럼 동작 이름일 수도 있다 |
| 의존 파일(prerequisites) | 타깃을 만드는 데 필요한 파일이나 다른 타깃. 먼저 최신 상태로 만든다 |
| 레시피(recipe) | 실행할 셸 명령. **반드시 탭 문자로 시작**한다. 줄 앞에 `@`를 붙이면 명령 자체는 출력하지 않는다 |

`make`만 실행하면 첫 번째 타깃(또는 `.DEFAULT_GOAL`)을 만들고, `make foo.o`처럼 타깃을 지정할 수도 있다.

## 변수와 자동 변수

| 대입 | 동작 |
| --- | --- |
| `A = $(B)` | 재귀 확장. 쓰이는 시점에 다시 펼친다. `A = $(A) x`는 무한 재귀 오류 |
| `A := $(B)` | 단순 확장. 대입하는 순간 값이 정해진다. 누적에 쓴다 |
| `A += x` | 뒤에 덧붙인다 |
| `A ?= x` | 아직 정의되지 않았을 때만 대입 |

| 자동 변수 | 뜻 |
| --- | --- |
| `$@` | 현재 타깃 이름 |
| `$<` | 첫 번째 의존 파일 |
| `$^` | 모든 의존 파일(중복 제거) |
| `$?` | 타깃보다 새로운 의존 파일만 |
| `$*` | 패턴 규칙에서 `%`에 매칭된 부분 |

자주 쓰는 함수는 치환 참조 `$(SRCS:.c=.o)`, `$(patsubst %.c,%.o,$(SRCS))`, `$(addprefix src/,$(NAMES))`, `$(wildcard *.c)`, `$(filter bonus,$(MAKECMDGOALS))` 정도다.

## 패턴 규칙과 내장 규칙

`%.o: %.c`는 "어떤 `.o`든 같은 이름의 `.c`로 만든다"는 **패턴 규칙**이다. `.c.o:`는 같은 뜻의 옛 접미사 규칙이다.

make에는 이미 내장 규칙이 있어서(`make -p`로 확인, `make -r`로 끈다) 레시피를 생략해도 컴파일과 링크가 된다. 내장 규칙이 쓰는 변수 이름을 알면 Makefile이 짧아진다.

| 변수 | 쓰임 | 예 |
| --- | --- | --- |
| `CC`, `CFLAGS` | C 컴파일러와 컴파일 옵션 | `cc`, `-Wall -Wextra -Werror` |
| `CPPFLAGS` | 전처리기 옵션 | `-Iinclude` |
| `LDFLAGS` | 링커 옵션(라이브러리 경로) | `-Llibft` |
| `LDLIBS` | 링크할 라이브러리 | `-lft` |
| `AR`, `ARFLAGS` | 정적 라이브러리 묶기 | `ar`, `rcs` |

```makefile
CFLAGS   = -Wall -Wextra -Werror -MMD -MP
CPPFLAGS = -Iinclude
LDFLAGS  = -Llibft
LDLIBS   = -lft

SRCS = main.c read.c write.c
OBJS = $(SRCS:.c=.o)
DEPS = $(SRCS:.c=.d)

all: app

app: $(OBJS)        # 레시피 생략: 내장 규칙 %: %.o 와 %.o: %.c 가 동작
	$(CC) $(LDFLAGS) $^ $(LDLIBS) -o $@

-include $(DEPS)

clean:
	$(RM) $(OBJS) $(DEPS)

fclean: clean
	$(RM) app

re: fclean
	$(MAKE) all

.PHONY: all clean fclean re
```

라이브러리는 **링크 순서가 중요하다.** `main.o`가 `libftprintf.a`를, 그것이 `libft.a`를 쓴다면 `cc main.o -lftprintf -lft` 순서여야 한다. 그래서 라이브러리는 `LDLIBS`에 두어 오브젝트 뒤에 오게 한다. 자세한 이유는 [[gcc-compile-and-link|GCC 컴파일과 링크]]에 있다.

## 헤더 의존성 자동화: -MMD -MP

`%.o: %.c`만 적으면 make는 **헤더가 바뀐 것을 모른다.** `bar.h`의 `#define`이나 구조체 필드 타입을 바꿔도 `foo.c`가 그대로면 `foo.o`는 옛 정의로 남고, 링크는 성공하지만 실행이 이상해진다. 매번 `make re`를 하거나 `foo.o: foo.c bar.h`를 손으로 적는 대신 컴파일러에게 의존성을 쓰게 한다.

| 옵션 | 동작 |
| --- | --- |
| `-MMD` | 컴파일하면서 시스템 헤더를 뺀 의존 헤더 목록을 Makefile 문법의 `.d` 파일로 쓴다 |
| `-MP` | 각 헤더에 빈 가짜 타깃을 추가해, 헤더를 지워도 "규칙 없음" 오류가 나지 않게 한다 |

```text
# main.d (자동 생성)
main.o: main.c io.h
io.h:
```

Makefile에서 `-include $(DEPS)`로 읽어 들인다. 앞의 `-`는 첫 빌드처럼 `.d`가 아직 없을 때 오류를 무시하라는 뜻이다.

## .PHONY: 파일이 아닌 타깃

`clean`, `all`, `re`처럼 파일을 만들지 않는 타깃은 `.PHONY`로 선언한다. 선언하지 않으면 같은 이름의 파일이 디렉터리에 생겼을 때 make가 "이미 최신"이라며 레시피를 건너뛴다. 하위 디렉터리를 도는 타깃을 `.PHONY`로 만들어 의존성으로 나열하면, 셸 `for` 루프와 달리 하위 make의 오류에서 멈추고 `-j`로 병렬 실행도 된다.

```makefile
SUBDIRS = lib src
.PHONY: all $(SUBDIRS)
all: $(SUBDIRS)
$(SUBDIRS):
	$(MAKE) -C $@
```

## 자주 겪는 함정

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 아무것도 안 바꿨는데 `make`할 때마다 링크한다(리링크) | 타깃이 실제 파일이 아니거나, `bonus`처럼 같은 결과물을 다른 오브젝트로 만드는 타깃이 의존성 없이 매번 실행됨 | 결과물 파일을 타깃으로 두고 의존성을 정확히 건다. 필수/보너스가 같은 산출물을 만들면 `make WITH_BONUS=1`로 오브젝트 목록을 바꾸거나, 빌드 시점을 기록하는 표시 파일을 `touch`해 타깃으로 쓴다 |
| `make -j re`가 가끔 깨진다 | `re: fclean all`은 두 의존성을 실행하는 **순서를 보장하지 않는다.** 병렬 빌드에서 `fclean`이 `all`이 만든 파일을 지울 수 있다 | `re: fclean` 다음 레시피에서 `$(MAKE) all`을 호출한다 |
| 헤더를 고쳤는데 반영이 안 된다 | 헤더 의존성 누락 | `-MMD -MP`와 `-include $(DEPS)` |
| 레시피에서 `missing separator` 오류 | 탭 대신 공백으로 들여씀 | 편집기 설정에서 Makefile은 탭 유지 |
| 하위 Makefile을 `cd dir && make`로 부른다 | 동작은 하지만 옵션 전달이 어색하다 | `$(MAKE) -C dir`를 쓴다. `$(MAKE)`는 `-j` 같은 옵션을 하위 make에 넘긴다 |

디버깅 빌드는 Makefile을 고치지 않고 변수로 바꾼다. `ifdef DEBUG` 블록에서 `CFLAGS += -g -fsanitize=address,undefined`를 더하면 `make DEBUG=1`로 켤 수 있다. 다만 옵션이 바뀌어도 오브젝트의 수정 시각은 그대로라 기존 `.o`가 재사용되므로, 모드를 바꿀 때는 `make re`를 한다.

## 큰 프로젝트 구성

- 공통 설정은 `Rules.mk` 같은 파일로 빼고 `include Rules.mk`로 읽는다. `-include`는 없어도 되는 파일에 쓴다.
- 산출물이 여럿이면 `make -f Makefile.server`처럼 파일을 나누거나, 디렉터리별 Makefile을 `$(MAKE) -C`로 부른다.
- 깊은 상대 경로(`include ../../../rules.mk`)가 반복되면 최상위에서 `TOPDIR`를 넘기거나 `$(abspath ...)`로 절대 경로를 만든다.
- `make -n`(실행하지 않고 명령만 출력), `-d`(판단 과정 출력), `-p`(내장 규칙·변수 출력), `-k`(오류가 나도 계속)는 Makefile을 디버깅할 때 쓴다.

## make 이후의 빌드 도구

손으로 쓰는 Makefile은 의존성 누락, 플랫폼별 분기, 느린 재귀 make 같은 한계가 있다. 그래서 C/C++ 프로젝트는 빌드 설정을 생성해 주는 도구를 많이 쓴다.

| 도구 | 역할 |
| --- | --- |
| CMake | 플랫폼 독립 설정(`CMakeLists.txt`)에서 Makefile·Ninja·IDE 프로젝트를 생성. C/C++의 사실상 표준 |
| Meson | 간결한 문법의 설정 생성기. 기본 백엔드가 Ninja |
| Ninja | 사람이 쓰기보다 생성기가 만드는 저수준 빌드 실행기. 빠른 증분 빌드에 집중 |

그래도 make는 거의 모든 유닉스 계열 환경에 있고, 작은 C 프로젝트나 임의 작업 자동화에는 여전히 가장 가벼운 선택이다.

## 정리

- make는 **수정 시각 비교**로 바뀐 것만 다시 빌드한다. 의존성을 정확히 적는 것이 전부다.
- 헤더 의존성은 `-MMD -MP`와 `-include`로 컴파일러에게 맡긴다.
- 파일이 아닌 타깃은 `.PHONY`, 하위 빌드는 `$(MAKE) -C`, 재빌드는 `re: fclean` + `$(MAKE) all`.
- 내장 규칙의 변수(`CFLAGS`, `CPPFLAGS`, `LDFLAGS`, `LDLIBS`)를 쓰면 Makefile이 짧고 표준적이 된다.

관련 노트: [[gcc-compile-and-link|GCC 컴파일과 링크]], [[c-basics|C 기초: 컴파일, 자료형, 배열과 문자열]], [[c-debugging-tools|C 디버깅 도구]], [[java-build-tools|Java 빌드 도구]]
