# prefix-enum

[![npm version](https://img.shields.io/npm/v/prefix-enum)](https://www.npmjs.com/package/prefix-enum)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**prefix-enum**은 카테고리별로 prefix를 붙여 고유한 enum 키를 생성하고 관리하는 TypeScript 라이브러리입니다.

### 왜 필요한가요?

실무에서 여러 카테고리의 enum을 다룰 때 다음과 같은 문제들이 발생합니다:

- **중복 값 충돌**: 서로 다른 카테고리(`SMOKING`, `DRINKING`)에서 동일한 enum 값(`TRYING_TO_QUIT`)을 사용할 때 키 충돌 발생
- **포맷 불일치**: API 응답은 `camelCase`, enum 키는 `SNAKE_CASE`로 작성되어 매핑 로직이 복잡해짐
- **관리 어려움**: 여러 출처의 enum을 하나의 매핑 테이블로 통합할 때 일관된 규칙 부재

**prefix-enum**은 이러한 문제들을 해결합니다:

- ✅ 카테고리 prefix를 자동으로 붙여 고유한 키 생성 (`SMOKING_TRYING_TO_QUIT`, `DRINKING_TRYING_TO_QUIT`)
- ✅ camelCase, PascalCase, kebab-case, snake_case를 일관된 `SNAKE_CASE`로 자동 정규화
- ✅ 여러 enum 그룹을 하나의 매핑 객체로 자동 조립
- ✅ TypeScript enum을 직접 지원하여 변환 과정 없이 사용 가능
- ✅ 완전한 타입 안전성으로 컴파일 타임에 오류 감지

---

## Features

### 1. 중복 값 충돌 방지

서로 다른 카테고리에서 동일한 enum value를 사용해도 카테고리 기준으로 고유한 key를 자동 생성합니다.

**문제 상황:**

```typescript
// ❌ 문제: 같은 값이지만 다른 의미
const SmokingStatus = { TRYING_TO_QUIT: "TRYING_TO_QUIT" };
const DrinkingStatus = { TRYING_TO_QUIT: "TRYING_TO_QUIT" };
// 키 충돌 발생!
```

**해결 방법:**

```typescript
// ✅ 해결: 카테고리 prefix로 고유 키 생성
const smoking = prefixEnum("SMOKING", { TRYING_TO_QUIT: "금연중" });
const drinking = prefixEnum("DRINKING", { TRYING_TO_QUIT: "금주중" });

// 자동으로 고유한 키 생성
// SMOKING_TRYING_TO_QUIT, DRINKING_TRYING_TO_QUIT
```

**주요 기능:**

- 카테고리명을 prefix로 자동 추가하여 고유성 보장
- 동일 카테고리 내에서 중복 키 감지 시 에러 발생
- 타입 안전한 키 생성으로 런타임 오류 방지

---

### 2. 포맷 자동 정규화

camelCase, PascalCase, kebab-case, snake_case 등 다양한 포맷을 일관된 `SNAKE_CASE`로 자동 변환합니다.

**문제 상황:**

```typescript
// ❌ 문제: API 응답과 enum 키 포맷 불일치
const apiResponse = { preferredPeople: "RELIABLE" }; // camelCase
const enumKey = "PREFERRED_PEOPLE_RELIABLE"; // SNAKE_CASE
// 매핑 로직이 복잡해짐
```

**해결 방법:**

```typescript
// ✅ 해결: 자동 정규화로 일관된 포맷 유지
normalizeCategory("preferredPeople"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred-people"); // "PREFERRED_PEOPLE"
normalizeCategory("PreferredPeople"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred_people"); // "PREFERRED_PEOPLE"

// 일관된 키 생성
buildKeywordKey("preferredPeople", "RELIABLE");
// → "PREFERRED_PEOPLE_RELIABLE"
```

**지원하는 포맷:**

- `camelCase` → `SNAKE_CASE` (예: `userRole` → `USER_ROLE`)
- `PascalCase` → `SNAKE_CASE` (예: `UserRole` → `USER_ROLE`)
- `kebab-case` → `SNAKE_CASE` (예: `user-role` → `USER_ROLE`)
- `snake_case` → `SNAKE_CASE` (예: `user_role` → `USER_ROLE`)

---

### 3. 여러 enum 그룹 통합

여러 카테고리의 enum을 하나의 매핑 객체로 자동 조립하여 일관된 규칙으로 관리합니다.

**문제 상황:**

```typescript
// ❌ 문제: 여러 enum을 수동으로 병합해야 함
const smokingMap = { ... };
const drinkingMap = { ... };
const combinedMap = { ...smokingMap, ...drinkingMap }; // 중복 체크 필요
```

**해결 방법:**

```typescript
// ✅ 해결: enumGroups로 한 번에 정의
const keywordMap = buildKeywordMap({
  SMOKING: {
    TRYING_TO_QUIT: "금연중",
    NEVER: "비흡연",
  },
  DRINKING: {
    TRYING_TO_QUIT: "금주중",
    NEVER: "비음주",
  },
});

// 자동으로 prefix가 붙어 고유 키 생성
// SMOKING_TRYING_TO_QUIT, DRINKING_TRYING_TO_QUIT 등
```

**주요 기능:**

- `enumGroups` 객체로 여러 카테고리를 한 번에 정의
- 배열 형태로도 병합 가능 (`buildKeywordMap([result1, result2])`)
- 중복 키 자동 감지 및 에러 발생
- 옵션을 통한 일괄 설정 지원

---

### 4. TypeScript enum 직접 지원

TypeScript enum을 객체로 변환하지 않고도 직접 사용할 수 있습니다.

**문제 상황:**

```typescript
// ❌ 문제: enum을 객체로 변환해야 함
enum SmokingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

// 수동 변환 필요
const definitions = {
  TRYING_TO_QUIT: SmokingEnum.TRYING_TO_QUIT,
  NEVER: SmokingEnum.NEVER,
};
```

**해결 방법:**

```typescript
// ✅ 해결: enum을 직접 전달 가능
enum SmokingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

enum DrinkingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

// enum을 직접 사용
const smoking = prefixEnum("SMOKING", SmokingEnum);
const keywordMap = buildKeywordMap({
  SMOKING: SmokingEnum,
  DRINKING: DrinkingEnum,
});
```

**지원하는 enum 타입:**

- **문자열 enum**: `enum Status { ACTIVE = "ACTIVE" }`
- **숫자 enum**: `enum Priority { HIGH = 1, LOW = 2 }`
- **혼합 enum**: 문자열과 숫자가 섞인 enum

---

### 5. 타입 안전성

완전한 TypeScript 타입 지원으로 컴파일 타임에 오류를 감지하고 런타임 에러를 방지합니다.

**주요 특징:**

- **제네릭 타입 추론**: 함수 오버로딩을 통한 정확한 타입 추론
- **엄격한 타입 체크**: `strict: true` 설정으로 모든 타입 오류 감지
- **명시적 타입 정의**: 모든 공개 API에 명확한 타입 정의 제공

**예시:**

```typescript
// 타입 안전한 키 접근
const result = prefixEnum<"admin" | "member">("role", {
  admin: "Admin",
  member: "Member",
});

// 타입 추론으로 자동완성 지원
result.keys.admin; // ✅ 타입 안전
result.keys.invalid; // ❌ 컴파일 에러
```

**타입 안전성 이점:**

- IDE 자동완성 지원
- 컴파일 타임 오류 감지
- 리팩토링 시 타입 체크로 안전성 보장
- 런타임 에러 감소

---

### 6. 에러 처리 옵션

매핑 실패 시 다양한 방식으로 에러를 처리할 수 있는 옵션을 제공합니다.

#### fallback: 기본값 제공

```typescript
// 매핑 실패 시 기본값 반환
getKeywordLabel(map, "UNKNOWN_KEY", {
  fallback: "알 수 없음",
});
// → "알 수 없음"
```

**사용 사례:** 사용자에게 안전한 기본값 표시, 프로덕션 환경에서 에러 방지

#### strict: 개발 중 오류 즉시 감지

```typescript
// 매핑 실패 시 즉시 에러 발생
getKeywordLabel(map, "UNKNOWN_KEY", { strict: true });
// → Error: Keyword label not found for key: "UNKNOWN_KEY"
```

**사용 사례:** 개발 환경에서 오타나 잘못된 키 사용을 즉시 발견

#### debug: 콘솔 경고 출력

```typescript
// 매핑 실패 시 콘솔에 경고 출력
getKeywordLabel(map, "UNKNOWN_KEY", { debug: true });
// → console.warn: [prefix-enum] Keyword label not found for key: "UNKNOWN_KEY"
```

**사용 사례:** 프로덕션 환경에서 문제 추적, 로깅과 함께 사용

**옵션 조합:**

```typescript
// fallback이 있으면 strict 모드에서도 에러 발생하지 않음
getKeywordLabel(map, "UNKNOWN_KEY", {
  strict: true,
  fallback: "알 수 없음",
});
// → "알 수 없음" (에러 발생하지 않음)

// strict와 debug 동시 사용 가능
getKeywordLabel(map, "UNKNOWN_KEY", {
  strict: true,
  debug: true,
});
// → console.warn 출력 후 에러 발생
```

---

## Getting Started

### 설치

```bash
npm install prefix-enum
# 또는
pnpm add prefix-enum
# 또는
yarn add prefix-enum
```

### 기본 사용

```typescript
import { prefixEnum, buildKeywordMap, getKeywordLabel } from "prefix-enum";

// 1. 카테고리별 enum 정의
const smoking = prefixEnum("SMOKING", {
  TRYING_TO_QUIT: "금연중",
  NEVER: "비흡연",
});

const drinking = prefixEnum("DRINKING", {
  TRYING_TO_QUIT: "금주중", // 같은 값이어도 다른 키로 생성됨
  NEVER: "비음주",
});

// 2. 여러 enum을 하나의 맵으로 병합
const keywordMap = buildKeywordMap([smoking, drinking]);

// 3. 키로 라벨 조회
getKeywordLabel(keywordMap, "SMOKING_TRYING_TO_QUIT"); // "금연중"
getKeywordLabel(keywordMap, "DRINKING_TRYING_TO_QUIT"); // "금주중"
```

---

## Usage

### TypeScript enum 직접 사용

```typescript
import { prefixEnum, buildKeywordMap } from "prefix-enum";

// TypeScript enum 정의
enum SmokingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

enum DrinkingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

// enum을 직접 전달 가능
const smoking = prefixEnum("SMOKING", SmokingEnum);
const keywordMap = buildKeywordMap({
  SMOKING: SmokingEnum,
  DRINKING: DrinkingEnum,
});
```

### enumGroups 객체로 간편하게

```typescript
import { buildKeywordMap } from "prefix-enum";

// 여러 카테고리를 한 번에 정의
const keywordMap = buildKeywordMap({
  SMOKING: {
    TRYING_TO_QUIT: "금연중",
    NEVER: "비흡연",
  },
  DRINKING: {
    TRYING_TO_QUIT: "금주중",
    NEVER: "비음주",
  },
});

// 자동으로 prefix가 붙어 고유 키 생성
// SMOKING_TRYING_TO_QUIT, DRINKING_TRYING_TO_QUIT 등
```

### 포맷 불일치 자동 해결

```typescript
import { normalizeCategory, buildKeywordKey } from "prefix-enum";

// camelCase → SNAKE_CASE 자동 변환
normalizeCategory("preferredPeople"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred-people"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred_people"); // "PREFERRED_PEOPLE"

// 일관된 키 생성 규칙
buildKeywordKey("preferredPeople", "RELIABLE");
// → "PREFERRED_PEOPLE_RELIABLE"
```

## Customized Options

### 1. 에러 처리 옵션

#### fallback 사용

```typescript
import { getKeywordLabel } from "prefix-enum";

getKeywordLabel(map, "UNKNOWN_KEY", { fallback: "알 수 없음" });
// → "알 수 없음"
```

#### strict 모드: 개발 중 오류 즉시 감지

```typescript
getKeywordLabel(map, "UNKNOWN_KEY", { strict: true });
// → Error: Keyword label not found for key: "UNKNOWN_KEY"
```

#### debug 모드: 콘솔에 경고 출력

```typescript
getKeywordLabel(map, "UNKNOWN_KEY", { debug: true });
// → console.warn: [prefix-enum] Keyword label not found for key: "UNKNOWN_KEY"
```

### 2. 커스텀 라벨 포맷터

```typescript
import { prefixEnum } from "prefix-enum";

const result = prefixEnum(
  "status",
  {
    pending: {}, // 라벨 없음
  },
  {
    formatLabel: (value) => `Custom: ${value}`,
  },
);

result.map["STATUS_PENDING"]?.label; // "Custom: PENDING"
```

### 3. 객체 형태 정의

```typescript
import { prefixEnum } from "prefix-enum";

const result = prefixEnum("payment", {
  creditCard: {
    value: "credit-card",
    label: "Credit Card",
  },
  bankTransfer: {
    label: "Bank Transfer",
    // value가 없으면 키 이름 사용
  },
});
```

### 4. enumGroups에 options 전달

```typescript
import { buildKeywordMap } from "prefix-enum";

const map = buildKeywordMap(
  {
    TEST: {
      test_key: {}, // 라벨 없음
    },
  },
  {
    formatLabel: (value) => `Custom: ${value}`,
  },
);

map["TEST_TEST_KEY"]?.label; // "Custom: TEST_KEY"
```

---

## API Reference

### `prefixEnum(category, definitions, options?)`

카테고리 기반 prefix를 부여하여 고유 키를 생성합니다.

**Parameters:**

- `category: string` - 카테고리명 (camelCase, kebab-case 등 자동 변환)
- `definitions: Record<string, KeywordDefinition> | Enum` - enum 정의 또는 TypeScript enum
- `options?: PrefixEnumOptions` - 옵션
  - `formatLabel?: (normalizedValue: string, definitionKey: string) => string` - 커스텀 라벨 포맷터

**Returns:**

```typescript
{
  category: string; // 정규화된 카테고리
  keys: Record<string, string>; // name → key 매핑
  labelMap: Record<string, string>; // key → label 매핑
  entries: KeywordEntry[]; // 전체 엔트리 배열
  map: KeywordMap; // key → KeywordEntry 매핑
}
```

**Example:**

```typescript
const result = prefixEnum("userRole", {
  admin: "Admin User",
  member: "Member User",
});

result.keys.admin; // "USER_ROLE_ADMIN"
result.map["USER_ROLE_ADMIN"]?.label; // "Admin User"
```

---

### `buildKeywordMap(sources | enumGroups, options?)`

여러 카테고리 enum을 하나의 매핑 테이블로 자동 조립합니다.

**Parameters:**

- `sources: Array<PrefixEnumResult | KeywordMap>` - PrefixEnumResult 또는 KeywordMap 배열
- `enumGroups: Record<string, Record<string, KeywordDefinition> | Enum>` - 카테고리명을 키로, enum 정의를 값으로 가지는 객체
- `options?: PrefixEnumOptions` - prefixEnum에 전달할 옵션

**Returns:** `KeywordMap` - 병합된 키워드 맵

**Example:**

```typescript
// 배열 형태
const result1 = prefixEnum("SMOKING", SmokingEnum);
const result2 = prefixEnum("DRINKING", DrinkingEnum);
const map = buildKeywordMap([result1, result2]);

// enumGroups 객체 (권장)
const map = buildKeywordMap(
  {
    SMOKING: SmokingEnum,
    DRINKING: DrinkingEnum,
  },
  {
    formatLabel: (value) => `Custom: ${value}`, // 옵션
  },
);
```

---

### `getKeywordLabel(source, key, options?)`

키워드 맵에서 키에 해당하는 라벨을 조회합니다.

**Parameters:**

- `source: PrefixEnumResult | KeywordMap` - 키워드 맵 또는 PrefixEnumResult
- `key: string` - 조회할 키
- `options?: GetKeywordLabelOptions` - 옵션
  - `fallback?: string` - 매핑 실패 시 사용할 텍스트
  - `strict?: boolean` - `true`면 fallback 없이 에러 throw
  - `debug?: boolean` - 매핑 실패 시 `console.warn` 표시

**Returns:** `string | undefined` - 라벨 또는 undefined

**Example:**

```typescript
getKeywordLabel(map, "SMOKING_TRYING_TO_QUIT"); // "금연중"
getKeywordLabel(map, "UNKNOWN_KEY", { fallback: "알 수 없음" }); // "알 수 없음"
getKeywordLabel(map, "UNKNOWN_KEY", { strict: true }); // Error throw
```

---

### `normalizeCategory(category)`

카테고리 문자열을 SNAKE_CASE 대문자로 정규화합니다.

**Parameters:**

- `category: string` - 카테고리명

**Returns:** `string` - 정규화된 카테고리명

**Supported formats:**

- camelCase → `PREFERRED_PEOPLE`
- PascalCase → `PREFERRED_PEOPLE`
- kebab-case → `PREFERRED_PEOPLE`
- snake_case → `PREFERRED_PEOPLE` (그대로 유지)

**Example:**

```typescript
normalizeCategory("preferredPeople"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred-people"); // "PREFERRED_PEOPLE"
normalizeCategory("preferred_people"); // "PREFERRED_PEOPLE"
```

---

### `buildKeywordKey(category, value)`

카테고리와 value를 받아 최종 매핑 키를 일관된 규칙으로 생성합니다.

**Parameters:**

- `category: string` - 카테고리명
- `value: string` - 값

**Returns:** `string` - `${CATEGORY}_${VALUE}` 형태의 키

**Example:**

```typescript
buildKeywordKey("preferredPeople", "RELIABLE");
// → "PREFERRED_PEOPLE_RELIABLE"
```

---

### `enumToDefinitions(enumObject)`

TypeScript enum을 `KeywordDefinition` 객체로 변환합니다.

**Parameters:**

- `enumObject: Record<string, string | number>` - TypeScript enum 객체

**Returns:** `Record<string, KeywordDefinition>` - 변환된 정의 객체

**Example:**

```typescript
enum SmokingEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
}

const definitions = enumToDefinitions(SmokingEnum);
// → { TRYING_TO_QUIT: "TRYING_TO_QUIT", NEVER: "NEVER" }
```

---

## Type Definitions

### `KeywordDefinition`

```typescript
type KeywordDefinition =
  | string // 라벨로 사용
  | {
      value?: string; // 키 생성에 사용할 값
      label?: string; // 표시용 라벨
    };
```

### `PrefixEnumResult`

```typescript
interface PrefixEnumResult<TName extends string = string> {
  category: string; // 정규화된 카테고리
  keys: Record<TName, string>; // name → key 매핑
  labelMap: Record<string, string>; // key → label 매핑
  entries: KeywordEntry<TName>[]; // 전체 엔트리 배열
  map: KeywordMap; // key → KeywordEntry 매핑
}
```

### `KeywordEntry`

```typescript
interface KeywordEntry<TName extends string = string> {
  name: TName; // 입력에서 사용한 식별자
  key: string; // PREFIX_CATEGORY_VALUE 형태의 최종 키
  category: string; // 정규화된 카테고리
  value: string; // 정규화된 값
  label: string; // 표시용 라벨
}
```

---

## 문제 해결

이 라이브러리는 enum 매핑에서 발생하는 실무적인 문제들을 해결하기 위해 개발되었습니다:

### 1. 중복 값 충돌

```typescript
// 문제: 서로 다른 카테고리에서 동일한 enum value 사용
Smoking.TRYING_TO_QUIT;
Drinking.TRYING_TO_QUIT;

// 해결: 카테고리 prefix로 고유 키 생성
SMOKING_TRYING_TO_QUIT;
DRINKING_TRYING_TO_QUIT;
```

### 2. 포맷 불일치

```typescript
// 문제: API 응답(preferredPeople)과 enum 키(PREFERRED_PEOPLE_KEY) 포맷 불일치
// 해결: 자동 정규화로 일관된 포맷 유지
normalizeCategory("preferredPeople"); // "PREFERRED_PEOPLE"
```

### 3. 여러 소스 통합

```typescript
// 문제: 여러 출처의 enum 구조가 달라 매핑 로직 중복
// 해결: buildKeywordMap으로 일관된 규칙으로 통합
const map = buildKeywordMap({
  SMOKING: SmokingEnum,
  DRINKING: DrinkingEnum,
});
```

---

## 프로젝트 구조

이 프로젝트는 명확한 디렉토리 구조로 코드의 가독성과 유지보수성을 높였습니다.

```
prefix-enum/
├── src/
│ ├── core/
│ │ └── prefixEnum.ts # 핵심 로직: prefixEnum, buildKeywordMap, getKeywordLabel
│ ├── utils/
│ │ └── normalizeCategory.ts # 유틸리티: 포맷 정규화 함수
│ └── index.ts # 공개 API 진입점
├── tests/ # 테스트 파일
│ ├── prefixEnum.test.ts
│ ├── buildKeywordMap.test.ts
│ ├── getKeywordLabel.test.ts
│ ├── normalizeCategory.test.ts
│ ├── buildKeywordKey.test.ts
│ └── enumToDefinitions.test.ts
├── dist/ # 빌드 출력 (ESM/CJS)
├── tsconfig.json # TypeScript 설정
├── tsup.config.ts # 빌드 설정
├── vitest.config.ts # 테스트 설정
└── eslint.config.mjs # 린트 설정
```

**설계 원칙:**

- **관심사 분리**: 핵심 로직(`core/`)과 유틸리티(`utils/`)를 분리
- **명확한 진입점**: `src/index.ts`에서 모든 공개 API를 일관되게 export
- **테스트 커버리지**: 각 함수별로 독립적인 테스트 파일 구성
- **타입 안전성**: TypeScript 설정을 통한 엄격한 타입 체크

---

## 개발 환경 설정

### 의존성 관리

이 프로젝트는 `pnpm`을 패키지 매니저로 사용합니다:

```bash
# 의존성 설치
pnpm install

# 패키지 추가
pnpm add <package-name>
```

**의존성 구조:**

- **런타임 의존성**: 없음 (Zero dependencies)
- **개발 의존성**: TypeScript, ESLint, Prettier, Vitest, tsup

### 빌드 설정

`tsup`을 사용하여 ESM과 CJS 형식으로 동시 빌드합니다:

```bash
# 프로덕션 빌드
pnpm build

# 개발 모드 (watch)
pnpm dev
```

**빌드 출력:**

- `dist/index.js` - ESM 형식
- `dist/index.cjs` - CommonJS 형식
- `dist/index.d.ts` - TypeScript 타입 정의
- 소스맵 파일 자동 생성

### 린트 및 포맷팅

코드 품질을 유지하기 위해 ESLint와 Prettier를 사용합니다:

```bash
# 린트 검사
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 포맷 검사
pnpm format

# 포맷 자동 수정
pnpm format:fix
```

**설정 파일:**

- `eslint.config.mjs`: TypeScript ESLint 규칙 설정
- `.prettierrc` (또는 `package.json`): 코드 포맷팅 규칙

---

## TypeScript 설정

이 프로젝트는 TypeScript를 정확하게 사용하기 위해 엄격한 설정을 적용했습니다:

### 주요 설정 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true, // 모든 엄격한 타입 체크 활성화
    "noUncheckedIndexedAccess": true, // 인덱스 접근 시 undefined 체크
    "exactOptionalPropertyTypes": true, // 옵셔널 속성 타입 정확성
    "verbatimModuleSyntax": true, // 모듈 구문 정확성
    "isolatedModules": true, // 파일별 독립 컴파일
    "noUncheckedSideEffectImports": true // 사이드 이펙트 없는 import
  }
}
```

### 타입 안전성 특징

1. **엄격한 타입 체크**: `strict: true`로 모든 엄격한 옵션 활성화
2. **제네릭 활용**: 함수 오버로딩과 제네릭을 통한 타입 추론 최적화
3. **타입 가드**: 런타임 타입 체크를 통한 안전한 타입 좁히기
4. **명시적 타입 정의**: 모든 공개 API에 명확한 타입 정의 제공

**예시:**

```typescript
// 제네릭을 통한 타입 추론
prefixEnum<"admin" | "member">("role", {
  admin: "Admin",
  member: "Member",
});

