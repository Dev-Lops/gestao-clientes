import {
  INVITATION_EMAIL_FROM,
  RESEND_API_KEY,
  getSiteUrl,
} from "@/config/env";
import { Resend } from "resend";

export interface SendInvitationEmailInput {
  email: string;
  token: string;
  role: "staff" | "client";
  orgName?: string | null;
  expiresAt?: string | null;
  fullName?: string | null;
  clientName?: string | null;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }

  return resendClient;
}

export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<void> {
  const resend = getResendClient();

  if (!resend || !INVITATION_EMAIL_FROM) {
    console.warn(
      "⚠️ Provedor de e-mail não configurado. Convite não foi enviado.",
    );
    return;
  }

  const siteUrl = getSiteUrl("http://localhost:3000");
  const acceptUrl = new URL("/api/invite/accept", siteUrl);
  acceptUrl.searchParams.set("token", input.token);

  const recipientName = input.fullName ?? input.email;
  const areaLabel = input.role === "staff" ? "equipe" : "cliente";
  const targetName =
    input.clientName ?? input.orgName ?? "sua conta no Gestão+";

  const subject =
    input.role === "staff"
      ? "Você foi convidado para colaborar no Gestão+"
      : `Convite para acessar ${targetName}`;

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  const expirationCopy =
    expiresAt && Number.isFinite(expiresAt.getTime())
      ? `Este convite expira em ${expiresAt.toLocaleDateString("pt-BR")}.`
      : "Este convite expira em 7 dias.";

  const html = `
    <div style="font-family: Inter, Helvetica, Arial, sans-serif; color: #0f172a;">
      <h1 style="font-size: 20px;">Olá, ${recipientName}!</h1>
      <p>
        Você foi convidado a se juntar à ${areaLabel} de <strong>${targetName}</strong>
        no painel Gestão+. Clique no botão abaixo para confirmar seu acesso.
      </p>
      <p style="margin: 32px 0; text-align: center;">
        <a
          href="${acceptUrl.toString()}"
          style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600;"
        >
          Aceitar convite
        </a>
      </p>
      <p>${expirationCopy}</p>
      <p>
        Caso o botão não funcione, copie e cole o link abaixo no seu navegador:<br/>
        <a href="${acceptUrl.toString()}" style="color: #1d4ed8;">${acceptUrl.toString()}</a>
      </p>
    </div>
  `;

  const text = `Olá, ${recipientName}!

Você foi convidado(a) para acessar ${targetName} como parte da ${areaLabel}.
Confirme seu acesso pelo link: ${acceptUrl.toString()}
${expirationCopy}`;

  try {
    await resend.emails.send({
      from: INVITATION_EMAIL_FROM,
      to: input.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ Falha ao enviar e-mail de convite:", error);
  }
}
