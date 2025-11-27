import { normalizeCategory, normalizeKeywordValue } from "../utils/normalizeCategory.js";

export type KeywordDefinition =
  | string
  | {
      value?: string;
      label?: string;
    };

export interface KeywordEntry<TName extends string = string> {
  name: TName;
  key: string;
  category: string;
  value: string;
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

export const enumToDefinitions = <T extends Record<string, string | number>>(
  enumObject: T,
): Record<string, KeywordDefinition> => {
  const result: Record<string, KeywordDefinition> = {};

  for (const key in enumObject) {
    if (isNaN(Number(key))) {
      const value = enumObject[key];
      if (typeof value === "string" || typeof value === "number") {
        result[key] = String(value);
      }
    }
  }

  return result;
};

export function prefixEnum<T extends Record<string, string | number>>(
  category: string,
  enumObject: T,
  options?: PrefixEnumOptions,
): PrefixEnumResult<string>;

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
      const valueToNormalize = isEnumType
        ? name
        : typeof definition === "string"
          ? name
          : (definition.value ?? name);

      const normalizedValue = normalizeKeywordValue(valueToNormalize);

      const key = buildKeywordKey(normalizedCategory, normalizedValue);
      ensureUnique(key, seenKeys);

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

export function buildKeywordMap<T extends Record<string, Record<string, KeywordDefinition>>>(
  enumGroups: T,
  options?: PrefixEnumOptions,
): KeywordMap;

export function buildKeywordMap(sources: Array<PrefixEnumResult | KeywordMap>): KeywordMap;

export function buildKeywordMap<T extends Record<string, Record<string, KeywordDefinition>>>(
  sourcesOrGroups: Array<PrefixEnumResult | KeywordMap> | T,
  options?: PrefixEnumOptions,
): KeywordMap {
  if (!Array.isArray(sourcesOrGroups)) {
    const enumGroups = sourcesOrGroups;
    const results: PrefixEnumResult[] = Object.entries(enumGroups).map(([category, definitions]) =>
      prefixEnum(category, definitions, options ?? {}),
    );
    return buildKeywordMap(results);
  }

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
  fallback?: string;
  strict?: boolean;
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

  if (options.debug) {
    console.warn(`[prefix-enum] Keyword label not found for key: "${key}"`);
  }

  if (options.fallback !== undefined) {
    return options.fallback;
  }

  if (options.strict) {
    throw new Error(`Keyword label not found for key: "${key}"`);
  }

  return undefined;
};