// 함수 오버로딩으로 다양한 입력 타입 지원
buildKeywordMap([result1, result2]); // 배열
buildKeywordMap({ SMOKING: enum1 }); // 객체
```

---

## 테스트 및 CI

### 테스트 실행

```bash
# 테스트 실행
pnpm test

# Watch 모드
pnpm test:watch

# 커버리지 리포트
pnpm test -- --coverage
```

### 테스트 커버리지

현재 **50개 이상의 테스트 케이스**로 핵심 기능을 검증합니다:

- ✅ `prefixEnum`: 기본 기능, TypeScript enum 지원, 옵션 처리
- ✅ `buildKeywordMap`: 배열/객체 입력, enumGroups, 옵션 전달
- ✅ `getKeywordLabel`: fallback, strict, debug 옵션
- ✅ `normalizeCategory`: 다양한 포맷 변환
- ✅ `buildKeywordKey`: 키 생성 규칙
- ✅ `enumToDefinitions`: enum 변환 로직

### CI 체크 (권장)

프로덕션 배포 전 다음 체크를 수행하는 것을 권장합니다:

```bash
# 1. 타입 체크
pnpm build

# 2. 린트 검사
pnpm lint

# 3. 포맷 검사
pnpm format

# 4. 테스트 실행
pnpm test
```

**CI 워크플로우 예시** (`.github/workflows/ci.yml`):

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
      - run: pnpm format
      - run: pnpm test
```

