import { describe, it, expect } from "vitest";
import { normalizeCategory } from "../src/utils/normalizeCategory.js";

describe("normalizeCategory", () => {
  it("camelCase를 SNAKE_CASE로 변환한다", () => {
    expect(normalizeCategory("userRole")).toBe("USER_ROLE");
    expect(normalizeCategory("paymentMethod")).toBe("PAYMENT_METHOD");
    expect(normalizeCategory("orderStatus")).toBe("ORDER_STATUS");
  });

  it("이미 snake_case면 그대로 둔다", () => {
    expect(normalizeCategory("user_role")).toBe("USER_ROLE");
    expect(normalizeCategory("payment_method")).toBe("PAYMENT_METHOD");
  });

  it("kebab-case를 SNAKE_CASE로 변환한다", () => {
    expect(normalizeCategory("user-role")).toBe("USER_ROLE");
    expect(normalizeCategory("payment-method")).toBe("PAYMENT_METHOD");
  });

  it("공백이 포함된 문자열을 SNAKE_CASE로 변환한다", () => {
    expect(normalizeCategory("user role")).toBe("USER_ROLE");
    expect(normalizeCategory("payment method")).toBe("PAYMENT_METHOD");
  });

  it("대문자로 변환한다", () => {
    expect(normalizeCategory("userRole")).toBe("USER_ROLE");
    expect(normalizeCategory("UserRole")).toBe("USER_ROLE");
    expect(normalizeCategory("USER_ROLE")).toBe("USER_ROLE");
  });

  it("연속된 구분자를 하나로 통합한다", () => {
    expect(normalizeCategory("user__role")).toBe("USER_ROLE");
    expect(normalizeCategory("user---role")).toBe("USER_ROLE");
    expect(normalizeCategory("user   role")).toBe("USER_ROLE");
  });

  it("앞뒤 공백과 구분자를 제거한다", () => {
    expect(normalizeCategory("  userRole  ")).toBe("USER_ROLE");
    expect(normalizeCategory("_userRole_")).toBe("USER_ROLE");
    expect(normalizeCategory("-userRole-")).toBe("USER_ROLE");
  });

  it("빈 문자열이면 에러를 던진다", () => {
    expect(() => normalizeCategory("")).toThrow("category must be a non-empty string");
    expect(() => normalizeCategory("   ")).toThrow("category must be a non-empty string");
  });
});
