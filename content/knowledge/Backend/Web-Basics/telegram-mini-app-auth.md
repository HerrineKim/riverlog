---
title: "텔레그램 미니앱 인증 흐름"
concept: "Telegram Mini App"
summary: "텔레그램이 서명한 initData를 클라이언트가 서버로 보내고, 서버가 봇 토큰 기반 HMAC-SHA256으로 위변조와 만료를 검증한 뒤 자체 세션·JWT를 발급하는 미니앱 인증 패턴."
tags: ["auth", "security", "nextjs", "backend"]
source: notion
date: "2026-10-13"
---

**텔레그램 미니앱(Telegram Mini App)** 은 텔레그램 안에서 열리는 웹앱이다. 별도 로그인 화면 없이, 텔레그램이 앱을 열 때 넘겨주는 `initData`(사용자 정보 + 서명)로 사용자를 인증한다. 클라이언트가 받은 사용자 정보를 그대로 믿지 않고, **서버가 봇 토큰으로 서명을 검증**한 뒤에만 신뢰한다. 코드 예시는 Next.js 기준이지만 흐름은 어떤 서버에서나 같다.

## 전체 흐름

```text
[텔레그램] 미니앱 실행 → initData(서명 포함) 전달
   ↓
[클라이언트] SDK 초기화 → initData 원본을 서버로 전송
   ↓
[서버] initData 파싱 → auth_date 만료 확인 → HMAC 해시 계산·비교
   ↓ 성공                                  ↓ 실패
사용자 생성·조회 → 자체 세션·JWT 발급        403 Forbidden
   ↓
[클라이언트] 이후 요청은 세션 쿠키·토큰으로 인증
```

## 1. 클라이언트: initData 얻어서 보내기

```typescript
const WebApp = (await import('@twa-dev/sdk')).default // 브라우저에서만 로드되도록 동적 import
WebApp.ready() // 로딩 완료를 텔레그램에 알림

const initData = WebApp.initData                   // 서명된 원본 문자열 → 서버 검증용
const user = WebApp.initDataUnsafe.user            // 파싱된 값 → 화면 표시용으로만

const response = await fetch('/api/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ telegramInitData: initData }),
})
if (!response.ok) throw new Error('Telegram auth failed')
```

- `initDataUnsafe`는 이름 그대로 **검증되지 않은 값**이다. 화면에 이름을 보여 주는 정도로만 쓰고, 권한 판단에는 쓰지 않는다.
- 서버에는 반드시 원본 문자열 `initData`를 보낸다.

## 2. 서버: initData 검증

텔레그램 공식 문서의 검증 절차:

1. `initData`를 쿼리 스트링으로 파싱하고 `hash` 값을 꺼낸다.
2. **`hash`를 제외한** 나머지 `key=value` 쌍을 key 기준으로 정렬해 `\n`으로 이어 붙인다(data-check-string).
3. `secret_key = HMAC_SHA256(key="WebAppData", message=봇 토큰)`
4. `HMAC_SHA256(key=secret_key, message=data-check-string)`의 hex 값이 `hash`와 같으면 텔레그램이 보낸 진짜 데이터다.
5. `auth_date`가 너무 오래되었으면 재사용(리플레이)을 막기 위해 거절한다.

```typescript
import crypto from 'crypto'

const MAX_AGE_SECONDS = 60 * 60 * 3 // 3시간 (서비스에 맞게 조정)

export function validateTelegramInitData(telegramInitData: string, botToken: string) {
  const params = new URLSearchParams(telegramInitData)
  const hash = params.get('hash')
  if (!hash) return { ok: false, message: 'Missing hash' } as const

  const authDate = Number(params.get('auth_date'))
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) {
    return { ok: false, message: 'Telegram data is too old' } as const
  }

  params.delete('hash') // 서명 대상에서 hash 자체는 빼야 한다
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  const valid =
    calculated.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash))
  if (!valid) return { ok: false, message: 'Hash validation failed' } as const

  const user = JSON.parse(params.get('user') ?? '{}')
  return { ok: true, user } as const
}
```