---

## 코드 품질

### 린트 규칙

- **TypeScript ESLint**: 타입 안전성과 코드 품질 규칙 적용
- **Prettier 통합**: 코드 포맷팅 자동화
- **엄격한 타입 체크**: `tsconfig.json`의 엄격한 설정 준수

### 코드 스타일

- **명확한 함수명**: 기능을 직관적으로 알 수 있는 네이밍
- **타입 주석**: 복잡한 타입에 대한 명확한 설명
- **에러 처리**: 명확한 에러 메시지와 타입 안전한 에러 처리
- **함수 분리**: 단일 책임 원칙에 따른 함수 분리

### 유지보수성

- **모듈화**: 핵심 로직과 유틸리티의 명확한 분리
- **테스트 가능성**: 각 함수가 독립적으로 테스트 가능하도록 설계
- **타입 안전성**: 컴파일 타임에 버그를 잡을 수 있도록 타입 활용
- **문서화**: JSDoc 주석과 README를 통한 명확한 API 문서

---

## Contributing

기여를 환영합니다! 버그 리포트, 기능 제안, Pull Request 모두 환영합니다.

### 기여 방법

1. **이슈 등록**: 버그나 기능 제안은 [GitHub Issues](https://github.com/dani1552/prefix-enum/issues)에 등록해주세요.
2. **Pull Request**:
   - Fork 후 브랜치 생성 (`git checkout -b feature/amazing-feature`)
   - 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
   - Push 후 Pull Request 생성
3. **코드 스타일**:
   - `pnpm lint`와 `pnpm format`을 통과해야 합니다.
   - 테스트를 추가하고 모든 테스트가 통과해야 합니다.

### 개발 가이드

```bash
# 1. 저장소 클론
git clone https://github.com/dani1552/prefix-enum.git
cd prefix-enum

# 2. 의존성 설치
pnpm install

# 3. 개발 모드 실행
pnpm dev

# 4. 테스트 실행
pnpm test

# 5. 빌드 확인
pnpm build
```

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

- [GitHub Issues](https://github.com/dani1552/prefix-enum/issues)
- [GitHub Repository](https://github.com/dani1552/prefix-enum)
