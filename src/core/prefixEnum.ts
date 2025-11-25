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

export const buildKeywordMap = (sources: Array<PrefixEnumResult | KeywordMap>): KeywordMap =>
  sources.reduce<KeywordMap>((acc, source) => {
    const nextMap = "map" in source ? source.map : source;
    for (const [key, entry] of Object.entries(nextMap)) {
      if (acc[key]) {
        throw new Error(`Keyword key already exists in map: ${key}`);
      }
      acc[key] = entry;
    }
    return acc;
  }, {});

export interface GetKeywordLabelOptions {
  fallback?: string;
}

export const getKeywordLabel = (
  source: PrefixEnumResult | KeywordMap,
  key: string,
  options: GetKeywordLabelOptions = {},
): string | undefined => {
  const map: KeywordMap =
    "map" in source ? (source as PrefixEnumResult).map : (source as KeywordMap);
  return map[key]?.label ?? options.fallback;
};
