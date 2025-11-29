'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletConnectButton from './WalletConnectButton';

export default function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Marketplace', href: '/' },
        { name: 'Orders', href: '/orders' },
        { name: 'My Garage', href: '/dashboard' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-serif font-bold text-xl tracking-tighter group-hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20">
                            MD
                        </div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight font-serif">
                            MonaDrive
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${isActive
                                        ? 'text-black'
                                        : 'text-gray-500 hover:text-black'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Wallet Button */}
                    <div>
                        <WalletConnectButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
