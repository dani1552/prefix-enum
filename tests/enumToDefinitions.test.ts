import { describe, it, expect } from "vitest";
import { enumToDefinitions } from "../src/core/prefixEnum.js";

enum StringEnum {
  TRYING_TO_QUIT = "TRYING_TO_QUIT",
  NEVER = "NEVER",
  SOMETIMES = "SOMETIMES",
}

enum NumericEnum {
  ACTIVE = 0,
  INACTIVE = 1,
  PENDING = 2,
}

enum MixedEnum {
  FIRST = "first",
  SECOND = 2,
  THIRD = "third",
}

describe("enumToDefinitions", () => {
  it("문자열 enum을 KeywordDefinition 객체로 변환한다", () => {
    const result = enumToDefinitions(StringEnum);

    expect(result).toEqual({
      TRYING_TO_QUIT: "TRYING_TO_QUIT",
      NEVER: "NEVER",
      SOMETIMES: "SOMETIMES",
    });
  });

  it("숫자 enum을 KeywordDefinition 객체로 변환한다", () => {
    const result = enumToDefinitions(NumericEnum);

    expect(result).toEqual({
      ACTIVE: "0",
      INACTIVE: "1",
      PENDING: "2",
    });
  });

  it("혼합 enum을 KeywordDefinition 객체로 변환한다", () => {
    const result = enumToDefinitions(MixedEnum);

    expect(result).toEqual({
      FIRST: "first",
      SECOND: "2",
      THIRD: "third",
    });
  });

  it("숫자 enum의 역방향 매핑을 제외한다", () => {
    const result = enumToDefinitions(NumericEnum);

    expect(result["0"]).toBeUndefined();
    expect(result["1"]).toBeUndefined();
    expect(result["2"]).toBeUndefined();

    expect(result["ACTIVE"]).toBe("0");
    expect(result["INACTIVE"]).toBe("1");
    expect(result["PENDING"]).toBe("2");
  });

  it("빈 enum을 처리한다", () => {
    enum EmptyEnum {}
    const result = enumToDefinitions(EmptyEnum);

    expect(result).toEqual({});
  });
});
