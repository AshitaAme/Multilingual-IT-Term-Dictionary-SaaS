import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Leaf Dictionary Verification Code',
    html: `<p>Your code is: <strong>${token}</strong></p>`,
  });
}
