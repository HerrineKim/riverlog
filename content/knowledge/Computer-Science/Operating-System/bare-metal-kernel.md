---
title: "가장 작은 x86 커널: 부팅, Multiboot, VGA 텍스트 출력"
concept: "Bare-Metal Kernel"
summary: "GRUB이 올려 주는, 화면에 글자 한 줄을 쓰고 멈추는 32비트 x86 커널을 만들며 부팅의 바닥을 본다. 리셋 벡터(0xFFFFFFF0)에서 BIOS·부트 섹터(0x7C00)·부트로더를 거쳐 1 MiB에 커널이 올라오는 흐름, 리얼·보호·롱 모드, Multiboot 헤더(0x1BADB002)와 넘겨받는 기계 상태(스택은 직접, 인터럽트는 꺼진 채), 어셈블리 진입점과 스택, 0xB8000 VGA 텍스트 버퍼와 속성 바이트, volatile, 링커 스크립트, 크로스 컴파일러와 -ffreestanding·-mgeneral-regs-only, QEMU·grub-mkrescue로 실행하기, Multiboot2와 UEFI에서 달라지는 점을 정리한다."
tags: ["computer-science", "os", "kernel", "assembly", "c"]
source: other
date: "2026-11-28"
sources: ["https://arjunsreedharan.org/post/82710718100/kernels-101-lets-write-a-kernel", "https://www.gnu.org/software/grub/manual/multiboot/multiboot.html", "https://www.gnu.org/software/grub/manual/multiboot2/multiboot.html"]
---

