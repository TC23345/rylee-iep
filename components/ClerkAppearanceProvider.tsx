"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

/**
 * Clerk's sign-in card and account menu, painted with the app's palette and
 * following the light / dark switch. Social buttons are always full-width
 * with their label so a phone never shows a bare logo.
 */
export function ClerkAppearanceProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: isDark
          ? {
              colorPrimary: "#2bbc2b",
              colorText: "#e6f1f0",
              colorTextSecondary: "#9db9bc",
              colorBackground: "#0b2c31",
              colorInputBackground: "#031a1e",
              colorInputText: "#e6f1f0",
              colorNeutral: "#e6f1f0",
              borderRadius: "8px",
              fontFamily: "var(--font-lato)",
            }
          : {
              colorPrimary: "#2bbc2b",
              colorText: "#042126",
              colorTextSecondary: "#4f6b6e",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#042126",
              colorNeutral: "#042126",
              borderRadius: "8px",
              fontFamily: "var(--font-lato)",
            },
        layout: {
          socialButtonsVariant: "blockButton",
          socialButtonsPlacement: "top",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
