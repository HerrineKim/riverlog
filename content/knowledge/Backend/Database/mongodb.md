---
title: "MongoDB 시작하기와 CRUD"
concept: "MongoDB"
summary: "문서형 NoSQL인 MongoDB를 Atlas 클라우드에 만들고 접속 설정을 한 뒤, 기본 CRUD 명령과 Mongoose로 다루는 방법."
tags: ["mongodb", "nosql", "database", "backend"]
source: til
date: "2026-10-13"
---

MongoDB는 데이터를 JSON과 비슷한 **문서(document, 내부적으로 BSON)** 단위로 저장하는 NoSQL DB다. 문서들이 모여 **컬렉션(collection)을**, 컬렉션들이 모여 **데이터베이스**를 이룬다. RDB에 대응하면 테이블 ≈ 컬렉션, 행 ≈ 문서, 열 ≈ 필드다.

## Atlas(클라우드)로 시작하기

MongoDB Atlas는 MongoDB를 직접 설치하지 않고 클라우드에서 쓰는 관리형 서비스다. 무료 클러스터로 충분히 실습할 수 있다.

1. 회원가입 → Organization·Project 생성 → **무료(Free/M0) 클러스터** 생성
2. **Network Access**: 접속을 허용할 IP 등록. 실습에서는 *Allow access from anywhere*(`0.0.0.0/0`)를 쓰기도 하지만, 운영에서는 서버 IP만 허용한다.
3. **Database Access**: DB 사용자(아이디·비밀번호) 생성
4. **Connect**: 접속 방법 선택
   - *Compass*: 공식 GUI 클라이언트. 접속 문자열을 붙여 넣어 데이터를 눈으로 확인·편집
   - *Drivers*: 애플리케이션용 접속 문자열 `mongodb+srv://<user>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority`

접속 문자열에는 비밀번호가 들어가므로 코드에 쓰지 말고 [환경 변수](Backend/NestJS/config-env)로 관리한다.

## 기본 CRUD (mongosh)

```javascript
use cats                                   // DB 선택 (없으면 첫 저장 시 생성)

// Create
db.users.insertOne({ name: 'blue', age: 8 })
db.users.insertMany([{ name: 'som', age: 4 }, { name: 'lean', age: 6 }])

// Read
db.users.find()                            // 전체
db.users.find({ age: { $gte: 5 } })        // 조건 (age >= 5)
db.users.findOne({ name: 'blue' })

// Update
db.users.updateOne({ name: 'blue' }, { $set: { age: 9 } })

// Delete
db.users.deleteOne({ name: 'lean' })
```

- 문서마다 고유한 `_id`(ObjectId)가 자동으로 붙는다.
- 비교 연산자는 `$gt`, `$gte`, `$lt`, `$lte`, `$in` 등, 수정 연산자는 `$set`, `$inc`, `$push` 등을 쓴다.
- Compass에서도 같은 작업을 GUI로 할 수 있다.

## 애플리케이션에서: Mongoose

Node.js에서는 보통 **Mongoose**(ODM)를 쓴다. 스키마를 정의해 문서 구조와 검증 규칙을 정하고, 조회한 문서를 JavaScript 객체로 다룬다.

```javascript
const cat = await Cat.create({ email, name, password });
const found = await Cat.findOne({ email });
const exists = await Cat.exists({ email });   // { _id } 또는 null
```

NestJS에서의 사용법은 [Mongoose 스키마](Backend/NestJS/mongoose-schema) 노트에 정리했다.

## 핵심 정리

- MongoDB = DB > 컬렉션 > 문서(BSON). 스키마가 유연하다.
- Atlas: 클러스터 생성 → IP 허용 → DB 사용자 → 접속 문자열.
- CRUD: `insertOne/find/updateOne($set)/deleteOne`.
