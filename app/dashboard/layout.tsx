'use client';

import LogoutButton from '@/app/components/LogoutButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-white font-bold text-xl">Dashboard</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link
                                        href="/dashboard"
                                        className={`${isActive('/dashboard')} rounded-md px-3 py-2 text-sm font-medium`}
                                    >
                                        Overview
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className={`${isActive('/dashboard/profile')} rounded-md px-3 py-2 text-sm font-medium`}
                                    >
                                        Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
} 