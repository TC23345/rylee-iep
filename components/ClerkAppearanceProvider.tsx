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
              colorPrimary: "#d4a84b",
              colorText: "#ede7d9",
              colorTextSecondary: "#a2977f",
              colorBackground: "#1e1b14",
              colorInputBackground: "#16140f",
              colorInputText: "#ede7d9",
              colorNeutral: "#ede7d9",
              borderRadius: "8px",
              fontFamily: "var(--font-dm-sans)",
            }
          : {
              colorPrimary: "#d4a84b",
              colorText: "#1c1a15",
              colorTextSecondary: "#7a7060",
              colorBackground: "#fffefb",
              colorInputBackground: "#fffefb",
              colorInputText: "#1c1a15",
              colorNeutral: "#1c1a15",
              borderRadius: "8px",
              fontFamily: "var(--font-dm-sans)",
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
