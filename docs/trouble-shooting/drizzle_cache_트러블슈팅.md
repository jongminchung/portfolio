# Drizzle 캐시 오류 및 대응

## 캐시 변경 배경

- 기존: KV_REST 기반 원격 캐시(예: Upstash Redis) 사용.
- 변경: Postgres UNLOGGED 테이블 기반 캐시로 전환.
- 목적:
  - 로컬 개발환경에서 외부 캐시 의존 제거.
  - 운영 환경에서도 단순한 KV 캐시를 Postgres로 대체 가능하게 구성.

## 캐시 구조 요약

- 테이블: `query_cache` (UNLOGGED)
- 컬럼:
  - `key` (text, primary key)
  - `value` (bytea)
  - `expires_at` (timestamptz)
  - `updated_at` (timestamptz)
- TTL 만료는 배치 delete로 정리.

## Drizzle 캐시 연결 방식

- `packages/db/src/cache-drizzle.ts`에서 Drizzle Cache 인터페이스 구현.
- `packages/db/src/client.ts`에서 `drizzle({ cache })` 형태로 연결.
- KV 전용 API(`getCache/setCache/delCache`)는 별도 유지.

## 적용 파일 목록

- `packages/db/src/cache-core.ts`
- `packages/db/src/cache.ts`
- `packages/db/src/cache-drizzle.ts`
- `packages/db/src/client.ts`
- `packages/db/src/schema/cache.schema.ts`
- `packages/db/src/schema/index.ts`
- `packages/db/package.json`

## 증상

- `blog.allPublic` 등 일부 조회 요청에서 TRPC 에러 발생.
- 오류 메시지:
  - `The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Date`

## 원인

- Drizzle 캐시가 `query_cache`에 값을 저장할 때,
  `expires_at` 파라미터를 `Date` 객체로 전달함.
- postgres-js는 파라미터 직렬화 시 `Buffer.byteLength`에 `Date`가 전달되면 에러가 발생함.

## 해결

- `expires_at` 값을 `Date` 객체 대신 ISO 문자열로 전달하도록 변경.
- 적용 위치:
  - `packages/db/src/cache-drizzle.ts`
  - `packages/db/src/cache.ts`

## 참고

- 캐시 테이블은 `UNLOGGED` KV 구조로 운영.
- Drizzle `cache` 인터페이스는 select 캐시에 사용되며,
  `query_cache`에 직렬화된 값을 저장한다.
