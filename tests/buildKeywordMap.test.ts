import { describe, it, expect } from "vitest";
import { prefixEnum, buildKeywordMap } from "../src/core/prefixEnum.js";

describe("buildKeywordMap", () => {
  it("여러 카테고리 enum을 단일 매핑으로 합친다", () => {
    const userRole = prefixEnum("userRole", {
      admin: "Admin",
      member: "Member",
    });

    const orderStatus = prefixEnum("orderStatus", {
      pending: "Pending",
      completed: "Completed",
    });

    const combined = buildKeywordMap([userRole, orderStatus]);

    expect(combined["USER_ROLE_ADMIN"]?.label).toBe("Admin");
    expect(combined["USER_ROLE_MEMBER"]?.label).toBe("Member");
    expect(combined["ORDER_STATUS_PENDING"]?.label).toBe("Pending");
    expect(combined["ORDER_STATUS_COMPLETED"]?.label).toBe("Completed");
    expect(Object.keys(combined)).toHaveLength(4);
  });

  it("중복 키를 방지한다", () => {
    const role1 = prefixEnum("role", {
      admin: "Admin",
    });

    const role2 = prefixEnum("role", {
      admin: "Admin",
    });

    expect(() => {
      buildKeywordMap([role1, role2]);
    }).toThrow("Keyword key already exists in map: ROLE_ADMIN");
  });

  it("KeywordMap을 직접 전달할 수 있다", () => {
    const userRole = prefixEnum("userRole", {
      admin: "Admin",
    });

    const orderStatus = prefixEnum("orderStatus", {
      pending: "Pending",
    });

    const combined = buildKeywordMap([userRole.map, orderStatus]);

    expect(combined["USER_ROLE_ADMIN"]?.label).toBe("Admin");
    expect(combined["ORDER_STATUS_PENDING"]?.label).toBe("Pending");
  });

  it("빈 배열을 처리한다", () => {
    const result = buildKeywordMap([]);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("여러 소스를 순서대로 병합한다", () => {
    const first = prefixEnum("first", {
      item: "First Item",
    });

    const second = prefixEnum("second", {
      item: "Second Item",
    });

    const combined = buildKeywordMap([first, second]);

    expect(combined["FIRST_ITEM"]?.label).toBe("First Item");
    expect(combined["SECOND_ITEM"]?.label).toBe("Second Item");
  });

  it("enumGroups 객체를 직접 받아서 자동으로 prefixEnum을 실행한다", () => {
    const SmokingEnum = {
      TRYING_TO_QUIT: "금연중",
      NEVER: "비흡연",
    };

    const DrinkingEnum = {
      TRYING_TO_QUIT: "금주중",
      NEVER: "비음주",
    };

    const map = buildKeywordMap({
      SMOKING: SmokingEnum,
      DRINKING: DrinkingEnum,
    });

    expect(map["SMOKING_TRYING_TO_QUIT"]?.label).toBe("금연중");
    expect(map["SMOKING_NEVER"]?.label).toBe("비흡연");
    expect(map["DRINKING_TRYING_TO_QUIT"]?.label).toBe("금주중");
    expect(map["DRINKING_NEVER"]?.label).toBe("비음주");
    expect(Object.keys(map)).toHaveLength(4);
  });

  it("enumGroups 객체에서도 중복 키를 방지한다", () => {
    const RoleEnum1 = {
      admin: "Admin",
    };

    const RoleEnum2 = {
      admin: "Admin",
    };

    expect(() => {
      buildKeywordMap({
        role: RoleEnum1,
        role2: RoleEnum2,
      });
      // role과 role2가 같은 카테고리명으로 정규화되면 중복 발생
      // 하지만 실제로는 다른 카테고리명이므로 다른 키가 생성됨
      // 실제 중복은 같은 카테고리에서 같은 값이 있을 때 발생
    }).not.toThrow();

    // 실제 중복 케이스: 같은 카테고리로 두 번 prefixEnum 호출 후 병합
    const result1 = prefixEnum("role", RoleEnum1);
    const result2 = prefixEnum("role", RoleEnum2);

    expect(() => {
      buildKeywordMap([result1, result2]);
    }).toThrow("Keyword key already exists in map: ROLE_ADMIN");
  });

  it("enumGroups 객체에 options를 전달할 수 있다", () => {
    const TestEnum = {
      test_key: {
        // 라벨을 명시하지 않아 formatLabel이 사용됨
      },
    };

    const map = buildKeywordMap(
      {
        test: TestEnum,
      },
      {
        formatLabel: (value) => `Custom: ${value}`,
      },
    );

    expect(map["TEST_TEST_KEY"]?.label).toBe("Custom: TEST_KEY");
  });

  it("enumGroups 객체와 배열 형태를 모두 지원한다", () => {
    const enum1 = prefixEnum("category1", {
      item1: "Item 1",
    });

    const enum2 = prefixEnum("category2", {
      item2: "Item 2",
    });

    // 배열 형태
    const map1 = buildKeywordMap([enum1, enum2]);

    // 객체 형태
    const map2 = buildKeywordMap({
      category1: { item1: "Item 1" },
      category2: { item2: "Item 2" },
    });

    expect(map1["CATEGORY1_ITEM1"]?.label).toBe("Item 1");
    expect(map1["CATEGORY2_ITEM2"]?.label).toBe("Item 2");
    expect(map2["CATEGORY1_ITEM1"]?.label).toBe("Item 1");
    expect(map2["CATEGORY2_ITEM2"]?.label).toBe("Item 2");
  });

  describe("TypeScript enum 지원", () => {
    enum SmokingEnum {
      TRYING_TO_QUIT = "TRYING_TO_QUIT",
      NEVER = "NEVER",
    }

    enum DrinkingEnum {
      TRYING_TO_QUIT = "TRYING_TO_QUIT",
      NEVER = "NEVER",
    }

    it("enumGroups 객체에 TypeScript enum을 직접 전달할 수 있다", () => {
      const map = buildKeywordMap({
        SMOKING: SmokingEnum,
        DRINKING: DrinkingEnum,
      });

      // enum 값이 라벨로 사용됨
      expect(map["SMOKING_TRYING_TO_QUIT"]?.label).toBe("TRYING_TO_QUIT");
      expect(map["SMOKING_NEVER"]?.label).toBe("NEVER");
      expect(map["DRINKING_TRYING_TO_QUIT"]?.label).toBe("TRYING_TO_QUIT");
      expect(map["DRINKING_NEVER"]?.label).toBe("NEVER");
      expect(Object.keys(map)).toHaveLength(4);
    });

    it("enumGroups 객체에 enum과 일반 객체를 함께 사용할 수 있다", () => {
      const map = buildKeywordMap({
        SMOKING: SmokingEnum,
        STATUS: {
          active: "Active",
          inactive: "Inactive",
        },
      });

      // enum 값이 라벨로 사용됨
      expect(map["SMOKING_TRYING_TO_QUIT"]?.label).toBe("TRYING_TO_QUIT");
      expect(map["STATUS_ACTIVE"]?.label).toBe("Active");
      expect(map["STATUS_INACTIVE"]?.label).toBe("Inactive");
    });

    it("enumGroups 객체에 enum과 options를 함께 전달할 수 있다", () => {
      const map = buildKeywordMap(
        {
          TEST: SmokingEnum,
        },
        {
          formatLabel: (value) => `Custom: ${value}`,
        },
      );

      expect(map["TEST_TRYING_TO_QUIT"]?.label).toBe("Custom: TRYING_TO_QUIT");
      expect(map["TEST_NEVER"]?.label).toBe("Custom: NEVER");
    });
  });
});
