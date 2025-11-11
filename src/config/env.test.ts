describe("env config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("parses owner emails and respects configured site url", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_SITE_URL = "https://mysite.test";
    process.env.OWNER_EMAILS =
      "One@example.com, two@example.com, , three@example.com ";

    const env = await import("./env");

    expect(env.OWNER_EMAILS).toEqual([
      "one@example.com",
      "two@example.com",
      "three@example.com",
    ]);
    expect(env.getSiteUrl("https://fallback.test")).toBe("https://mysite.test");
  });

  it("returns defaults when optional environment variables are missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.OWNER_EMAILS;

    const env = await import("./env");

    expect(env.OWNER_EMAILS).toEqual([]);
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("");
    expect(env.getSiteUrl("https://fallback.test")).toBe(
      "https://fallback.test",
    );
  });
});
