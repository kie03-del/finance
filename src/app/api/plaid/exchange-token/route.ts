import { NextRequest, NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, publicToken } = await request.json();

    if (!userId || !publicToken) {
      return NextResponse.json(
        { error: "User ID and public token are required" },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account info
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    const institution = accountsResponse.data.institution;

    // Get auth info for better account details
    const authResponse = await plaidClient.authGet({
      access_token: accessToken,
    });

    const savedAccounts = [];

    // Save each account to database
    for (const account of accounts) {
      const authAccount = authResponse.data.accounts.find(
        (a) => a.account_id === account.account_id
      );

      const linkedAccount = await prisma.linkedBankAccount.create({
        data: {
          plaidItemId: itemId,
          bankName: institution?.name || "Unknown Bank",
          accountName: account.name,
          accountNumber: authAccount?.mask || undefined,
          balance: account.balances.current || 0,
          currency: account.balances.iso_currency_code || "GBP",
          plaidAccessToken: accessToken,
          userId,
        },
      });

      savedAccounts.push({
        id: linkedAccount.id,
        name: linkedAccount.accountName,
        balance: linkedAccount.balance,
      });
    }

    return NextResponse.json({
      success: true,
      accounts: savedAccounts,
    });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json(
      { error: "Failed to link bank account" },
      { status: 500 }
    );
  }
}
