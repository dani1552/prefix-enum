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

export const prefixEnum = <const TName extends string>(
  category: string,
  definitions: Record<TName, KeywordDefinition>,
  options: PrefixEnumOptions = {},
): PrefixEnumResult<TName> => {
  const normalizedCategory = normalizeCategory(category);
  const formatLabel = options.formatLabel ?? defaultFormatLabel;
  const seenKeys = new Set<string>();

  const entries = (Object.entries(definitions) as Array<[TName, KeywordDefinition]>).map(
    ([name, definition]) => {
      const normalizedValue = normalizeKeywordValue(
        typeof definition === "string" ? name : (definition.value ?? name),
      );

      const key = buildKeywordKey(normalizedCategory, normalizedValue);
      ensureUnique(key, seenKeys);

      const label =
        typeof definition === "string"
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
      acc[entry.name] = entry.key;
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

  return { category: normalizedCategory, keys, labelMap, entries, map };
};

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
