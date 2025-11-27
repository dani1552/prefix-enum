import { describe, it, expect } from "vitest";
import { prefixEnum } from "../src/core/prefixEnum.js";

describe("prefixEnum", () => {
  it("카테고리 prefix를 붙여 고유 키를 만든다", () => {
    const result = prefixEnum("userRole", {
      admin: "Admin User",
      member: "Member User",
    });

    expect(result.category).toBe("USER_ROLE");
    expect(result.keys.admin).toBe("USER_ROLE_ADMIN");
    expect(result.keys.member).toBe("USER_ROLE_MEMBER");
    expect(result.map["USER_ROLE_ADMIN"]?.label).toBe("Admin User");
    expect(result.map["USER_ROLE_MEMBER"]?.label).toBe("Member User");
  });

  it("중복 값을 감지한다", () => {
    expect(() => {
      prefixEnum("userRole", {
        admin: {
          value: "admin",
        },
        admin2: {
          value: "admin",
        },
      });
    }).toThrow("Duplicated keyword key detected: USER_ROLE_ADMIN");
  });

  it("문자열 정의를 처리한다", () => {
    const result = prefixEnum("status", {
      active: "Active",
      inactive: "Inactive",
    });

    expect(result.keys.active).toBe("STATUS_ACTIVE");
    expect(result.map["STATUS_ACTIVE"]?.label).toBe("Active");
  });

  it("객체 정의를 처리한다", () => {
    const result = prefixEnum("payment", {
      creditCard: {
        value: "credit-card",
        label: "Credit Card",
      },
      bankTransfer: {
        label: "Bank Transfer",
      },
    });

    expect(result.keys.creditCard).toBe("PAYMENT_CREDIT_CARD");
    expect(result.map["PAYMENT_CREDIT_CARD"]?.label).toBe("Credit Card");
    expect(result.keys.bankTransfer).toBe("PAYMENT_BANK_TRANSFER");
    expect(result.map["PAYMENT_BANK_TRANSFER"]?.label).toBe("Bank Transfer");
  });

  it("라벨이 없으면 기본 포맷을 사용한다", () => {
    const result = prefixEnum("status", {
      pending: {},
    });

    expect(result.map["STATUS_PENDING"]?.label).toBe("Pending");
  });

  it("커스텀 formatLabel 옵션을 사용한다", () => {
    const result = prefixEnum(
      "status",
      {
        pending: {},
      },
      {
        formatLabel: (value) => `Custom ${value}`,
      },
    );

    expect(result.map["STATUS_PENDING"]?.label).toBe("Custom PENDING");
  });

  it("entries 배열을 생성한다", () => {
    const result = prefixEnum("role", {
      admin: "Admin",
      user: "User",
    });

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]?.name).toBe("admin");
    expect(result.entries[0]?.key).toBe("ROLE_ADMIN");
    expect(result.entries[1]?.name).toBe("user");
    expect(result.entries[1]?.key).toBe("ROLE_USER");
  });

  it("labelMap을 생성한다", () => {
    const result = prefixEnum("status", {
      active: "Active",
      inactive: "Inactive",
    });

    expect(result.labelMap["STATUS_ACTIVE"]).toBe("Active");
    expect(result.labelMap["STATUS_INACTIVE"]).toBe("Inactive");
  });

  describe("TypeScript enum 지원", () => {
    enum SmokingEnum {
      TRYING_TO_QUIT = "TRYING_TO_QUIT",
      NEVER = "NEVER",
      SOMETIMES = "SOMETIMES",
    }

    enum StatusEnum {
      ACTIVE = 0,
      INACTIVE = 1,
      PENDING = 2,
    }

    it("문자열 enum을 직접 받아 처리한다", () => {
      const result = prefixEnum("SMOKING", SmokingEnum);

      expect(result.category).toBe("SMOKING");
      expect(result.keys.TRYING_TO_QUIT).toBe("SMOKING_TRYING_TO_QUIT");
      expect(result.keys.NEVER).toBe("SMOKING_NEVER");
      expect(result.keys.SOMETIMES).toBe("SMOKING_SOMETIMES");
      expect(result.map["SMOKING_TRYING_TO_QUIT"]?.label).toBe("TRYING_TO_QUIT");
      expect(result.map["SMOKING_NEVER"]?.label).toBe("NEVER");
    });

    it("숫자 enum을 직접 받아 처리한다", () => {
      const result = prefixEnum("STATUS", StatusEnum);

      expect(result.category).toBe("STATUS");
      expect(result.keys.ACTIVE).toBe("STATUS_ACTIVE");
      expect(result.keys.INACTIVE).toBe("STATUS_INACTIVE");
      expect(result.keys.PENDING).toBe("STATUS_PENDING");
      expect(result.map["STATUS_ACTIVE"]?.label).toBe("0");
      expect(result.map["STATUS_INACTIVE"]?.label).toBe("1");
    });

    it("enum에 formatLabel 옵션을 적용할 수 있다", () => {
      const result = prefixEnum("SMOKING", SmokingEnum, {
        formatLabel: (value) => `Custom: ${value}`,
      });

      expect(result.map["SMOKING_TRYING_TO_QUIT"]?.label).toBe("Custom: TRYING_TO_QUIT");
      expect(result.map["SMOKING_NEVER"]?.label).toBe("Custom: NEVER");
    });

    it("enum에서도 중복 키를 감지한다", () => {
      enum DuplicateEnum {
        SAME_KEY = "same_value",
        SAME_KEY2 = "same_value",
      }

      const result = prefixEnum("TEST", DuplicateEnum);
      expect(result.keys.SAME_KEY).toBe("TEST_SAME_KEY");
      expect(result.keys.SAME_KEY2).toBe("TEST_SAME_KEY2");
    });
  });
});
