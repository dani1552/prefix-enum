import { describe, it, expect } from "vitest";
import { prefixEnum, buildKeywordMap, getKeywordLabel } from "../src/core/prefixEnum.js";

describe("getKeywordLabel", () => {
  it("존재하는 키의 라벨을 반환한다", () => {
    const result = prefixEnum("userRole", {
      admin: "Admin User",
      member: "Member User",
    });

    expect(getKeywordLabel(result, "USER_ROLE_ADMIN")).toBe("Admin User");
    expect(getKeywordLabel(result, "USER_ROLE_MEMBER")).toBe("Member User");
  });

  it("fallback 옵션을 적용한다", () => {
    const result = prefixEnum("userRole", {
      admin: "Admin User",
    });

    expect(getKeywordLabel(result, "USER_ROLE_UNKNOWN")).toBeUndefined();
    expect(getKeywordLabel(result, "USER_ROLE_UNKNOWN", { fallback: "Unknown" })).toBe("Unknown");
  });

  it("KeywordMap에서도 라벨을 가져올 수 있다", () => {
    const result = prefixEnum("status", {
      active: "Active",
      inactive: "Inactive",
    });

    expect(getKeywordLabel(result.map, "STATUS_ACTIVE")).toBe("Active");
    expect(getKeywordLabel(result.map, "STATUS_INACTIVE")).toBe("Inactive");
  });

  it("병합된 맵에서도 라벨을 가져올 수 있다", () => {
    const userRole = prefixEnum("userRole", {
      admin: "Admin",
    });

    const orderStatus = prefixEnum("orderStatus", {
      pending: "Pending",
    });

    const combined = buildKeywordMap([userRole, orderStatus]);

    expect(getKeywordLabel(combined, "USER_ROLE_ADMIN")).toBe("Admin");
    expect(getKeywordLabel(combined, "ORDER_STATUS_PENDING")).toBe("Pending");
  });

  it("존재하지 않는 키는 undefined를 반환한다", () => {
    const result = prefixEnum("status", {
      active: "Active",
    });

    expect(getKeywordLabel(result, "STATUS_UNKNOWN")).toBeUndefined();
  });
});
