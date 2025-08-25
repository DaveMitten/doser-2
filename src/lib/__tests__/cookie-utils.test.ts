import {
  setCookie,
  getCookie,
  deleteCookie,
  hasCookie,
  clearAllCookies,
} from "../cookie-utils";

import "@testing-library/jest-dom";

describe("Cookie Utilities", () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = "";
  });

  describe("setCookie", () => {
    test("should set a basic cookie", () => {
      setCookie("test", "value");
      expect(document.cookie).toContain("test=value");
    });

    it("should set cookie with path", () => {
      setCookie("test", "value", { path: "/auth" });
      expect(document.cookie).toContain("test=value");
      expect(document.cookie).toContain("Path=/auth");
    });

    it("should set secure cookie when explicitly specified", () => {
      setCookie("test", "value", { secure: true });
      expect(document.cookie).toContain("Secure");
    });

    it("should set secure cookie by default in production", () => {
      const originalEnv = process.env.NODE_ENV;

      // Clean way to mock environment variable for this test
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
        configurable: true,
      });

      setCookie("test", "value");
      expect(document.cookie).toContain("Secure");

      // Restore original environment
      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should set httpOnly cookie", () => {
      setCookie("test", "value", { httpOnly: true });
      expect(document.cookie).toContain("HttpOnly");
    });

    it("should set sameSite attribute", () => {
      setCookie("test", "value", { sameSite: "strict" });
      expect(document.cookie).toContain("SameSite=strict");
    });

    it("should set maxAge", () => {
      setCookie("test", "value", { maxAge: 3600 });
      expect(document.cookie).toContain("Max-Age=3600");
    });
  });

  describe("getCookie", () => {
    it("should get cookie value", () => {
      document.cookie = "test=value; other=cookie";
      expect(getCookie("test")).toBe("value");
    });

    it("should return null for non-existent cookie", () => {
      expect(getCookie("nonexistent")).toBeNull();
    });

    it("should handle multiple cookies", () => {
      document.cookie = "first=value1; second=value2; third=value3";
      expect(getCookie("first")).toBe("value1");
      expect(getCookie("second")).toBe("value2");
      expect(getCookie("third")).toBe("value3");
    });

    it("should handle cookies with spaces", () => {
      document.cookie = "test=value with spaces";
      expect(getCookie("test")).toBe("value with spaces");
    });
  });

  describe("hasCookie", () => {
    it("should return true for existing cookie", () => {
      document.cookie = "test=value";
      expect(hasCookie("test")).toBe(true);
    });

    it("should return false for non-existent cookie", () => {
      expect(hasCookie("nonexistent")).toBe(false);
    });
  });

  describe("deleteCookie", () => {
    it("should delete cookie", () => {
      document.cookie = "test=value";
      expect(hasCookie("test")).toBe(true);

      deleteCookie("test");
      expect(hasCookie("test")).toBe(false);
    });

    it("should delete cookie with specific path", () => {
      document.cookie = "test=value; Path=/auth";
      deleteCookie("test", "/auth");
      expect(hasCookie("test")).toBe(false);
    });
  });

  describe("clearAllCookies", () => {
    it("should clear all cookies", () => {
      document.cookie = "first=value1; second=value2; third=value3";
      expect(hasCookie("first")).toBe(true);
      expect(hasCookie("second")).toBe(true);
      expect(hasCookie("third")).toBe(true);

      clearAllCookies();

      expect(hasCookie("first")).toBe(false);
      expect(hasCookie("second")).toBe(false);
      expect(hasCookie("third")).toBe(false);
    });
  });

  describe("integration", () => {
    it("should work with full cookie lifecycle", () => {
      // Set cookie
      setCookie("lifecycle", "test-value");
      expect(hasCookie("lifecycle")).toBe(true);
      expect(getCookie("lifecycle")).toBe("test-value");

      // Update cookie
      setCookie("lifecycle", "updated-value");
      expect(getCookie("lifecycle")).toBe("updated-value");

      // Delete cookie
      deleteCookie("lifecycle");
      expect(hasCookie("lifecycle")).toBe(false);
      expect(getCookie("lifecycle")).toBeNull();
    });
  });
});
