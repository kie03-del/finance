import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode, deleteOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, code, name, password, job, annualWage, businessName, selectedBanks } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const { valid, expired } = await verifyOtpCode(email, code);

    if (!valid) {
      return NextResponse.json(
        { error: expired ? "Code has expired" : "Invalid code" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password server-side
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with onboarding data
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: true,
        job,
        annualWage: annualWage ? parseFloat(annualWage) : 0,
        businessName,
        selectedBanks: JSON.stringify(selectedBanks || []),
      },
    });

    // Delete OTP code after verification
    await deleteOtpCode(email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
