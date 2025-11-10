import { describe, expect, it, afterEach } from "@jest/globals";

describe("env config", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it("parses owner emails into normalized list", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.OWNER_EMAILS = "Admin@Example.com, other@example.com ";

    const { OWNER_EMAILS } = await import("@/config/env");

    expect(OWNER_EMAILS).toEqual(["admin@example.com", "other@example.com"]);
  });

  it("defaults to empty strings when env missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import("@/config/env");

    expect(SUPABASE_URL).toBe("");
    expect(SUPABASE_ANON_KEY).toBe("");
  });
});
