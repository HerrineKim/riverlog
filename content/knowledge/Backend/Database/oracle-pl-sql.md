---
title: "PL/SQL: 블록, 커서, 프로시저와 함수"
concept: "PL/SQL"
summary: "PL/SQL은 SQL에 변수·조건문·반복문·예외 처리를 더한 Oracle의 절차형 언어로, 블록 단위로 쓰고 커서로 결과를 한 행씩 다루며 프로시저·함수·패키지·트리거로 DB 안에 저장해 호출한다."
tags: ["database", "sql", "backend", "oracle"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 데이터베이스 설계구축 강의(나홍석 교수, 2023-2학기)"]
---

> 고려사이버대학교 「데이터베이스 설계구축」(2023-2학기) 강의 내용을 바탕으로 정리했다.

SQL은 "무엇을 원하는지"만 적는 언어라 "이 행이면 이렇게, 저 행이면 저렇게"를 표현하기 어렵다. **PL/SQL**(Procedural Language extension to SQL)은 SQL 문을 그대로 쓰면서 변수, `IF`, `LOOP`, 예외 처리를 더한 Oracle의 언어다. PostgreSQL의 PL/pgSQL, SQL Server의 T-SQL이 같은 자리에 있다. 저장 프로시저를 언제 쓰고 언제 피하는지는 [[sql-basics#저장 프로시저|SQL 기초]]에 있다.

장점은 데이터 가까이에서 돈다는 것이다. 애플리케이션이 SQL을 열 번 보내면 네트워크 왕복이 열 번이지만, PL/SQL 블록은 한 번 보내면 서버 안에서 다 끝난다.

## 블록 구조

모든 PL/SQL 코드는 블록이다.

| 부분 | 시작 | 필수 | 내용 |
| --- | --- | --- | --- |
| 선언부 | `DECLARE` | 선택 | 변수·상수·커서·타입 선언 |
| 실행부 | `BEGIN` | 필수 | 실제 로직. SQL과 제어문 |
| 예외 처리부 | `EXCEPTION` | 선택 | 실행부에서 난 오류 처리 |
| | `END;` | 필수 | 블록 끝 |

```sql
DECLARE
  v_total  orders.amount%TYPE;          -- 컬럼 타입을 그대로 따른다
  c_vat    CONSTANT NUMBER := 0.1;
BEGIN
  SELECT SUM(amount) INTO v_total
  FROM orders
  WHERE customer_id = 42;

  DBMS_OUTPUT.PUT_LINE('부가세 포함: ' || v_total * (1 + c_vat));
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('주문 없음');
END;
/
```

이름 없이 한 번 실행하는 블록을 **익명 블록**, 이름을 붙여 DB에 저장한 것을 **서브프로그램**(프로시저·함수 등)이라고 한다. SQL*Plus나 SQL Developer에서 `DBMS_OUTPUT` 결과를 보려면 `SET SERVEROUTPUT ON`을 먼저 켠다.

`SELECT ... INTO`는 결과가 **정확히 한 행**이어야 한다. 0행이면 `NO_DATA_FOUND`, 2행 이상이면 `TOO_MANY_ROWS` 예외가 난다. 여러 행은 커서나 `BULK COLLECT`로 받는다.

## 변수와 타입

| 선언 | 뜻 |
| --- | --- |
| `v_name VARCHAR2(30);` | 일반 변수 |
| `c_rate CONSTANT NUMBER := 0.1;` | 상수. 선언할 때 값을 줘야 한다 |
| `v_amt orders.amount%TYPE;` | 컬럼과 같은 타입. 테이블의 컬럼 타입이 바뀌어도 코드를 안 고쳐도 된다 |
| `r_order orders%ROWTYPE;` | 테이블 한 행 전체를 담는 레코드 |

여러 값을 묶는 타입도 있다.

| 타입 | 모양 | 특징 |
| --- | --- | --- |
| 레코드(`RECORD`) | 구조체 | 이름 붙은 필드 묶음. `%ROWTYPE`도 레코드다 |
| `VARRAY` | 최대 크기가 정해진 배열 | 순서가 있고 촘촘하다. 중간 원소만 지울 수 없다 |
| 중첩 테이블(`TABLE OF`) | 크기 제한 없는 배열 | 중간 원소를 지울 수 있어 나중엔 듬성듬성해질 수 있다 |
| 연관 배열(`INDEX BY`) | 키-값 맵 | 문자열이나 정수 키로 접근. 메모리 안에서만 쓴다 |

```sql
DECLARE
  TYPE price_map IS TABLE OF NUMBER INDEX BY VARCHAR2(20);
  prices price_map;
BEGIN
  prices('coffee') := 4500;
  prices('tea')    := 4000;
  DBMS_OUTPUT.PUT_LINE(prices('tea'));
END;
/
```

## 제어문

```sql
-- 조건
IF v_total >= 100000 THEN
  v_grade := 'VIP';
ELSIF v_total >= 30000 THEN
  v_grade := 'GOLD';
ELSE
  v_grade := 'BASIC';
END IF;

-- 값으로 분기
CASE v_grade
  WHEN 'VIP'  THEN v_discount := 0.1;
  WHEN 'GOLD' THEN v_discount := 0.05;
  ELSE v_discount := 0;
END CASE;

-- 반복 세 가지
LOOP  v_i := v_i + 1;  EXIT WHEN v_i > 10;  END LOOP;
WHILE v_i <= 10 LOOP  v_i := v_i + 1;  END LOOP;
FOR i IN 1..10 LOOP  NULL;  END LOOP;     -- REVERSE 1..10 이면 거꾸로
```

`FOR i IN 3..1`처럼 아래 경계가 더 크면 한 번도 돌지 않는다. 거꾸로 돌리려면 `REVERSE`를 쓴다.

## 예외 처리

다른 언어의 `try ... catch`와 같다. 처리하지 못한 예외는 바깥 블록으로, 끝내는 호출한 쪽으로 올라간다.

| 미리 정의된 예외 | 언제 |
| --- | --- |
| `NO_DATA_FOUND` | `SELECT INTO` 결과가 없다 |
| `TOO_MANY_ROWS` | `SELECT INTO` 결과가 둘 이상이다 |
| `DUP_VAL_ON_INDEX` | 유니크 제약 위반 |
| `ZERO_DIVIDE` | 0으로 나눴다 |
| `INVALID_NUMBER` | 문자열을 숫자로 못 바꿨다 |
| `CURSOR_ALREADY_OPEN` | 열린 커서를 또 열었다 |

업무 규칙 위반은 직접 예외를 던진다. `RAISE_APPLICATION_ERROR`는 -20000~-20999 번호와 메시지를 호출한 애플리케이션까지 그대로 전달한다.

```sql
IF v_stock < p_qty THEN
  RAISE_APPLICATION_ERROR(-20001, '재고 부족: ' || p_product_id);
END IF;
...
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;          -- 삼키지 말고 다시 던진다
```

`WHEN OTHERS THEN NULL;`처럼 모든 오류를 조용히 삼키는 코드는 장애를 숨긴다. 로그를 남기고 다시 던지는 게 기본이다.

## 커서

SELECT 결과 집합은 통째로 다뤄진다. **커서**는 결과 집합 위를 움직이는 포인터로, 한 행씩 꺼내 행마다 다른 처리를 할 수 있게 해 준다.

| 종류 | 누가 여나 | 쓰는 법 |
| --- | --- | --- |
| 묵시적 커서 | Oracle이 DML과 `SELECT INTO`마다 자동으로 | 직전 문장의 결과를 `SQL%ROWCOUNT`, `SQL%FOUND`, `SQL%NOTFOUND`로 확인 |
| 명시적 커서 | 개발자가 선언 | 선언 → `OPEN` → `FETCH` 반복 → `CLOSE` |

```sql
-- 묵시적 커서: 몇 행이 바뀌었나
UPDATE orders SET status = 'CANCELLED'
WHERE status = 'PENDING' AND created_at < SYSDATE - 7;
DBMS_OUTPUT.PUT_LINE(SQL%ROWCOUNT || '건 취소');
```

```sql
-- 명시적 커서: 네 단계를 직접
DECLARE
  CURSOR c_late IS
    SELECT id, customer_id FROM orders WHERE status = 'LATE';
  v_id   orders.id%TYPE;
  v_cust orders.customer_id%TYPE;
BEGIN
  OPEN c_late;
  LOOP
    FETCH c_late INTO v_id, v_cust;
    EXIT WHEN c_late%NOTFOUND;     -- 더 없으면 빠져나온다
    notify_customer(v_cust, v_id);
  END LOOP;
  CLOSE c_late;
END;
/
```

커서 FOR 루프를 쓰면 `OPEN`·`FETCH`·`CLOSE`와 변수 선언을 자동으로 해 준다. 예외가 나도 커서가 닫히므로 보통 이쪽을 쓴다.

```sql
BEGIN
  FOR r IN (SELECT id, customer_id FROM orders WHERE status = 'LATE') LOOP
    notify_customer(r.customer_id, r.id);
  END LOOP;
END;
/
```

명시적 커서 속성은 `%FOUND`, `%NOTFOUND`, `%ROWCOUNT`(지금까지 꺼낸 행 수), `%ISOPEN`이다.

### 한 행씩은 느리다

루프 안에서 SQL을 한 행씩 실행하면 PL/SQL 엔진과 SQL 엔진 사이를 행마다 오간다(문맥 전환). 수만 행이면 눈에 띄게 느려진다. 순서대로 따져 보면:

1. 한 문장의 SQL로 되면 그게 가장 빠르다(`UPDATE ... WHERE`, `INSERT ... SELECT`, `MERGE`).
2. 행마다 계산이 필요하면 `BULK COLLECT`로 묶어 받고 `FORALL`로 묶어 쓴다.

```sql
DECLARE
  TYPE id_list IS TABLE OF orders.id%TYPE;
  ids id_list;
BEGIN
  SELECT id BULK COLLECT INTO ids
  FROM orders WHERE status = 'LATE';

  FORALL i IN 1..ids.COUNT
    UPDATE orders SET status = 'NOTIFIED' WHERE id = ids(i);
END;
/
```

아주 큰 결과는 `FETCH ... BULK COLLECT INTO ... LIMIT 1000`으로 나눠 받아 PGA 메모리가 넘치지 않게 한다.

## 저장 서브프로그램

블록에 이름을 붙여 DB 객체로 저장하면 컴파일된 상태로 남아 언제든 호출할 수 있다.

| 종류 | 무엇 | 호출 |
| --- | --- | --- |
| 프로시저(`PROCEDURE`) | 작업을 수행한다. 반환값 없음(OUT 매개변수로 돌려줄 수는 있다) | `EXEC 이름(...)`, 다른 블록에서 호출 |
| 함수(`FUNCTION`) | 값을 하나 `RETURN`한다 | 식 안에서. 부작용이 없으면 `SELECT` 안에서도 쓴다 |
| 패키지(`PACKAGE`) | 관련 프로시저·함수·변수를 묶는다. 명세(공개 인터페이스)와 본문(구현)을 나눈다 | `패키지.이름(...)` |
| 트리거(`TRIGGER`) | 테이블에 INSERT·UPDATE·DELETE가 일어나면 자동 실행된다 | 직접 호출하지 않는다 |

매개변수 모드는 세 가지다.

| 모드 | 방향 |
| --- | --- |
| `IN`(기본) | 호출자 → 서브프로그램. 안에서 바꿀 수 없다 |
| `OUT` | 서브프로그램 → 호출자 |
| `IN OUT` | 양쪽 |

```sql
CREATE OR REPLACE PROCEDURE place_order (
  p_product_id IN  products.id%TYPE,
  p_qty        IN  NUMBER,
  p_order_id   OUT orders.id%TYPE
) AS
  v_stock products.stock%TYPE;
BEGIN
  SELECT stock INTO v_stock
  FROM products WHERE id = p_product_id
  FOR UPDATE;                          -- 재고 행을 잠근다

  IF v_stock < p_qty THEN
    RAISE_APPLICATION_ERROR(-20001, '재고 부족');
  END IF;

  UPDATE products SET stock = stock - p_qty WHERE id = p_product_id;
  INSERT INTO orders (id, product_id, qty)
  VALUES (orders_seq.NEXTVAL, p_product_id, p_qty)
  RETURNING id INTO p_order_id;
END;
/

CREATE OR REPLACE FUNCTION price_with_vat (p_price NUMBER)
RETURN NUMBER DETERMINISTIC AS
BEGIN
  RETURN ROUND(p_price * 1.1);
END;
/

SELECT name, price_with_vat(price) FROM products;
```

트리거는 감사 로그나 파생 컬럼 유지에 쓴다. 행 단위 트리거에서는 바뀌기 전 값과 후 값을 `:OLD`, `:NEW`로 본다.

```sql
CREATE OR REPLACE TRIGGER trg_price_history
AFTER UPDATE OF price ON products
FOR EACH ROW
BEGIN
  INSERT INTO price_history (product_id, old_price, new_price, changed_at)
  VALUES (:OLD.id, :OLD.price, :NEW.price, SYSTIMESTAMP);
END;
/
```

트리거는 코드를 읽어서는 보이지 않는 곳에서 실행된다. 많아지면 "UPDATE 한 줄이 왜 이렇게 느리지", "이 값은 누가 바꿨지"를 추적하기 어려워진다. 꼭 DB 안에서 보장해야 하는 규칙에만 쓴다.

## 정리

- PL/SQL은 `DECLARE`·`BEGIN`·`EXCEPTION`·`END` 블록으로 쓴다. `%TYPE`·`%ROWTYPE`으로 테이블 타입을 따라간다.
- `SELECT INTO`는 한 행 전용. 여러 행은 커서(가능하면 커서 FOR 루프)나 `BULK COLLECT`.
- 행 단위 루프는 느리다. 한 문장 SQL → `BULK COLLECT`/`FORALL` 순서로 고려한다.
- 프로시저는 작업, 함수는 값, 패키지는 묶음, 트리거는 자동 실행. 예외는 삼키지 말고 다시 던진다.

관련 노트: [[sql-basics|SQL 기초]], [[oracle-architecture|Oracle 데이터베이스 구조]], [[oracle-schema-objects|Oracle 스키마 객체]], [[transaction|트랜잭션과 회복]]
