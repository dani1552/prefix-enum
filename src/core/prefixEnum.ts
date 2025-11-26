import { normalizeCategory, normalizeKeywordValue } from "../utils/normalizeCategory.js";

export type KeywordDefinition =
  | string
  | {
      value?: string;
      label?: string;
    };

export interface KeywordEntry<TName extends string = string> {
  /** 입력에서 사용한 식별자 */
  name: TName;
  /** PREFIX_CATEGORY_VALUE 형태의 최종 키 */
  key: string;
  /** 정규화된 카테고리 */
  category: string;
  /** 정규화된 값 */
  value: string;
  /** 표시용 라벨 */
  label: string;
}

export interface PrefixEnumResult<TName extends string = string> {
  category: string;
  keys: Record<TName, string>;
  labelMap: Record<string, string>;
  entries: KeywordEntry<TName>[];
  map: KeywordMap;
}

export type KeywordMap = Record<string, KeywordEntry>;

export interface PrefixEnumOptions {
  /**
   * 라벨을 지정하지 않은 경우 기본 라벨을 Title Case로 만들 때 사용할 함수.
   * 기본값은 `_` 를 공백으로 바꾼 뒤 Title Case 처리.
   */
  formatLabel?: (normalizedValue: string, definitionKey: string) => string;
}

const defaultFormatLabel = (normalizedValue: string): string =>
  normalizedValue
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const ensureUnique = (key: string, seen: Set<string>) => {
  if (seen.has(key)) {
    throw new Error(`Duplicated keyword key detected: ${key}`);
  }
  seen.add(key);
};

export const buildKeywordKey = (category: string, value: string): string => {
  const normalizedCategory = normalizeCategory(category);
  const normalizedValue = normalizeKeywordValue(value);
  return `${normalizedCategory}_${normalizedValue}`;
};

/**
 * TypeScript enum을 KeywordDefinition 객체로 변환
 * @param enumObject - TypeScript enum 객체
 * @returns enum의 키-값 쌍을 KeywordDefinition 형태로 변환한 객체
 */
export const enumToDefinitions = <T extends Record<string, string | number>>(
  enumObject: T,
): Record<string, KeywordDefinition> => {
  const result: Record<string, KeywordDefinition> = {};

  // enum의 모든 키를 순회
  for (const key in enumObject) {
    // 숫자 enum의 역방향 매핑 제외 (값이 숫자인 키는 제외)
    if (isNaN(Number(key))) {
      const value = enumObject[key];
      if (typeof value === "string" || typeof value === "number") {
        // enum 값을 문자열로 변환하여 라벨로 사용
        // formatLabel을 적용하려면 빈 객체로 설정하되, value는 키 이름 사용
        result[key] = String(value);
      }
    }
  }

  return result;
};

/**
 * TypeScript enum을 직접 받아 prefixEnum 실행
 * @param category - 카테고리명
 * @param enumObject - TypeScript enum 객체
 * @param options - 옵션
 * @returns PrefixEnumResult
 */
export function prefixEnum<T extends Record<string, string | number>>(
  category: string,
  enumObject: T,
  options?: PrefixEnumOptions,
): PrefixEnumResult<string>;

/**
 * 객체 형태의 정의를 받아 prefixEnum 실행
 * @param category - 카테고리명
 * @param definitions - KeywordDefinition 객체
 * @param options - 옵션
 * @returns PrefixEnumResult
 */
export function prefixEnum<const TName extends string>(
  category: string,
  definitions: Record<TName, KeywordDefinition>,
  options?: PrefixEnumOptions,
): PrefixEnumResult<TName>;

