'use client'

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Image from 'next/image';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import  Pagination  from '@/app/components/superadmin/Pagination';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import UserTableHeader from '@/app/components/superadmin/accounts/UserTableHeader';
import UserFilterHeader from '@/app/components/superadmin/accounts/UserFilterHeader';
import UserTableRow, { UserPerformer } from '@/app/components/superadmin/accounts/UserTableRow';
import { APP_API_URL } from '@/lib/config';


interface User {
  id: number
  name: string
  email: string
  is_admin: string

  
}

export default function ViewUsersPage() {
  const [userrs, setUserrs] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  //const { user, isInitialLoad} = useSuperActions();
  const { user} = useSuperActions();

  const [pagination, setPagination] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const reset = searchParams.get('reset');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async (
    baseUrl = '/api/superadmin/users/viewuser',
    search = searchTerm,
    role = roleFilter
  ) => {
    try {
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set('sort_by', sortBy);
      url.searchParams.set('sort_order', sortOrder);
      if (search) url.searchParams.set('search', search);
      if (role) url.searchParams.set('role', role);

      //const res = await api.get(url.toString());

      const cleanPath = baseUrl.replace(/^\/+/, '');
      const fullUrl = api.defaults.baseURL + cleanPath + '?' + url.searchParams.toString();
      const res = await api.get(fullUrl); // now uses the correct Laravel backend



      setUserrs(res.data.data);

      const sanitizePaginationUrl = (url: string): string => {
        if (!url) return '';

        const escapedURL = APP_API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const stripped = url.replace(new RegExp(`^${escapedURL}`), '');

        const firstQ = stripped.indexOf('?');
        const secondQ = stripped.indexOf('?', firstQ + 1);

        return secondQ !== -1
          ? stripped.slice(0, secondQ) + '&' + stripped.slice(secondQ + 1)
          : stripped;
      };

      setPagination(prev => ({
        current_page: res.data.current_page ?? prev?.current_page ?? 1,
        last_page: res.data.last_page ?? prev?.last_page ?? 1,
        links: (res.data.links ?? prev?.links ?? []).map(link => {
          const sanitizedUrl = link.url ? sanitizePaginationUrl(link.url) : null;
          const finalUrl = sanitizedUrl ? appendQueryParams(sanitizedUrl) : null;

          return {
            ...link,
            url: finalUrl,
          };
        }),
      }));



      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        links: res.data.links,
      });

      router.replace(
        `/superadmin/user/view?sort_by=${sortBy}&sort_order=${sortOrder}&search=${search}&role=${role}`
      );
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (reset) {
      setSortBy('id');
      setSortOrder('desc');
      setSearchTerm('');
      setRoleFilter('');
    }
  }, [reset]);


  useEffect(() => {
    fetchUsers(); // triggers fetch on sort/filter/search
  }, [reset, sortBy, sortOrder, searchTerm, roleFilter]);



  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await api.delete(`/api/superadmin/user/deleteoneuser/${id}`);
    

      // Refresh the list
      fetchUsers(); // your existing fetch logic
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 403) {
        alert('You cannot delete yourself.');
      } else if (error.response?.status === 404) {
        alert('User not found.');
      } else {
        alert('An error occurred while deleting the user.');
      }
    }
  };


  const adaptedUser = user as UserPerformer | null;

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === userrs.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(userrs.map((u) => u.id));
    }
  };

  const handleMultiDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedUserIds.length} selected users?`);
    if (!confirmed) return;

    try {
      await api.post('/api/superadmin/users/multidelete', {
        ids: selectedUserIds,
      });

      setSelectedUserIds([]);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Something went wrong deleting users.');
    }
  };



  if (loading) return <p className="p-4">Loading users...</p>

  return (
    <div className="p-4">

      <h1 className="text-2xl font-semibold mb-4">All Users</h1>
      <div className='mt-2 mb-4'>
        <Link href = '/superadmin/user/adduser' className='mt-2 mb-4'> &rsaquo; Add User </Link>
      </div>

      <UserFilterHeader
        search={searchTerm}
        setSearch={setSearchTerm}
        role={roleFilter}
        setRole={setRoleFilter}
      />

      <table className="w-full border-collapse border">
        <UserTableHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} 
        toggleSelectAll={toggleSelectAll}
        allSelected={selectedUserIds.length === userrs.length && userrs.length > 0}
        />
        <tbody>
        
        {userrs.map((userr) => (
            <UserTableRow
              key={userr.id}
              userr={userr}
              user={adaptedUser}
              handleDelete={handleDelete}
              isSelected={selectedUserIds.includes(userr.id)}
              toggleSelectUser={toggleSelectUser}
            />
        ))}

        </tbody>
      </table>

      {selectedUserIds.length > 0 && (
        <>
        <div className = 'w-full mt-5 flex flex items-center justify-center'>
        <button
          onClick={handleMultiDelete}
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete Selected
        </button>
        </div>
        </>
      )}
      <Pagination pagination={pagination} onPageChange={fetchUsers} />
    </div>
  )
}
