---
title: "React에서 음성 녹음하고 파일로 보내기"
concept: "MediaRecorder"
summary: "getUserMedia로 마이크 권한을 얻고 MediaRecorder로 녹음해 Blob을 만든 뒤, 다운로드 링크로 저장하거나 FormData(multipart/form-data)로 서버에 보내는 흐름. react-media-recorder로 간단히 쓰는 방법까지."
tags: ["react", "browser", "api", "frontend", "javascript"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/110", "https://riverkim.kr/113", "https://webactually.com/2021/02/10/%EB%A6%AC%EC%95%A1%ED%8A%B8-%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98%EA%B3%BC-%EB%8B%A4%EC%9D%B4%EC%96%BC%EB%A1%9C%EA%B7%B8%ED%94%8C%EB%A1%9C-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8/"]
---

> riverkim.kr에 쓴 글들과, 「5. 응용」 부분은 Nwani Victory의 「리액트 애플리케이션과 다이얼로그플로 에이전트 연결하기」(웹액츄얼리 번역, 2021.02)를 바탕으로 재구성한 노트입니다.

브라우저에서 음성을 녹음하려면 별도 플러그인 없이 웹 표준 API 두 개면 된다. `navigator.mediaDevices.getUserMedia()`로 마이크 스트림을 얻고, `MediaRecorder`로 그 스트림을 녹음해 **Blob**(파일처럼 다룰 수 있는 바이너리 데이터)으로 받는다. 받은 Blob은 다운로드 링크로 저장하거나 `FormData`에 담아 서버로 보낸다.

## 흐름

```text
getUserMedia({ audio: true })     ← 마이크 권한 요청 (HTTPS 또는 localhost에서만 동작)
  └─ MediaStream
      └─ new MediaRecorder(stream).start()
          └─ stop() → dataavailable 이벤트로 Blob 전달 (Chrome 기준 audio/webm)
              ├─ URL.createObjectURL(blob) → <audio> 재생 / <a download> 저장
              └─ new FormData().append('file', blob) → 서버 업로드
```

## 1. 직접 구현: MediaRecorder

```tsx
import { useRef, useState } from 'react'

export function Recorder() {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [audio, setAudio] = useState<Blob | null>(null)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.onstop = () => {
      setAudio(new Blob(chunksRef.current, { type: recorder.mimeType }))
      stream.getTracks().forEach((track) => track.stop()) // 마이크 사용 표시 끄기
    }
    recorder.start()
    recorderRef.current = recorder
  }

  const stop = () => recorderRef.current?.stop()

  return (
    <div>
      <button onClick={start}>녹음 시작</button>
      <button onClick={stop}>녹음 중지</button>
      {audio && <audio src={URL.createObjectURL(audio)} controls />}
    </div>
  )
}
```

- `stop()`을 부르면 `dataavailable` 이벤트로 녹음 데이터가 들어오고, 이어서 `stop` 이벤트가 온다. Blob은 `onstop`에서 합친다.
- 스트림의 모든 트랙에 `stop()`을 불러야 브라우저의 "마이크 사용 중" 표시가 꺼진다.
- 녹음 형식은 브라우저가 정한다. Chrome은 `audio/webm`(확장자 `.weba`/`.webm`), Safari는 `audio/mp4`다. 확장자만 `.mp3`로 바꿔도 형식은 바뀌지 않는다. 서버에서 특정 형식이 필요하면 서버에서 변환한다.
- 녹음 길이 제한(예: 60초)은 `setTimeout`으로 `stop()`을 예약해 구현한다. 옛 예제에서 보이는 `AudioContext.createScriptProcessor`의 `onaudioprocess`로 시간을 재는 방식은 **deprecated** API다(대체는 `AudioWorklet`). 시간 제한만 필요하면 오디오 처리 API는 쓸 필요가 없다.

## 2. 라이브러리: react-media-recorder

녹음 상태 관리가 귀찮으면 `react-media-recorder`의 render props 컴포넌트(또는 `useReactMediaRecorder` 훅)를 쓴다.

```tsx
import { ReactMediaRecorder } from 'react-media-recorder'

export function SimpleRecorder() {
  return (
    <ReactMediaRecorder
      audio
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button onClick={startRecording}>Start</button>
          <button onClick={stopRecording}>Stop</button>
          <audio src={mediaBlobUrl} controls />
          <a href={mediaBlobUrl} download="recording.webm">Download</a>
        </div>
      )}
    />
  )
}
```

`mediaBlobUrl`은 녹음 결과 Blob을 가리키는 `blob:` URL이다. 서버로 보내려면 `fetch(mediaBlobUrl).then((r) => r.blob())`으로 Blob을 다시 꺼낸다.

## 3. 파일로 저장하기

```ts
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename // 이 속성이 있으면 이동하지 않고 내려받는다
  a.click()
  URL.revokeObjectURL(url) // 메모리 해제
}
```

`URL.createObjectURL`로 만든 URL은 페이지가 살아 있는 동안 메모리를 붙잡고 있으므로 다 쓰면 `revokeObjectURL`로 해제한다.

## 4. 서버로 보내기: FormData

파일은 JSON에 담을 수 없으므로 **`multipart/form-data`** 형식으로 보낸다. 브라우저의 `FormData` 객체가 이 형식을 만들어 준다.

```ts
const formData = new FormData()
formData.append('file', audio, 'recording.webm') // (필드 이름, Blob/File, 파일 이름)
formData.append('title', '음성 메모') // 다른 필드도 함께 보낼 수 있다

await fetch('/api/voice', { method: 'POST', body: formData })
// axios: await axios.post('/api/voice', formData)
```

- `Content-Type` 헤더를 **직접 지정하지 않는다**. 브라우저가 `multipart/form-data; boundary=...`를 자동으로 붙이는데, 직접 쓰면 boundary가 빠져 서버가 해석하지 못한다.
- JSON 객체를 같이 보내야 하면 `formData.append('data', new Blob([JSON.stringify(obj)], { type: 'application/json' }))`처럼 Blob으로 감싼다.
- `FormData` 내용은 `console.log(formData)`로 보이지 않는다. `for (const [k, v] of formData) console.log(k, v)`로 확인한다.
- HTML 폼으로 파일을 보낼 때의 `enctype`은 [HTML](/knowledge/dictionary/frontend/web/html) 참고.

## 5. 응용: 음성·텍스트를 대화형 에이전트로 보내기

녹음한 음성을 챗봇에 보내는 구조다. Dialogflow 같은 대화형 에이전트 서비스든 LLM API든 모양은 같다. **브라우저가 에이전트 서비스를 직접 부르지 않고, 내 백엔드를 거친다.**

```text
React 채팅 UI ── 텍스트(JSON) / 음성(FormData) ──▶ 내 서버(Express 등)
                                                     │  서비스 계정 키로 인증, 세션 ID 관리
                                                     ▼
                                              대화형 에이전트 서비스
                                    (음성→텍스트, 의도 파악, 응답 생성)
                                                     │
React ◀──────────── 응답 메시지 ─────────────────────┘
```

| 결정 | 이유 |
| --- | --- |
| 서버를 거친다 | 서비스 계정 키·API 키는 브라우저에 두면 누구나 꺼내 쓴다. 키는 서버 환경 변수에 두고 Git에 올리지 않는다 |
| 세션 ID를 만든다 | 대화마다 UUID를 붙여 에이전트가 앞뒤 맥락을 잇고, 대화 기록을 추적한다 |
| 음성은 스트림으로 넘긴다 | 서버는 multipart 본문을 파싱(busboy·multer)해 파일 스트림을 에이전트의 스트리밍 인식 API로 바로 연결한다. 디스크에 저장하지 않아도 된다 |
| 오류를 삼키지 않는다 | 에이전트 호출 실패를 잡아 사용자에게 "다시 말해 달라"는 응답으로 돌려준다 |

Dialogflow 용어로는 사용자의 말을 분류하는 단위가 **인텐트(intent)**, 말에서 뽑아내는 값(금액·날짜)이 **엔터티(entity)**, 인텐트가 맞았을 때 외부 데이터를 가져오는 웹훅이 **풀필먼트(fulfillment)**, 인텐트 사이의 흐름을 잇는 상태가 **컨텍스트(context)** 다.

UI 쪽에서는 메시지 배열, 로딩 상태("입력 중…"), 녹음 중 상태("듣는 중…")를 스토어에 두고, 입력칸이 비었으면 마이크 버튼, 글자가 있으면 전송 버튼을 보여 준다.

## 정리

- 녹음 = `getUserMedia`(권한·스트림) + `MediaRecorder`(녹음) → Blob.
- 끝나면 스트림 트랙을 모두 멈추고, 만든 object URL은 해제한다.
- 형식은 브라우저가 정한다(Chrome은 webm). 확장자를 바꾼다고 형식이 바뀌지 않는다.
- 업로드는 `FormData`에 담아 보내고, `Content-Type`은 브라우저에 맡긴다.
- 외부 AI·음성 서비스는 키를 가진 내 서버를 거쳐 부른다.

관련 노트: [[hooks|Hooks]], [[html|HTML]], [[ajax|AJAX와 HTTP 요청]], [[realtime-chat-app|실시간 채팅 앱의 데이터 흐름: REST와 WebSocket 역할 나누기]], [[api-security|API 보안 체크리스트]]
