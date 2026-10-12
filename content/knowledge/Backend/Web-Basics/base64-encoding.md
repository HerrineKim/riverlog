---
title: "Base64 인코딩"
concept: "Base64"
summary: "바이너리 데이터를 ASCII 문자 64개만으로 바꿔 텍스트용 채널로 안전하게 보내는 인코딩. 6비트씩 끊어 변환하는 원리, 패딩, 약 33% 커지는 비용, 이미지를 API에 보내는 예를 정리한다."
tags: ["backend", "web", "http", "api", "encoding"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/97"]
---

> riverkim.kr에 쓴 글을 다시 정리한 노트입니다.

## Base64란

Base64는 이미지·ZIP·실행 파일 같은 **8비트 바이너리 데이터를, 어느 시스템에서나 똑같이 읽히는 ASCII 문자열로 바꾸는 인코딩**이다. 이름 그대로 64진법을 쓴다. 암호화가 아니라 표현 방식을 바꾸는 것뿐이라 누구나 원래 데이터로 되돌릴 수 있다.

HTML, 이메일, JSON처럼 **문자를 위한 매체에 바이너리를 실어 보내야 할 때** 쓴다. 대표적인 예가 이미지를 JSON 바디에 담아 API로 보내는 경우, `data:image/png;base64,...` 형태의 Data URI, JWT의 헤더·페이로드다.

## 변환 원리

| 단계 | 내용 |
| --- | --- |
| 1. 6비트씩 자르기 | 바이너리를 6비트(2^6 = 64) 단위로 나눈다. 3바이트(24비트)가 문자 4개가 된다 |
| 2. 색인표로 치환 | 각 6비트 값을 `A–Z`, `a–z`, `0–9`, `+`, `/` 64개 문자 중 하나로 바꾼다 |
| 3. 패딩 | 데이터 길이가 3바이트 단위로 딱 떨어지지 않으면 남는 자리를 `=`로 채운다 |

```text
"Man"  →  01001101 01100001 01101110
       →  010011 010110 000101 101110
       →  T      W      F      u        →  "TWFu"
```

URL이나 파일 이름에 넣을 때는 `+`, `/` 대신 `-`, `_`를 쓰는 **Base64URL** 변형을 쓴다. JWT가 이 방식이다([[auth-jwt-passport|NestJS JWT 인증과 Passport]]).

## 왜 굳이 쓰나

Base64로 바꾸면 6비트를 표현하는 데 8비트 문자 하나를 쓰므로 **데이터가 약 1/3(33%) 커진다.** 그런데도 쓰는 이유는 전송 중 데이터가 깨지는 것을 막기 위해서다.

- ASCII는 7비트 체계라 남는 1비트를 처리하는 방식이 시스템마다 달랐다.
- 일부 제어 문자는 시스템마다 다른 코드값을 갖거나, 중간 서버가 줄바꿈 등으로 바꿔 버릴 수 있다.
- 출력 가능한 64개 문자만 쓰면 **플랫폼과 상관없이 같은 값이 전송·저장된다**는 것이 보장된다.

크기가 늘어나므로 큰 파일은 Base64로 JSON에 넣기보다 `multipart/form-data`나 스토리지 업로드 URL로 보내는 편이 낫다([[file-upload-multer|NestJS 파일 업로드(Multer)]]).

## 예: 이미지를 OCR API로 보내기

Google Cloud Vision API는 이미지를 URI로 넘기거나 바디에 직접 넣을 수 있다. 로컬 기기에서 찍은 사진의 URI는 외부 서버가 읽을 수 없으므로, **이미지 자체를 Base64 문자열로 바꿔 `content` 필드에 담아야 한다.** React Native(Expo)에서는 카메라·갤러리 API에 `base64: true` 옵션을 주면 인코딩된 문자열을 함께 돌려준다.

```javascript
// expo-camera / expo-image-picker
const photo = await camera.takePictureAsync({ quality: 0.5, base64: true });

await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
  method: 'POST',
  body: JSON.stringify({
    requests: [{
      image: { content: photo.base64 },        // URI가 아니라 Base64 문자열
      features: [{ type: 'TEXT_DETECTION' }],
    }],
  }),
});
```

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 공식 문서대로 이미지 URI를 보냈는데 API가 이미지를 읽지 못함 | 기기 로컬 URI(`file://`)는 외부 서버가 접근할 수 없다 | 촬영·선택 시 `base64: true`로 받아 `image.content`에 넣는다 |

## 정리

- Base64는 바이너리를 ASCII 64문자로 바꾸는 **인코딩**이다. 암호화가 아니다.
- 6비트씩 잘라 치환하고, 길이가 맞지 않으면 `=`로 패딩한다.
- 크기가 약 33% 늘어나는 대신, 텍스트 전용 채널에서도 데이터가 깨지지 않는다.
- 작은 이미지·토큰에는 편하지만 큰 파일은 바이너리 업로드 방식이 낫다.

관련 노트: [[data-representation|데이터의 표현]], [[auth-jwt-passport|NestJS JWT 인증과 Passport]], [[http-web-architecture|웹 앱의 요청·응답 구조]]
