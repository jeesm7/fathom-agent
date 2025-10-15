import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getGoogleClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("No Google account connected");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Auto-refresh token if needed
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
        },
      });
    }
  });

  return oauth2Client;
}

