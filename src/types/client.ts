import type { Tables } from "./supabase";

export type ClientStatus =
  | "new"
  | "onboarding"
  | "active"
  | "paused"
  | "closed";

export type AppClient = Tables<"app_clients">;
