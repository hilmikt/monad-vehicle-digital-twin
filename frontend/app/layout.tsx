import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { AppShell } from "../components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MonaDrive",
    description: "A digital twin marketplace for vehicles on Monad Testnet",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
                <Providers>
                    <Navbar />

                    <AppShell>{children}</AppShell>
                </Providers>
            </body>
        </html>
    );
}
