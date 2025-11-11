import { getSessionProfile } from "./session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MaybeMember = { org_id: string; role: string } | null;
type MaybeOrg = { id: string } | null;

type SupabaseMockConfig = {
  user: { id: string; email?: string | null } | null;
  member?: MaybeMember;
  org?: MaybeOrg;
};

type SupabaseAuthResponse = {
  data: { user: { id: string; email?: string | null } | null };
};

type MemberQueryChain = {
  select: jest.Mock;
  firstEq: jest.Mock;
  secondEq: jest.Mock;
  maybeSingle: jest.Mock;
};

type OrgQueryChain = {
  select: jest.Mock;
  eq: jest.Mock;
  maybeSingle: jest.Mock;
};

declare module "@/lib/supabase/server" {
  interface SupabaseServerClient {
    auth: {
      getUser: jest.Mock<Promise<SupabaseAuthResponse>, []>;
    };
    from: jest.Mock;
  }
}

jest.mock("@/lib/supabase/server");

const mockedCreateSupabaseServerClient = jest.mocked(
  createSupabaseServerClient,
);

function createMemberQuery(result: MaybeMember): MemberQueryChain {
  const maybeSingle = jest.fn().mockResolvedValue({ data: result ?? null });
  const secondEq = jest.fn().mockReturnValue({ maybeSingle });
  const firstEq = jest.fn().mockReturnValue({ eq: secondEq, maybeSingle });
  const select = jest.fn().mockReturnValue({ eq: firstEq });
  return { select, firstEq, secondEq, maybeSingle };
}

function createOrgQuery(result: MaybeOrg): OrgQueryChain {
  const maybeSingle = jest.fn().mockResolvedValue({ data: result ?? null });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  return { select, eq, maybeSingle };
}

function createSupabaseMock(config: SupabaseMockConfig) {
  const memberQuery = createMemberQuery(config.member ?? null);
  const orgQuery = createOrgQuery(config.org ?? null);

  const authGetUser = jest
    .fn<Promise<SupabaseAuthResponse>, []>()
    .mockResolvedValue({ data: { user: config.user } });

  const from = jest.fn((table: string) => {
    if (table === "app_members") {
      return { select: memberQuery.select };
    }
    if (table === "app_orgs") {
      return { select: orgQuery.select };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    auth: { getUser: authGetUser },
    from,
    memberQuery,
    orgQuery,
  };
}

describe("getSessionProfile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns null profile when there is no authenticated user", async () => {
    const supabaseMock = createSupabaseMock({ user: null });
    mockedCreateSupabaseServerClient.mockResolvedValueOnce(
      supabaseMock as never,
    );

    const result = await getSessionProfile();

    expect(result).toEqual({ user: null, orgId: null, role: null });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("returns member information when available", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-1", email: "member@example.com" },
      member: { org_id: "org-1", role: "staff" },
      org: null,
    });
    mockedCreateSupabaseServerClient.mockResolvedValueOnce(
      supabaseMock as never,
    );

    const result = await getSessionProfile();

    expect(result).toEqual({
      user: { id: "user-1", email: "member@example.com" },
      orgId: "org-1",
      role: "staff",
    });
    expect(supabaseMock.memberQuery.select).toHaveBeenCalledWith(
      "org_id, role",
    );
  });

  it("falls back to org ownership when member record is missing", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-2", email: "owner@example.com" },
      member: null,
      org: { id: "org-2" },
    });
    mockedCreateSupabaseServerClient.mockResolvedValueOnce(
      supabaseMock as never,
    );

    const result = await getSessionProfile();

    expect(result).toEqual({
      user: { id: "user-2", email: "owner@example.com" },
      orgId: "org-2",
      role: "owner",
    });
    expect(supabaseMock.orgQuery.select).toHaveBeenCalledWith("id");
  });

  it("returns authenticated user without org when no matches exist", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-3", email: "user@example.com" },
      member: null,
      org: null,
    });
    mockedCreateSupabaseServerClient.mockResolvedValueOnce(
      supabaseMock as never,
    );

    const result = await getSessionProfile();

    expect(result).toEqual({
      user: { id: "user-3", email: "user@example.com" },
      orgId: null,
      role: null,
    });
  });
});