export function prefixEnum<const TName extends string>(
  category: string,
  definitionsOrEnum: Record<TName, KeywordDefinition> | Record<string, string | number>,
  options: PrefixEnumOptions = {},
): PrefixEnumResult<TName> {
  // enum인지 확인: 모든 값이 string 또는 number인 경우 enum으로 간주
  let definitions: Record<string, KeywordDefinition>;
  let isEnumType = false;

  if (Object.keys(definitionsOrEnum).length > 0) {
    const isEnum = Object.values(definitionsOrEnum).every(
      (v) => typeof v === "string" || typeof v === "number",
    );

    if (isEnum) {
      // enum으로 추정되는 경우 변환
      definitions = enumToDefinitions(definitionsOrEnum as Record<string, string | number>);
      isEnumType = true;
    } else {
      definitions = definitionsOrEnum as Record<TName, KeywordDefinition>;
    }
  } else {
    definitions = definitionsOrEnum as Record<TName, KeywordDefinition>;
  }

  const normalizedCategory = normalizeCategory(category);
  const formatLabel = options.formatLabel ?? defaultFormatLabel;
  const seenKeys = new Set<string>();

  const entries = (Object.entries(definitions) as Array<[string, KeywordDefinition]>).map(
    ([name, definition]) => {
      // enum인 경우: 키 이름을 value로 사용
      // 일반 객체인 경우: definition이 string이면 name 사용, 객체면 value 또는 name 사용
      const valueToNormalize = isEnumType
        ? name
        : typeof definition === "string"
          ? name
          : (definition.value ?? name);

      const normalizedValue = normalizeKeywordValue(valueToNormalize);

      const key = buildKeywordKey(normalizedCategory, normalizedValue);
      ensureUnique(key, seenKeys);

      // enum인 경우: formatLabel 옵션이 있으면 적용, 없으면 enum 값을 라벨로 사용
      // 일반 객체인 경우: definition이 string이면 그대로, 객체면 label 또는 formatLabel
      const label = isEnumType
        ? options.formatLabel
          ? formatLabel(normalizedValue, name)
          : typeof definition === "string"
            ? definition
            : formatLabel(normalizedValue, name)
        : typeof definition === "string"
          ? definition
          : (definition.label ?? formatLabel(normalizedValue, name));

      return {
        name: name as TName,
        key,
        category: normalizedCategory,
        value: normalizedValue,
        label,
      };
    },
  );

  const keys = entries.reduce(
    (acc, entry) => {
      (acc as Record<string, string>)[entry.name] = entry.key;
      return acc;
    },
    {} as Record<TName, string>,
  );

  const labelMap = entries.reduce(
    (acc, entry) => {
      acc[entry.key] = entry.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const map = entries.reduce((acc, entry) => {
    acc[entry.key] = entry;
    return acc;
  }, {} as KeywordMap);

  return {
    category: normalizedCategory,
    keys: keys as Record<TName, string>,
    labelMap,
    entries: entries as KeywordEntry<TName>[],
    map,
  };
}

/**
 * 여러 enum 그룹을 하나의 매핑 테이블로 자동 조립
 * @param enumGroups - 카테고리명을 키로, enum 정의를 값으로 가지는 객체
 * @returns 병합된 KeywordMap
 */
export function buildKeywordMap<T extends Record<string, Record<string, KeywordDefinition>>>(
  enumGroups: T,
  options?: PrefixEnumOptions,
): KeywordMap;

/**
 * 여러 PrefixEnumResult 또는 KeywordMap을 하나의 매핑 테이블로 병합
 * @param sources - PrefixEnumResult 또는 KeywordMap 배열
 * @returns 병합된 KeywordMap
 */
export function buildKeywordMap(sources: Array<PrefixEnumResult | KeywordMap>): KeywordMap;

export function buildKeywordMap<T extends Record<string, Record<string, KeywordDefinition>>>(
  sourcesOrGroups: Array<PrefixEnumResult | KeywordMap> | T,
  options?: PrefixEnumOptions,
): KeywordMap {
  // enumGroups 객체인 경우
  if (!Array.isArray(sourcesOrGroups)) {
    const enumGroups = sourcesOrGroups;
    const results: PrefixEnumResult[] = Object.entries(enumGroups).map(([category, definitions]) =>
      prefixEnum(category, definitions, options ?? {}),
    );
    return buildKeywordMap(results);
  }

  // 기존 로직: PrefixEnumResult 또는 KeywordMap 배열
  const sources = sourcesOrGroups;
  return sources.reduce<KeywordMap>((acc, source) => {
    const nextMap = "map" in source ? source.map : source;
    for (const [key, entry] of Object.entries(nextMap)) {
      if (acc[key]) {
        throw new Error(`Keyword key already exists in map: ${key}`);
      }
      acc[key] = entry;
    }
    return acc;
  }, {});
}

export interface GetKeywordLabelOptions {
  /** 매핑 실패 시 사용할 텍스트 */
  fallback?: string;
  /** true면 fallback 없이 에러 throw */
  strict?: boolean;
  /** 매핑 실패 시 console.warn 표시 */
  debug?: boolean;
}

export const getKeywordLabel = (
  source: PrefixEnumResult | KeywordMap,
  key: string,
  options: GetKeywordLabelOptions = {},
): string | undefined => {
  const map: KeywordMap =
    "map" in source ? (source as PrefixEnumResult).map : (source as KeywordMap);
  const entry = map[key];

  if (entry) {
    return entry.label;
  }

  // 매핑 실패 처리
  if (options.debug) {
    console.warn(`[prefix-enum] Keyword label not found for key: "${key}"`);
  }

  // fallback이 있으면 에러를 throw하지 않음
  if (options.fallback !== undefined) {
    return options.fallback;
  }

  if (options.strict) {
    throw new Error(`Keyword label not found for key: "${key}"`);
  }

  return undefined;
};
