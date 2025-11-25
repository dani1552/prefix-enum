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
});
