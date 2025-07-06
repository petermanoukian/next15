'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
//import Image from 'next/image';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import  Pagination  from '@/app/components/superadmin/Pagination';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { APP_API_URL } from '@/lib/config';
import TagFilterHeader from '@/app/components/superadmin/tagg/TagFilterHeader';
import TagTableHeader from '@/app/components/superadmin/tagg/TagTableHeader';
import TagTableRow  from '@/app/components/superadmin/tagg/TagTableRow';

type Tagg = {
  id: number;
  name: string;
};

export default function ViewTaggsPage() {
  const [taggs, setTaggs] = useState<Tagg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const reset = searchParams.get('reset');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { user} = useSuperActions();

  const fetchTaggs = async (
    baseUrl = '/api/superadmin/taggs/viewtaggs',
    search = searchTerm,
    
  ) => {
    try {
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set('sort_by', sortBy);
      url.searchParams.set('sort_order', sortOrder);
      if (search) url.searchParams.set('search', search);
  

      const cleanPath = baseUrl.replace(/^\/+/, '');
      const fullUrl = api.defaults.baseURL + cleanPath + '?' + url.searchParams.toString();
      const res = await api.get(fullUrl);

      setTaggs(res.data.data);


      const sanitizePaginationUrl = (url: string): string => {
        if (!url) return '';

        const escapedBase = APP_API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const stripped = url.replace(new RegExp(`^${escapedBase}`), '');

        const firstQ = stripped.indexOf('?');
        const secondQ = stripped.indexOf('?', firstQ + 1);

        return secondQ !== -1
          ? stripped.slice(0, secondQ) + '&' + stripped.slice(secondQ + 1)
          : stripped;
      };

      const appendQueryParams = (url: string): string => {
        if (!url) return '';

        const separator = url.includes('?') ? '&' : '?';

        const params = new URLSearchParams();
        params.set('sort_by', sortBy);
        params.set('sort_order', sortOrder);
        if (searchTerm) params.set('search', searchTerm);

        return `${url}${separator}${params.toString()}`;
      };



setPagination({
  current_page: res.data.current_page,
  last_page: res.data.last_page,
  links: (res.data.links ?? []).map(link => {
    const raw = link.url || '';
    const clean = appendQueryParams(sanitizePaginationUrl(raw));
    return { ...link, url: clean };
  }),
});


      router.replace(
        `/superadmin/tagg/view?sort_by=${sortBy}&sort_order=${sortOrder}&search=${search}`
      );
    } catch (err) {
      console.error('Error fetching :', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (reset) {
      setSortBy('id');
      setSortOrder('desc');
      setSearchTerm('');
    }
  }, [reset]);


  useEffect(() => {
    fetchTaggs(); // triggers fetch on sort/filter/search
  }, [reset, sortBy, sortOrder, searchTerm]);



  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;

    try {
      await api.delete(`/api/superadmin/tagg/deleteone/${id}`);


      // Refresh the list
      fetchTaggs(); // your existing fetch logic
    } catch (error: any) {
      console.error('Error deleting user:', error);
     if (error.response?.status === 404) {
        alert(' not found.');
      } else {
        alert('An error occurred while deleting the record.');
      }
    }
  };


  

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === taggs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(taggs.map((u) => u.id));
    }
  };

  const handleMultiDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected records?`);
    if (!confirmed) return;

    try {
      await api.post('/api/superadmin/taggs/multidelete', {
        ids: selectedIds,
      });

      setSelectedIds([]);
      fetchTaggs();
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Something went wrong deleting users.');
    }
  };



  return (
    <div>
      
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      <div className='mt-2 mb-4'>
        <Link href = '/superadmin/tagg/add' className='mt-2 mb-4'> &rsaquo; Add Tagg </Link>
      </div>
      
      {loading ? (
        <p>Loading taggs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (

        <>
        <TagFilterHeader setSearchTerm={setSearchTerm} />

        <table className="w-full border-collapse border border-gray-200">
          <TagTableHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} 
          toggleSelectAll ={toggleSelectAll}
           allSelected={selectedIds.length === taggs.length && taggs.length > 0}/>

          <tbody>
            {taggs.map((tagg) => (
              <TagTableRow
                key={tagg.id}
                tagg={tagg}
                selectedIds={selectedIds}
                toggleSelect={toggleSelect}
                handleDelete={handleDelete}
                user={user ? { ...user, is_admin: user.is_admin ?? '' } : undefined} 
              />
            ))}
          </tbody>

        </table>

        {selectedIds.length > 0 && (
          <div className = 'w-full flex justify-center mt-4'>
          <button
            onClick={handleMultiDelete}
            className="px-4 py-2 bg-red-500 text-white border rounded hover:bg-red-600"
          >
            Delete Selected ({selectedIds.length})
          </button>
          </div>
        )}


        </>
      )}

      {/* Pagination  */}
       <Pagination pagination={pagination} onPageChange={fetchTaggs} /> 
      
    </div>
  );
}