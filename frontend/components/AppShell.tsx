"use client";

import { usePathname } from "next/navigation";
import ActivityFeed from "../components/ActivityFeed";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideActivity = pathname.startsWith("/dashboard");

    return (
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 flex gap-8 relative">
            <main className="flex-1 min-w-0">{children}</main>

            {!hideActivity && (
                <aside className="hidden xl:block w-80 flex-shrink-0">
                    <div className="sticky top-24 h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100">
                        <ActivityFeed />
                    </div>
                </aside>
            )}
        </div>
    );
}
