import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Christian Dela Cruz | IT",
  description:
    "Full-stack developer with expertise in mobile app development, networking, and cloud infrastructure.",
  icons: {
    icon: "/favicon.png?v=" + new Date().getTime(), // Cache buster
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let logoImageUrl = "/favicon.png";
  try {
    const { data } = await supabase.from("profile").select("logo_image_url").maybeSingle();
    if (data?.logo_image_url) {
      logoImageUrl = data.logo_image_url;
    }
  } catch (e) {
    console.warn("Supabase fetch logo failed in layout:", e);
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar logoImageUrl={logoImageUrl} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}


