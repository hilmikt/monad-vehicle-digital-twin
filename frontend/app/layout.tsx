import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import ActivityFeed from "../components/ActivityFeed";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Monad Vehicle Digital Twin",
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

                    <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 flex gap-8 relative">
                        {/* Main Content Area */}
                        <main className="flex-1 min-w-0">
                            {children}
                        </main>

                        {/* Activity Feed Sidebar (Desktop - Floating/Sticky) */}
                        <aside className="hidden xl:block w-80 flex-shrink-0">
                            <div className="sticky top-24 h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100">
                                <ActivityFeed />
                            </div>
                        </aside>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
