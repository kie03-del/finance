import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createOtpCode } from "@/lib/otp";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const { code } = await createOtpCode(email);

    await resend.emails.send({
      from: "Katalyst Finances <noreply@resend.dev>",
      to: email,
      subject: "Verify your email - Katalyst Finances",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
