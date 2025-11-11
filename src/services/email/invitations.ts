export interface SendInvitationEmailInput {
  email: string;
  token: string;
  role: "staff" | "client";
  orgName?: string | null;
  expiresAt?: string | null;
  fullName?: string | null;
  clientName?: string | null;
}

export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<void> {
  void input;
  // Integração com provedor de e-mail deve ser implementada pela aplicação.
}
