---
title: "NestJS 파일 업로드(Multer)"
concept: "File Upload"
summary: "multipart/form-data 요청을 Multer와 FileInterceptor로 받아 이미지·영상 같은 미디어 파일을 저장하는 방법."
tags: ["nestjs", "file-upload", "api", "backend"]
source: til
---

이미지·mp3·mp4 같은 파일은 JSON이 아니라 `multipart/form-data` 형식으로 전송된다. Multer는 이 형식을 파싱해 파일을 저장해 주는 Node.js 미들웨어이고, NestJS는 `@nestjs/platform-express`에 이를 감싼 인터셉터를 내장하고 있다.

## 설치

```bash
npm i -D @types/multer   # 타입 정의 (Multer 자체는 @nestjs/platform-express에 포함)
```

## 저장 위치 설정

```typescript
// cats.module.ts
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }), // dest: 파일을 저장할 디렉터리
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
    forwardRef(() => AuthModule),
  ],
})
export class CatsModule {}
```

파일명·폴더 구조를 직접 정하려면 `multer`의 `diskStorage({ destination, filename })`를 옵션으로 넘기는 별도 옵션 파일(예: `common/utils/multer.options.ts`)을 만들어 인터셉터에 전달한다.

## 컨트롤러에서 받기

인터셉터 종류와 파라미터 데코레이터를 **짝을 맞춰** 써야 한다.

| 경우 | 인터셉터 | 파라미터 |
| --- | --- | --- |
| 단일 파일 | `FileInterceptor('image')` | `@UploadedFile() file: Express.Multer.File` |
| 같은 필드의 여러 파일 | `FilesInterceptor('image', 10)` | `@UploadedFiles() files: Express.Multer.File[]` |
| 여러 필드 | `FileFieldsInterceptor([...])` | `@UploadedFiles()` |

```typescript
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiOperation({ summary: '고양이 이미지 업로드' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(FilesInterceptor('image', 10))
@Post('upload')
uploadCatImg(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
  return 'uploadImg';
}
```

- 인자 `'image'`는 form-data의 **필드 이름**과 같아야 한다.
- Postman에서 테스트할 때는 Body → form-data → key 타입을 *File*로 바꾸고 필드 이름을 `image`로 맞춘다.

> 고친 점: 원래 필기는 `FileInterceptor`(단일)와 `@UploadedFiles()`(복수)를 섞어 썼고, 파라미터 이름(`image`)과 로그에 찍는 변수(`files`)도 달랐다. 위 표처럼 짝을 맞춰야 값이 들어온다.

## 정적 파일로 제공하기

업로드한 파일을 URL로 접근하게 하려면 `main.ts`에서 정적 경로를 연다.

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(path.join(__dirname, '..', 'uploads'), { prefix: '/media' });
```

운영 환경에서는 서버 디스크 대신 S3 같은 오브젝트 스토리지에 올리고 URL만 DB에 저장하는 방식이 일반적이다.

## 핵심 정리

- 파일 업로드 = `multipart/form-data` + Multer.
- `FileInterceptor`↔`@UploadedFile`, `FilesInterceptor`↔`@UploadedFiles`를 짝지어 쓴다.

참고: [NestJS File upload 문서](https://docs.nestjs.com/techniques/file-upload)
