import { prisma } from "@/lib/prisma";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpCode(email: string) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTP for this email
  await prisma.otpCode.deleteMany({ where: { email } });

  // Create new OTP
  const otpCode = await prisma.otpCode.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

export async function verifyOtpCode(email: string, code: string) {
  const otpCode = await prisma.otpCode.findFirst({
    where: { email, code },
  });

  if (!otpCode) {
    return { valid: false, expired: false };
  }

  if (otpCode.expiresAt < new Date()) {
    await prisma.otpCode.delete({ where: { id: otpCode.id } });
    return { valid: false, expired: true };
  }

  return { valid: true, expired: false };
}

export async function deleteOtpCode(email: string) {
  await prisma.otpCode.deleteMany({ where: { email } });
}
