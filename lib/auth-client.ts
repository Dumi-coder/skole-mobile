import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

if (!baseURL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. " +
      "Create a .env file with EXPO_PUBLIC_API_URL=<your API URL>. " +
      "For local development with Google login, use an HTTPS tunnel URL.",
  );
}

export const authClient = createAuthClient({
  baseURL,
  basePath: "/v1/auth",
  plugins: [
    expoClient({
      scheme: "skole",
      storagePrefix: "skole",
      cookiePrefix: "skole",
      storage: SecureStore,
    }),
  ],
});
