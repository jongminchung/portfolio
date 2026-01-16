# 로컬 DB 접근 실패 원인 정리

## 증상

- `service` 테이블이 존재하지만 `service.allPublic` 쿼리에서 500 오류가 발생함.
- 로그에 다음과 같은 메시지가 반복됨.
  - `Failed query: select ... from "service" ...`

## 원인

- DB 드라이버로 `@neondatabase/serverless`(HTTP 기반)를 사용하고 있었음.
- 로컬 Docker PostgreSQL은 HTTP SQL 엔드포인트(`https://localhost/sql`)를 제공하지 않음.
- 결과적으로 로컬 DB에 대한 연결 자체가 실패하고, 쿼리가 전부 실패함.

## 해결

- 로컬 PostgreSQL과 직접 연결 가능한 `postgres`(postgres-js) 드라이버로 전환.
- Drizzle 초기화도 `drizzle-orm/postgres-js`로 변경.
- 동일 환경에서 쿼리 실행이 정상 동작함.

## 재발 방지 체크리스트

- 로컬 Docker DB는 TCP 기반 드라이버(postgres-js)를 사용한다.
- Neon/HTTP SQL 엔드포인트가 필요한 환경에서만 `@neondatabase/serverless`를 사용한다.
- `DATABASE_URL`이 로컬 환경에 맞는지 확인한다.