- `hash`까지 포함해 data-check-string을 만들면 해시가 **절대 일치하지 않는다.** `hash`는 반드시 뺀다.
- 해시 비교는 `===` 대신 `crypto.timingSafeEqual`로 해 응답 시간 차이로 값을 추측하는 타이밍 공격을 막는다.
- 봇 토큰이 설정되지 않았으면 검증하지 말고 서버 설정 오류로 처리한다.
- `initData`에는 `hash` 외에 `signature` 필드도 들어 있다. 위 HMAC 검증에서는 `hash`만 빼고 `signature`를 포함한 나머지 필드를 그대로 쓴다.

### 봇 토큰 없이 검증하기 (서드파티용)

봇 토큰을 공유할 수 없는 외부 서비스는 `signature`(Ed25519 서명, base64url)를 텔레그램이 공개한 공개키로 검증할 수 있다. 이때 data-check-string은 첫 줄에 `<bot_id>:WebAppData`를 두고, 그 아래에 `hash`와 `signature`를 **둘 다 뺀** 필드를 정렬해 이어 붙인다. `auth_date` 만료 확인은 똑같이 한다. ([Telegram Mini Apps: Validating data](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app))

## 3. API 라우트: 검증 후 세션 발급

```typescript
// app/api/auth/telegram/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { telegramInitData } = await req.json()
  const result = validateTelegramInitData(telegramInitData, process.env.BOT_TOKEN!)
  if (!result.ok) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 })
  }

  const telegramId = result.user.id?.toString()
  if (!telegramId) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
  }

  const user = await findOrCreateUser(telegramId)
  const res = NextResponse.json(user)
  res.cookies.set('session', await createSession(user.id), { httpOnly: true, secure: true, sameSite: 'none' })
  return res
}
```

이후 API는 두 방식 중 하나로 인증한다.

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| 요청마다 `initData` 검증 | 서버 상태가 없다 | `auth_date` 만료 뒤에는 미니앱을 다시 열어야 한다 |
| 첫 검증 뒤 자체 세션·JWT 발급 | 수명·무효화를 서버가 정한다 | 세션 저장소나 토큰 관리가 필요하다 |

웹 버전 텔레그램에서는 미니앱이 iframe 안에서 열려 쿠키가 서드파티로 취급된다. 그래서 `SameSite=None; Secure`를 주고, 브라우저가 서드파티 쿠키를 막으면 `Authorization` 헤더 토큰으로 바꾼다. 두 방식의 비교는 [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]]에 있다.

## 개발 환경 인증 우회 주의

텔레그램 밖(일반 브라우저)에서는 `initData`가 없어서, 개발 중에는 환경 변수(`BYPASS_TELEGRAM_AUTH=true` 등)로 검증을 건너뛰게 만들곤 한다.

- 우회 플래그는 **서버 쪽 변수로만** 판단한다. `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저 번들에 그대로 노출된다.
- 운영 환경에서는 플래그가 켜져 있어도 무시하도록 `NODE_ENV === 'production'`일 때 우회를 막아 둔다. 우회가 운영에 새면 누구나 아무 사용자로 로그인할 수 있다.

## 핵심 정리

- 클라이언트는 서명된 `initData` 원본을 서버로 보내고, `initDataUnsafe`는 표시용으로만 쓴다.
- 서버는 `hash`를 뺀 정렬된 data-check-string을 봇 토큰 기반 HMAC-SHA256으로 검증하고, `auth_date`로 만료를 확인한다.
- 실패하면 403. 성공하면 자체 세션·JWT를 발급해 이후 요청을 인증한다.
- 개발용 우회 플래그는 서버 전용·운영 차단.

관련 노트: [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]], [[auth-jwt-passport|NestJS JWT 인증과 Passport]], [[cookie-session|쿠키와 세션]], [[nextjs|Next.js를 쓰는 이유]], [[security|정보 시스템 보안(해시·암호 알고리즘)]]
