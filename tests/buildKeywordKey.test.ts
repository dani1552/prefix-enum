import { describe, it, expect } from "vitest";
import { buildKeywordKey } from "../src/core/prefixEnum.js";

describe("buildKeywordKey", () => {
  it("카테고리와 값을 결합해 일관된 키를 만든다", () => {
    expect(buildKeywordKey("userRole", "admin")).toBe("USER_ROLE_ADMIN");
    expect(buildKeywordKey("paymentMethod", "creditCard")).toBe("PAYMENT_METHOD_CREDIT_CARD");
    expect(buildKeywordKey("orderStatus", "pending")).toBe("ORDER_STATUS_PENDING");
  });

  it("대소문자 차이를 통일한다", () => {
    expect(buildKeywordKey("userRole", "admin")).toBe("USER_ROLE_ADMIN");
    expect(buildKeywordKey("UserRole", "Admin")).toBe("USER_ROLE_ADMIN");
    expect(buildKeywordKey("USER_ROLE", "ADMIN")).toBe("USER_ROLE_ADMIN");
  });

  it("다양한 형식의 카테고리와 값을 처리한다", () => {
    expect(buildKeywordKey("user-role", "admin-user")).toBe("USER_ROLE_ADMIN_USER");
    expect(buildKeywordKey("user role", "admin user")).toBe("USER_ROLE_ADMIN_USER");
    expect(buildKeywordKey("userRole", "adminUser")).toBe("USER_ROLE_ADMIN_USER");
  });

  it("카테고리와 값 사이에 언더스코어를 사용한다", () => {
    const key = buildKeywordKey("category", "value");
    expect(key).toBe("CATEGORY_VALUE");
    expect(key.split("_")).toHaveLength(2);
  });
});
