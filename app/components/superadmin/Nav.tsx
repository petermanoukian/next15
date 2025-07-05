'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuperAdminNav() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('🧭 SuperAdminNav hydrated');
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('❌ Logout failed:', error);
        }
    };

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-6">
                        <Link href="/superadmin" className="text-xl font-bold text-gray-800">
                            SuperAdmin
                        </Link>

                        {/* Users */}
                        <div className="relative group">
                            <button className="text-gray-700 font-medium hover:text-gray-900">Users</button>
                            <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <Link href="/superadmin/user/adduser" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Add</Link>
                                <Link href="/superadmin/user/view?reset=1" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">View</Link>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="relative group">
                            <button className="text-gray-700 font-medium hover:text-gray-900">Categories</button>
                            <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <Link href="/superadmin/cat/addcat" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Add</Link>
                                <Link href="/superadmin/cat/viewcats?reset=1" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">View</Link>
                            </div>
                        </div>

                        {/* Subcategories */}
                        <div className="relative group">
                            <button className="text-gray-700 font-medium hover:text-gray-900">Subcategories</button>
                            <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <Link href="/superadmin/subcat/add" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Add</Link>
                                <Link href="/superadmin/subcat/view?reset=1" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">View</Link>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="relative group">
                            <button className="text-gray-700 font-medium hover:text-gray-900">Products</button>
                            <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <Link href="/superadmin/prod/add" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Add</Link>
                                <Link href="/superadmin/prod/view?reset=1" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">View</Link>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="relative group">
                            <button className="text-gray-700 font-medium hover:text-gray-900">Tags</button>
                            <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <Link href="/superadmin/tagg/add" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Add</Link>
                                <Link href="/superadmin/tagg/view" className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">View</Link>
                            </div>
                        </div>
                    </div>

                    {/* Authenticated User Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium">
                            <span>{user?.name}</span>
                            <span className="text-sm text-gray-500">({user?.is_admin})</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <Link 
                            href={`/superadmin/user/edit/${user?.id}`}
                            className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">
                                Edit Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
