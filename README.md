# prefix-enum

[![npm version](https://img.shields.io/npm/v/prefix-enum)](https://www.npmjs.com/package/prefix-enum)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

`prefix-enum`은 **카테고리 기반 prefix 규칙을 통해 고유한 enum 키를 생성하고 관리하는 TypeScript 유틸리티 라이브러리**입니다. 여러 enum 그룹을 통합하고 포맷을 자동 정규화하여 **중복 충돌 · 포맷 불일치 · 복잡한 매핑 로직**을 해결합니다.

---

## Purpose

실제 서비스 환경에서 다양한 enum을 통합하여 사용할 때 다음 문제가 발생합니다:

[[Next.js] 중복 ENUM 값 충돌로 인해 발생한 키워드 매핑 오류 해결하기](https://dani1552.tistory.com/84)
[[Next.js] ENUM 키워드 매핑 실패로 인해 발생한 한글 변환 오류 해결하기](https://dani1552.tistory.com/85)

- 서로 다른 카테고리에서 동일한 키(`TRYING_TO_QUIT`) 사용으로 인한 충돌
- API 응답(`preferredPeople`)과 enum 키(`PREFERRED_PEOPLE_RELIABLE`) 포맷 불일치
- 여러 enum 그룹을 병합할 때 수동 관리 과정에서 오류 발생
- 프론트/백/클라이언트 간 동일한 규칙 유지 어려움

<br />

`prefix-enum`은 다음과 같은 기능을 제공합니다:

- 카테고리 prefix 기반 독립적인 키 생성
- camelCase / PascalCase / kebab-case / snake_case 자동 변환
- 여러 enum 그룹을 하나의 map으로 통합
- TypeScript enum 직접 지원
- 타입 안전성 보장 및 컴파일 타임 오류 감지

---

## Main features

| 기능                           | 설명                                                |
| ------------------------------ | --------------------------------------------------- |
| **Prefix 기반 고유한 키 생성** | `SMOKING_TRYING_TO_QUIT`, `DRINKING_TRYING_TO_QUIT` |
| **Key 포맷 자동 정규화**       | 모든 입력 포맷을 `SNAKE_CASE`로 통일                |
| **여러 enum 그룹 통합**        | `buildKeywordMap`으로 자동 병합 및 중복 검사        |
| **TypeScript enum 지원**       | enum 객체 그대로 전달 가능                          |
| **타입 안전성**                | strict 타입 체크, 자동완성, 컴파일 타임 오류 감지   |
| **매핑 실패 옵션**             | `fallback`, `strict`, `debug` 처리 방식 지원        |

---

## Install

```bash
npm install prefix-enum
# or
pnpm add prefix-enum
# or
yarn add prefix-enum
```

---

## Basic usage example

```typescript
import { prefixEnum, buildKeywordMap, getKeywordLabel } from "prefix-enum";

const smoking = prefixEnum("SMOKING", {
  TRYING_TO_QUIT: "금연중",
  NEVER: "비흡연",
});

const drinking = prefixEnum("DRINKING", {
  TRYING_TO_QUIT: "금주중",
  NEVER: "비음주",
});

const keywordMap = buildKeywordMap([smoking, drinking]);

getKeywordLabel(keywordMap, "SMOKING_TRYING_TO_QUIT"); // "금연중"
getKeywordLabel(keywordMap, "DRINKING_TRYING_TO_QUIT"); // "금주중"
```

---

## TypeScript enum usage examples

```typescript
enum SmokingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

enum DrinkingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

const map = buildKeywordMap({
  SMOKING: SmokingEnum,
  DRINKING: DrinkingEnum,
});

map["SMOKING_TRYING_TO_QUIT"]; // 사용 가능
```

---

## API

### `prefixEnum(category, definitions, options?)`

카테고리 prefix가 적용된 고유 키와 라벨 매핑 객체를 생성합니다.

```typescript
const result = prefixEnum("userRole", {
  admin: "Admin User",
  member: "Member User",
});

result.keys.admin; // "USER_ROLE_ADMIN"
result.map["USER_ROLE_ADMIN"].label; // "Admin User"
```

---

### `buildKeywordMap(sources | enumGroups, options?)`

여러 PrefixEnumResult 또는 enum 그룹 객체를 하나의 매핑 테이블로 조립합니다.

```typescript
const map = buildKeywordMap({
  SMOKING: SmokingEnum,
  DRINKING: DrinkingEnum,
});
```

---

### `getKeywordLabel(source, key, options?)`

매핑된 라벨을 반환하거나 옵션에 따라 fallback/strict 처리합니다.

```typescript
getKeywordLabel(map, "SMOKING_TRYING_TO_QUIT"); // "금연중"
getKeywordLabel(map, "UNKNOWN_KEY", { fallback: "알 수 없음" }); // fallback 반환
getKeywordLabel(map, "UNKNOWN_KEY", { strict: true }); // Error throw
```

---

### `normalizeCategory(category)`

카테고리 문자열을 대문자 SNAKE_CASE로 정규화합니다.

```typescript
normalizeCategory("preferredPeople"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred-people"); // "PREFERRED_PEOPLE"
```

---

## Options

| 옵션          | 설명                             |
| ------------- | -------------------------------- |
| `fallback`    | 키 조회 실패 시 기본 텍스트 반환 |
| `strict`      | 매핑 실패 시 즉시 오류 throw     |
| `debug`       | 경고 메시지 출력                 |
| `formatLabel` | 라벨 생성 커스텀 formatter       |

---

## Project structure

```
prefix-enum/
├── src/
├── tests/
├── dist/
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

- Zero dependencies
- TypeScript strict mode
- 테스트 중심 설계 (Vitest)
- ESM / CJS / 타입 정의 제공

---

## License

ISC License
Copyright (c)

GitHub Repository: [https://github.com/dani1552/prefix-enum](https://github.com/dani1552/prefix-enum)
Issues: [https://github.com/dani1552/prefix-enum/issues](https://github.com/dani1552/prefix-enum/issues)
