declare module 'nodemailer' {
  const nodemailer: { createTransport: (options: Record<string, unknown>) => { sendMail: (mail: Record<string, unknown>) => Promise<unknown> } };
  export default nodemailer;
}
