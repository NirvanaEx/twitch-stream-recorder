import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "./components/app-shell";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "Twitch Stream Recorder",
  description: "Realtime Twitch archive recorder and chat replay panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