> Arjun Sreedharan의 「[Kernels 101: Let's write a Kernel](https://arjunsreedharan.org/post/82710718100/kernels-101-lets-write-a-kernel)」(2014.04)을 바탕으로 재구성한 노트다. 부트로더가 넘겨주는 기계 상태는 [Multiboot 명세](https://www.gnu.org/software/grub/manual/multiboot/multiboot.html)와 [Multiboot2 명세](https://www.gnu.org/software/grub/manual/multiboot2/multiboot.html)로 보강했다. 컴파일 결과는 Homebrew LLVM 23.1.6의 `clang --target=i386-elf`로 확인했고, 링크와 부팅은 직접 돌려 보지 못했다.

## 커널을 직접 만든다는 것

운영체제 커널도 결국 메모리 어딘가에 올라가 실행되는 프로그램이다([[os-overview|운영체제 개요]]). 다만 그 아래에 운영체제가 없다. 표준 라이브러리도, `printf`도, 누가 잡아 준 스택도 없이 CPU와 메모리만 있는 상태에서 시작한다. 이렇게 운영체제 없이 하드웨어 위에서 바로 도는 코드를 **베어 메탈(bare metal)** 코드라 한다.

화면에 글자 한 줄을 쓰고 멈추는 가장 작은 커널은 네 조각이면 된다.

| 조각 | 역할 |
| --- | --- |
| Multiboot 헤더 | 부트로더(GRUB)에게 「나는 이 규약대로 올려도 되는 커널이다」라고 알린다 |
| 어셈블리 진입점 | 스택을 잡고 C 함수를 부른 뒤 CPU를 멈춘다. C로는 스택 포인터를 직접 정할 수 없어서 어셈블리가 필요하다 |
| C로 쓴 `kmain` | 화면 메모리(0xB8000)에 글자를 쓴다 |
| 링커 스크립트 | 커널을 1 MiB(0x100000) 주소에 배치하고, 헤더를 파일 앞부분에 둔다 |

```mermaid
flowchart LR
  power["전원"] --> fw["펌웨어(BIOS·UEFI)"]
  fw --> grub["부트로더(GRUB)"]
  grub -->|"Multiboot 헤더 확인<br/>보호 모드, 1 MiB에 적재"| start["start (어셈블리)"]
  start -->|"스택 설정 후 call"| kmain["kmain (C)"]
  kmain -->|"0xB8000에 쓰기"| screen["화면"]
```

## x86이 켜지는 과정

| 단계 | 하는 일 |
| --- | --- |
| 1. 리셋 벡터 | 전원이 들어오면 CPU는 레지스터를 정해진 값으로 초기화한다. CS 셀렉터는 0xF000이지만 숨은 베이스가 0xFFFF0000이고 EIP가 0xFFF0이라, 첫 명령은 32비트 주소 공간의 마지막 16바이트인 **0xFFFFFFF0**에서 가져온다. 칩셋은 이 주소를 RAM이 아니라 펌웨어 ROM에 연결해 두고, 거기에는 펌웨어 본체로 가는 점프 명령이 있다 |
| 2. 펌웨어 | BIOS가 POST로 하드웨어를 점검한다. 느린 ROM 대신 RAM에 자기 코드를 복사해 실행하기도 한다(섀도잉, shadowing) |
| 3. 부트 섹터 | 정해진 부팅 순서대로 장치를 보며 첫 섹터(512바이트)의 마지막 두 바이트가 0x55, 0xAA인지(리틀 엔디언 워드로 0xAA55) 확인한다. 맞으면 그 섹터를 물리 주소 **0x7C00**에 복사하고 그리로 점프한다 |
| 4. 부트로더 | 부트 섹터의 작은 코드가 GRUB 본체를 읽어 온다. GRUB은 커널 파일을 찾아 ELF 프로그램 헤더가 지정한 주소에 올린다. 아래 링커 스크립트는 그 주소를 **0x100000(1 MiB)**으로 정한다. 그리고 보호 모드로 바꾼 뒤 커널 진입점으로 점프한다 |

디스크 쪽에서 본 과정(MBR·VBR, GPT와 EFI 시스템 파티션)은 [[disk-scheduling|디스크 관리와 스케줄링]]의 「부팅 과정」에, 리눅스 커널이 뜬 뒤 systemd가 로그인까지 가는 과정은 [[daemon-and-systemd|데몬과 systemd]]에 있다.

**지금 PC의 펌웨어는 대부분 UEFI다.** UEFI는 섹터 0의 코드를 실행하지 않고 EFI 시스템 파티션의 부트로더 파일(`.efi`)을 실행하며, x86-64에서는 펌웨어가 이미 64비트 모드로 돌고 있다. 레거시 BIOS 부팅을 흉내 내는 호환 모드(CSM)는 새 하드웨어에서 빠지는 추세라, 아래의 BIOS 흐름은 QEMU 같은 에뮬레이터에서 실습하기 좋은 고전 경로로 보면 된다.

### 리얼 모드, 보호 모드, 롱 모드

| 모드 | 특징 | 들어가는 법 |
| --- | --- | --- |
| 리얼 모드(real mode) | 전원 직후의 16비트 모드. `세그먼트 × 16 + 오프셋`으로 약 1 MiB까지 주소를 만든다(A20 선이 꺼져 있으면 1 MiB를 넘는 주소가 0으로 돌아가고, 켜져 있으면 1 MiB 위 64 KiB 가까이 더 닿는다). 메모리 보호가 없다 | 리셋하면 이 모드다 |
| 보호 모드(protected mode) | 32비트 모드. 4 GiB 주소 공간, 세그먼트 디스크립터 테이블(GDT)로 권한을 나누고, 페이징을 켤 수 있다 | GDT를 만든 뒤 CR0 레지스터의 가장 낮은 비트(PE)를 1로 만들고 먼 점프로 CS를 다시 읽는다 |
| 롱 모드(long mode) | x86-64의 64비트 모드. 페이징이 필수다 | 보호 모드에서 CR4.PAE를 켜고 CR3에 최상위 페이지 테이블(PML4) 주소를 넣은 뒤 EFER.LME와 CR0.PG를 켠다. 64비트 코드 세그먼트로 먼 점프를 해야 비로소 64비트 코드가 돈다 |

GRUB은 Multiboot 커널을 32비트 보호 모드로 넘겨준다. 64비트 커널을 Multiboot로 올리면 커널이 처음에 32비트 코드로 페이지 테이블을 만들고 롱 모드로 넘어가는 디딤판을 직접 둬야 한다. 리눅스 커널은 Multiboot를 쓰지 않고 자체 부트 프로토콜(BIOS에서는 16비트 setup 코드부터 실행)이나 UEFI의 EFI stub으로 시작한다.

### 1 MiB 아래의 지도

커널을 0x100000에 두는 이유는 그 아래가 이미 붐비기 때문이다. 리얼 모드 시절의 배치가 지금도 남아 있다.

| 주소 범위 | 쓰임 |
| --- | --- |
| 0x00000 ~ 0x003FF | 리얼 모드 인터럽트 벡터 테이블(IVT) |
| 0x00400 ~ 0x004FF | BIOS 데이터 영역(BDA) |
| 0x07C00 ~ 0x07DFF | 부트 섹터가 올라오는 자리 |
| 0x9FC00 ~ 0x9FFFF 부근 | 확장 BIOS 데이터 영역(EBDA). 위치는 기계마다 다르다 |
| 0xA0000 ~ 0xBFFFF | 비디오 메모리. 컬러 텍스트 모드 버퍼가 **0xB8000**에 있다 |
| 0xC0000 ~ 0xFFFFF | 비디오 BIOS, 확장 카드 ROM, 시스템 BIOS |

## Multiboot: 부트로더와 커널의 약속

커널마다 부트로더를 따로 만들 수는 없으니, 부트로더가 어떤 커널이든 올릴 수 있게 정한 규약이 **Multiboot 명세**다. GRUB은 커널 파일에서 Multiboot 헤더를 찾아야 그 커널을 Multiboot 방식으로 올린다.

| 헤더 필드(각 4바이트) | 값 |
| --- | --- |
| `magic` | 0x1BADB002 |
| `flags` | 커널이 부트로더에 요청하는 것. 0이면 아무것도 요청하지 않는다. 비트 0은 모듈을 페이지 경계에 맞춰 달라, 비트 1은 사용 가능한 메모리 크기(`mem_lower`·`mem_upper`)를 알려 달라는 뜻이다. 부트로더가 할 수 있으면 메모리 지도(`mmap`)도 함께 준다 |
| `checksum` | `magic + flags + checksum`이 32비트로 0이 되는 값. flags가 0이면 `-(0x1BADB002)` = 0xE4524FFE |

헤더는 커널 파일의 **처음 8192바이트 안**에, 4바이트 경계에 맞춰 있어야 한다.

부트로더가 커널 진입점으로 점프할 때의 기계 상태도 명세가 정한다.

| 항목 | 상태 | 커널이 할 일 |
| --- | --- | --- |
| EAX | 0x2BADB002 | Multiboot 부트로더가 올렸는지 확인할 수 있다 |
| EBX | Multiboot 정보 구조체의 물리 주소 | 메모리 지도, 명령행, 모듈 위치를 여기서 읽는다 |
| CR0 | PE = 1(보호 모드), PG = 0(페이징 꺼짐) | 페이징이 필요하면 직접 켠다 |
| 세그먼트 | 0부터 0xFFFFFFFF까지의 평평한 32비트 코드·데이터 세그먼트 | GDTR은 유효하지 않을 수 있다. 자기 GDT를 만들기 전에는 세그먼트 레지스터를 다시 읽지 않는다 |
| EFLAGS | IF = 0(인터럽트 꺼짐) | 자기 IDT를 만들 때까지 인터럽트를 켜지 않는다 |
| A20 | 켜져 있다 | 1 MiB 위 주소를 그대로 쓸 수 있다 |
| ESP | **정해지지 않았다** | 스택이 필요해지는 즉시 직접 만든다 |

### Multiboot2

| | Multiboot | Multiboot2 |
| --- | --- | --- |
| 헤더 magic | 0x1BADB002 | 0xE85250D6 |
| 헤더 위치 | 처음 8192바이트 안, 4바이트 정렬 | 처음 32768바이트 안, 8바이트 정렬 |
| 헤더 구성 | magic·flags·checksum 고정 필드 | magic·architecture·header_length·checksum 뒤에 태그 목록(끝 태그로 마감) |
| 진입 시 EAX | 0x2BADB002 | 0x36D76289 |
| GRUB 명령 | `multiboot` | `multiboot2` |
| QEMU `-kernel` | 바로 올릴 수 있다 | Multiboot(1)만 지원해서 GRUB 이미지로 부팅한다 |

Multiboot2는 UEFI 환경을 위한 태그(EFI 시스템 테이블, 프레임버퍼 정보)를 갖고 있다. 64비트 취미 커널은 처음부터 64비트로 넘겨주는 Limine 같은 부트로더의 프로토콜을 쓰기도 한다.

## 진입점: 어셈블리

```nasm
; boot.asm
bits 32                         ; 32비트 코드를 만들라는 NASM 지시어

section .multiboot              ; 링커 스크립트가 이 섹션을 맨 앞에 둔다
align 4
    dd 0x1BADB002               ; magic
    dd 0x00                     ; flags
    dd -(0x1BADB002 + 0x00)     ; checksum: 셋을 더하면 0

section .bss
align 16
stack_bottom:
    resb 8192                   ; 스택 8 KiB
stack_top:

section .text
global start                    ; 링커가 진입점을 찾도록 공개한다
extern kmain                    ; C 파일에 정의된 함수

start:
    mov esp, stack_top          ; 스택은 아래로 자라므로 끝 주소를 넣는다
    call kmain
    cli
.hang:
    hlt                         ; 다음 인터럽트까지 멈춘다
    jmp .hang                   ; NMI가 깨워도 다시 멈춘다
```

- **스택은 직접 잡는다.** Multiboot는 ESP를 정해 주지 않는다. GRUB이 넘겨준 ESP가 우연히 쓸 만해 보여도 믿지 않는다. `.bss`에 공간을 잡고 그 **끝** 주소를 ESP에 넣는다. x86 스택은 주소가 작아지는 쪽으로 자라기 때문이다.
- **16바이트로 정렬한다.** i386 System V ABI는 `call` 직전에 스택이 16바이트 경계에 맞아 있다고 가정한다. 컴파일러가 이 가정으로 정렬된 SSE 명령을 만들 수 있다.
- **`hlt`는 반복문 안에 둔다.** `hlt`는 다음 인터럽트까지 CPU를 쉬게 할 뿐이다. `cli`로 일반 인터럽트를 막아도 NMI(마스크할 수 없는 인터럽트)는 CPU를 깨우므로, 깨어나면 다시 `hlt`로 돌아가게 한다. 진입 시 IF가 이미 0이라 `cli`는 확인 차원이다.
- 함수 호출과 스택 프레임이 어떻게 생기는지는 [[calling-convention|호출 규약과 스택 프레임]]에 있다.

## C 커널: VGA 텍스트 버퍼

```c
/* kernel.c */
void kmain(void)
{
    const char *str = "my first kernel";
    volatile char *vidptr = (volatile char *)0xb8000;  /* VGA 텍스트 버퍼 */
    unsigned int i = 0, j = 0;

    /* 화면 지우기: 80열 × 25행, 한 칸에 2바이트 */
    while (j < 80 * 25 * 2) {
        vidptr[j] = ' ';         /* 문자 */
        vidptr[j + 1] = 0x07;    /* 속성: 검은 배경에 밝은 회색 글자 */
        j += 2;
    }

    /* 문자열 쓰기 */
    for (j = 0; str[j] != '\0'; ++j, i += 2) {
        vidptr[i] = str[j];
        vidptr[i + 1] = 0x07;
    }
}
```

VGA 컬러 텍스트 모드에서 화면은 0xB8000부터 시작하는 메모리 조각이다. 화면은 80열 × 25행이고, 한 칸은 2바이트다. 앞 바이트는 문자 코드(ASCII, 정확히는 코드 페이지 437), 뒤 바이트는 색을 정하는 **속성 바이트**다. 이 메모리에 쓰면 그대로 화면에 나타난다. 장치 레지스터나 버퍼를 메모리 주소에 연결해 읽고 쓰는 이 방식을 **메모리 맵 입출력(memory-mapped I/O, MMIO)**이라 한다.

속성 바이트는 아래 4비트가 글자색, 위 4비트가 배경색이다(배경의 가장 높은 비트는 설정에 따라 깜빡임으로 쓰인다). `0x07`은 배경 0(검정), 글자 7(밝은 회색), `0x02`는 검은 배경에 초록 글자다.

| 값 | 색 | 값 | 색 |
| --- | --- | --- | --- |
| 0 | 검정 | 8 | 어두운 회색 |
| 1 | 파랑 | 9 | 밝은 파랑 |
| 2 | 초록 | A | 밝은 초록 |
| 3 | 청록 | B | 밝은 청록 |
| 4 | 빨강 | C | 밝은 빨강 |
| 5 | 자홍 | D | 밝은 자홍 |
| 6 | 갈색 | E | 노랑(밝은 갈색) |
| 7 | 밝은 회색 | F | 흰색 |

**하드웨어에 연결된 주소는 `volatile`로 다룬다.** `volatile`이 없으면 컴파일러는 이 주소를 평범한 메모리로 보고 쓰기를 합치거나 순서를 바꾼다. `-O2`로 컴파일하면 바이트 쓰기 4000번이 16바이트 SSE 쓰기 수백 번으로 바뀌고, 문자열 쓰기는 상수 쓰기로 펼쳐진다. VGA 텍스트 버퍼는 이렇게 써도 결과가 같지만, 쓰는 순서와 횟수 자체가 명령인 장치 레지스터에서는 동작이 달라진다. `volatile`을 붙이면 소스에 쓴 대로 한 바이트씩 순서대로 쓴다.

**UEFI로 부팅하면 이 버퍼가 없을 수 있다.** UEFI 펌웨어는 VGA 텍스트 모드를 보장하지 않아서, 0xB8000에 써도 아무것도 보이지 않을 수 있다. 그때는 Multiboot2의 프레임버퍼 태그나 UEFI의 GOP(Graphics Output Protocol)로 받은 픽셀 버퍼에 직접 그린다.

## 링커 스크립트

링커는 보통 운영체제가 정한 기본 배치로 실행 파일을 만든다. 커널은 그 배치를 쓸 수 없으니 링커 스크립트로 직접 정한다.

```text
/* linker.ld */
OUTPUT_FORMAT(elf32-i386)
ENTRY(start)

SECTIONS
{
    . = 1M;                                   /* 0x100000부터 배치 */

    .text   ALIGN(4K) : { KEEP(*(.multiboot)) *(.text) }
    .rodata ALIGN(4K) : { *(.rodata*) }
    .data   ALIGN(4K) : { *(.data) }
    .bss    ALIGN(4K) : { *(COMMON) *(.bss) }
}
```

| 줄 | 뜻 |
| --- | --- |
| `OUTPUT_FORMAT(elf32-i386)` | 32비트 ELF로 출력한다. ELF는 리눅스 같은 유닉스 계열의 표준 실행 파일 형식이고, GRUB은 ELF 헤더를 읽어 각 세그먼트를 지정된 주소에 올린다 |
| `ENTRY(start)` | 진입점 심볼. ELF 헤더의 진입 주소가 된다 |
| `. = 1M;` | `.`은 현재 배치 주소(location counter)다. `SECTIONS` 처음에는 0이고, 여기서 0x100000으로 옮긴다 |
| `*(.text)` | `*`는 모든 입력 파일이다. 모든 오브젝트의 `.text`를 모아 지금 주소에 놓고, `.`은 그 크기만큼 늘어난다 |
| `KEEP(*(.multiboot))` | Multiboot 헤더를 `.text`보다 먼저 둬서 파일 앞 8 KiB 안에 들어가게 한다. `KEEP`은 쓰지 않는 섹션을 지우는 옵션(`--gc-sections`)이 헤더를 지우지 못하게 한다 |
| `.rodata` | 문자열 리터럴 `"my first kernel"`이 들어가는 읽기 전용 섹션. 빠뜨리면 링커가 아무 데나 끼워 넣는다 |

헤더를 별도 섹션으로 빼는 이유가 있다. 헤더를 `.text` 맨 앞에 두는 방식은 툴체인이 `.note.gnu.property` 같은 섹션을 앞쪽에 더하면 헤더가 8 KiB 밖으로 밀려 GRUB이 커널을 알아보지 못할 수 있다. 링크 순서와 ELF의 구조는 [[gcc-compile-and-link|GCC 컴파일과 링크]]에 있다.

## 빌드

호스트의 `gcc`는 리눅스용 사용자 프로그램을 만들도록 설정돼 있다. 커널에는 맞지 않는 기본값이 많아서, 대상만 바꾼 **크로스 컴파일러**(`i686-elf-gcc`) 또는 대상을 지정한 clang(`--target=i686-elf`)을 쓴다. macOS의 링커는 ELF를 만들지 않으므로 macOS에서도 크로스 툴체인이나 `ld.lld`가 필요하다.

```bash
nasm -f elf32 boot.asm -o boot.o
i686-elf-gcc -c kernel.c -o kernel.o -std=gnu11 -ffreestanding -O2 -Wall -Wextra -mgeneral-regs-only
i686-elf-gcc -T linker.ld -o kernel.elf -ffreestanding -O2 -nostdlib boot.o kernel.o -lgcc
grub-file --is-x86-multiboot kernel.elf && echo "Multiboot OK"
```

| 옵션 | 이유 |
| --- | --- |
| `-ffreestanding` | 표준 라이브러리가 없는 환경이라고 알린다. 컴파일러가 `memcpy` 같은 라이브러리 함수가 있다고 가정하는 것을 줄이고, `main`이 아니어도 된다 |
| `-nostdlib` | C 런타임 시작 코드와 libc를 링크하지 않는다. `-lgcc`는 컴파일러가 64비트 나눗셈 같은 연산에 부르는 도우미 함수를 위해 남긴다 |
| `-mgeneral-regs-only` | SSE·x87 레지스터를 쓰지 않는다. **부트로더가 넘겨준 직후에는 SSE가 켜져 있지 않아** 그런 명령을 실행하면 예외(#UD)가 난다. `clang --target=i386-elf -O2`는 기본 CPU가 pentium4라서 위 화면 지우기 반복문을 `movaps`로 바꾼다 |
| 호스트 `gcc -m32`를 쓸 때 | `-fno-pie -fno-stack-protector`를 더한다. 많은 배포판 GCC가 위치 독립 실행 파일(PIE)을, Ubuntu 같은 일부는 스택 보호까지 기본으로 켜는데, 커널에는 그 지원 코드(`__stack_chk_fail` 등)가 없다. 링크는 `ld -m elf_i386 -T linker.ld` |

`grub-file --is-x86-multiboot`은 GRUB이 이 파일을 Multiboot 커널로 알아보는지 확인한다. 헤더 위치나 checksum이 틀렸으면 여기서 걸린다.

## 실행

**QEMU에 바로 넣는다.** QEMU는 Multiboot(1) 커널을 직접 올릴 수 있다.

```bash
qemu-system-i386 -kernel kernel.elf
```

**GRUB이 든 부팅 이미지를 만든다.** 실제 부팅 경로와 같고, Multiboot2 커널도 이 방법으로 돌린다. `grub-mkrescue`는 xorriso를 쓴다.

```bash
mkdir -p isodir/boot/grub
cp kernel.elf isodir/boot/
cat > isodir/boot/grub/grub.cfg <<'EOF'
menuentry "my kernel" {
    multiboot /boot/kernel.elf
}
EOF
grub-mkrescue -o mykernel.iso isodir
qemu-system-i386 -cdrom mykernel.iso
```

**설치된 GRUB 메뉴에 넣을 때**는 `/boot/grub/grub.cfg`를 직접 고치지 않는다. 이 파일은 생성물이라 다음 갱신 때 덮어써진다. 항목을 `/etc/grub.d/40_custom`에 적고 `update-grub`(Debian·Ubuntu) 또는 `grub-mkconfig -o /boot/grub/grub.cfg`로 다시 만든다. 커널 파일 이름은 자유다. `vmlinuz-<버전>` 같은 이름 규칙은 리눅스 커널을 자동으로 찾는 스크립트의 것이고, 직접 적은 `menuentry`에는 적용되지 않는다. 실습은 실제 기계보다 가상 머신에서 한다.

과거의 GRUB Legacy는 `menu.lst`에 `title`·`root (hd0,0)`·`kernel` 줄로 항목을 적었다. 지금의 GRUB 2는 위처럼 `menuentry` 블록과 `multiboot` 명령을 쓴다.

## 다음 단계

글자 한 줄을 쓰는 커널에서 운영체제다운 커널로 가려면 부트로더에게 빌린 환경을 하나씩 자기 것으로 바꾼다.

| 단계 | 하는 일 | 관련 개념 |
| --- | --- | --- |
| GDT | 자기 세그먼트 디스크립터 테이블을 만들고 세그먼트 레지스터를 다시 읽는다 | 보호 모드 권한(링 0·3) |
| IDT와 인터럽트 | 예외·하드웨어 인터럽트 처리기를 등록하고, 인터럽트 컨트롤러(PIC·APIC)를 설정한 뒤 `sti`로 켠다 | [[system-structure\|컴퓨터 시스템 구조와 인터럽트]] |
| 키보드 입력 | 키보드 인터럽트에서 포트 I/O(`in`)로 스캔 코드를 읽는다 | 포트 입출력과 MMIO |
| 메모리 관리 | Multiboot 메모리 지도로 쓸 수 있는 물리 메모리를 파악하고 페이징을 켠다 | [[virtual-memory\|가상 메모리]] |
| 64비트 | 페이지 테이블을 만들고 롱 모드로 넘어간다 | 롱 모드 |

## 정리

- x86은 0xFFFFFFF0에서 깨어나 펌웨어를 실행하고, BIOS 경로에서는 0x55, 0xAA로 끝나는 부트 섹터를 0x7C00에 올린다. 부트로더가 커널을 ELF가 지정한 주소(보통 1 MiB)에 올리고 보호 모드로 넘겨준다. 지금 PC는 대부분 UEFI가 이 앞부분을 맡는다.
- Multiboot는 부트로더와 커널의 계약이다. 커널은 처음 8 KiB 안에 0x1BADB002 헤더를 두고, 부트로더는 EAX에 0x2BADB002, EBX에 정보 구조체 주소를 넣고 인터럽트를 끈 보호 모드로 점프한다. 스택은 정해 주지 않는다.
- 어셈블리 진입점은 스택을 16바이트 정렬로 잡고 C 함수를 부른 뒤 `cli`·`hlt` 반복으로 멈춘다.
- VGA 텍스트 버퍼(0xB8000)는 80×25칸, 칸마다 문자와 속성 바이트다. 하드웨어 주소는 `volatile`로 다룬다.
- 커널은 크로스 컴파일러로 `-ffreestanding -nostdlib -mgeneral-regs-only`를 주어 만들고, 링커 스크립트로 1 MiB에 배치하며, QEMU `-kernel`이나 `grub-mkrescue` 이미지로 실행한다.

관련 노트: [[os-overview|운영체제 개요]], [[disk-scheduling|디스크 관리와 스케줄링]], [[daemon-and-systemd|데몬과 systemd]], [[system-structure|컴퓨터 시스템 구조와 인터럽트]], [[virtual-memory|가상 메모리]], [[gcc-compile-and-link|GCC 컴파일과 링크]], [[calling-convention|호출 규약과 스택 프레임]], [[compiler-architecture|컴파일러의 구조]]
