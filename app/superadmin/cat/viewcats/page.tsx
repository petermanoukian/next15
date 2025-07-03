'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
//import Image from 'next/image';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import  Pagination  from '@/app/components/superadmin/Pagination';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import CatFilterHeader from '@/app/components/superadmin/shop/cat/CatFilterHeader';
import CatTableHeader from '@/app/components/superadmin/shop/cat/CatTableHeader';

import CatTableRow  from '@/app/components/superadmin/shop/cat/CatTableRow';

type Cat = {
  id: number;
  name: string;
};

export default function ViewCatsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
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

const fetchCats = async (
  basePath = '/api/superadmin/cats/viewcats',
  search = searchTerm
) => {
  try {
    const params = new URLSearchParams();
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);
    if (search) params.set('search', search);

    const fullUrl = api.defaults.baseURL + basePath + '?' + params.toString();

    alert('🌐 Final Full URL: ' + fullUrl);

    const res = await api.get(fullUrl); // now uses the correct Laravel backend

    setCats(res.data.data);
    setPagination({
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      links: res.data.links,
    });

    router.replace(
      `/superadmin/cat/viewcats?sort_by=${sortBy}&sort_order=${sortOrder}&search=${search}`
    );
  } catch (err) {
    console.error('Error fetching categories:', err);
    alert('❌ Axios request failed: ' + err.message);
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
    fetchCats(); // triggers fetch on sort/filter/search
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
      await api.delete(`/api/superadmin/cat/deleteone/${id}`);
    

      // Refresh the list
      fetchCats(); // your existing fetch logic
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
    if (selectedIds.length === cats.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cats.map((u) => u.id));
    }
  };

  const handleMultiDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected records?`);
    if (!confirmed) return;

    try {
      await api.post('/api/superadmin/cats/multidelete', {
        ids: selectedIds,
      });

      setSelectedIds([]);
      fetchCats();
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Something went wrong deleting users.');
    }
  };



  return (
    <div>
      
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      <div className='mt-2 mb-4'>
        <Link href = '/superadmin/cat/addcat' className='mt-2 mb-4'> &rsaquo; Add Category </Link>
      </div>
      
      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (

        <>

        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🛠 Axios Instance (api)</h3>

            <div className="bg-green-50 p-4 rounded text-sm font-mono text-gray-800">
                <p><strong>Axios Type:</strong> {typeof api}</p>
                <p><strong>Has .get:</strong> {typeof api.get === 'function' ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Has .post:</strong> {typeof api.post === 'function' ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Defaults baseURL:</strong> {api.defaults.baseURL}</p>

                <p className="mt-2"><strong>Defaults Headers:</strong></p>
                <pre className="overflow-x-auto">{JSON.stringify(api.defaults.headers, null, 2)}</pre>
            </div>
        </div>




        <CatFilterHeader setSearchTerm={setSearchTerm} />

        <table className="w-full border-collapse border border-gray-200">
          <CatTableHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} 
          toggleSelectAll ={toggleSelectAll}
           allSelected={selectedIds.length === cats.length && cats.length > 0}/>

          <tbody>
            {cats.map((cat) => (
              <CatTableRow
                key={cat.id}
                cat={cat}
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
       <Pagination pagination={pagination} onPageChange={fetchCats} /> 
      
    </div>
  );
}
