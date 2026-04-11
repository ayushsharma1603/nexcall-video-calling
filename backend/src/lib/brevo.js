const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "NexCall";

  if (!apiKey || !senderEmail) {
    throw new Error(
      "Brevo is not configured. Add BREVO_API_KEY and BREVO_SENDER_EMAIL."
    );
  }

  return { apiKey, senderEmail, senderName };
}

export async function sendSignupOtpEmail({
  email,
  fullName,
  otp,
  expiresInMinutes,
}) {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();
  const safeName = escapeHtml(fullName || "there");
  const safeOtp = escapeHtml(otp);

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email,
          name: fullName,
        },
      ],
      subject: "Your NexCall verification code",
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
            <p>Hi ${safeName},</p>
            <p>Use the verification code below to complete your NexCall sign-up:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">
              ${safeOtp}
            </p>
            <p>This code expires in ${expiresInMinutes} minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </body>
        </html>
      `,
      textContent: `Hi ${fullName || "there"}, your NexCall verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.code || "Brevo failed to send the verification email.";
    throw new Error(errorMessage);
  }

  return data;
}
