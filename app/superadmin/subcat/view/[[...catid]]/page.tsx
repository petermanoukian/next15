'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';
//import Image from 'next/image';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import  Pagination  from '@/app/components/superadmin/Pagination';
import { useSearchParams } from 'next/navigation';
//import { useRouter } from 'next/navigation';

import SubcatFilterHeader from '@/app/components/superadmin/shop/subcat/SubcatFilterHeader';
import SubcatTableHeader from '@/app/components/superadmin/shop/subcat/SubcatTableHeader';
import { useParams } from 'next/navigation';
import SubcatTableRow  from '@/app/components/superadmin/shop/subcat/SubcatTableRow';
import { APP_API_URL } from '@/lib/config';

type Subcat = {
  id: number;
  catid: number;
  name: string;
};

type Cat = {
  id: number;
  name: string;
};

export default function ViewSubcatsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
   const [subcats, setSubcats] = useState<Subcat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const reset = searchParams.get('reset');
  //const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { user} = useSuperActions();

  const params = useParams();
  const [categoryid, setCategoryid] = useState<number | null>(null);


useEffect(() => {
  const queryCatid = searchParams.get('catid'); // From query params
  const routeCatid = params.catid ? Number(params.catid) : null; // From dynamic route

  const finalCatid = routeCatid ?? (queryCatid ? Number(queryCatid) : null);

  if (finalCatid !== categoryid) { // ✅ Prevent unnecessary state updates
    setCategoryid(finalCatid);
    console.log("🔄 Setting categoryid:", finalCatid);
  }
}, [searchParams, params]);




const firstRender = useRef(true);


useEffect(() => {



    fetchSubcats();

}, []);

useEffect(() => {
  if (firstRender.current) {
    firstRender.current = false;
    return;
  }


    fetchSubcats();

}, [reset, sortBy, sortOrder, searchTerm, categoryid]);



const fetchSubcats = async (
  baseUrl = '/api/superadmin/subcats/viewsubcats',
  search = searchTerm,
  selectedCatId = categoryid
) => {
  try {
    console.log("🔍 Fetching Subcategories...");
    console.log("➡️ Selected Category ID:", selectedCatId);
    console.log("🔍 Search Term:", search);
    console.log("🔽 Sorting:", { sortBy, sortOrder });

    const params = new URLSearchParams();
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);
    if (search) params.set('search', search);
    if (selectedCatId) params.set('catid', selectedCatId.toString());

    const cleanPath = baseUrl.replace(/^\/+/, '');
    const finalUrl = api.defaults.baseURL + cleanPath + '?' + params.toString();
    console.log("🌐 Final URL:", finalUrl);

    const res = await api.get(finalUrl);

    setSubcats(res.data.data);
    setCats(res.data.cats);

	const sanitizePaginationUrl = (url: string): string => {
	  if (!url) return '';

	  // ✅ Collapse any duplicated `next15-laravel-public` sequences into one
	  const cleaned = url.replace(
		/(?:next15-laravel-public\/)+/g,
		'next15-laravel-public/'
	  );

	  // ✅ Fix second "?" to be "&"
	  const firstQ = cleaned.indexOf('?');
	  const secondQ = cleaned.indexOf('?', firstQ + 1);

	  return secondQ !== -1
		? cleaned.slice(0, secondQ) + '&' + cleaned.slice(secondQ + 1)
		: cleaned;
	};


    const appendQueryParams = (url: string): string => {
      if (!url) return '';

      const separator = url.includes('?') ? '&' : '?';

      const params = new URLSearchParams();
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      if (searchTerm) params.set('search', searchTerm);
      if (categoryid) params.set('catid', categoryid.toString());

      return `${url}${separator}${params.toString()}`;
    };

    setPagination({
      current_page: res.data.current_page ?? 1,
      last_page: res.data.last_page ?? 1,
      links: (res.data.links ?? []).map(link => {
        const sanitizedUrl = link.url ? sanitizePaginationUrl(link.url) : null;
        const finalUrl = sanitizedUrl ? appendQueryParams(sanitizedUrl) : null;

        return {
          ...link,
          url: finalUrl,
        };
      }),
    });
  } catch (err) {
    console.error("❌ Failed to fetch subcategories:", err);
  }
};

  /*
    setPagination((prev) => {
      console.log("🕵️‍♂️ Previous Pagination:", prev);
      console.log("📌 API Returned Pagination:", res.data.current_page, res.data.last_page);

      return {
        current_page: res.data.current_page ?? prev?.current_page ?? 1,
        last_page: res.data.last_page ?? prev?.last_page ?? 1,
        links: res.data.links ?? prev?.links ?? [],
      };
    });
  */



  useEffect(() => {
    if (reset) {
      setSortBy('id');
      setSortOrder('desc');
      setSearchTerm('');
      setCategoryid(null);
    }
  }, [reset]);



  useEffect(() => {
    console.log("Updated categoryid:", categoryid);
  }, [categoryid]);



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
      const cleanPath = `api/superadmin/subcat/deleteone/${id}`;
      const finalUrl = api.defaults.baseURL + cleanPath;
      await api.delete(finalUrl);

    

      // Refresh the list
      fetchSubcats(); // your existing fetch logic
    } catch (error: any) {
      alert(error);
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
    if (selectedIds.length === subcats.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subcats.map((u) => u.id));
    }
  };

  const handleMultiDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected records?`);
    if (!confirmed) return;

    try {
      const cleanPath = 'api/superadmin/subcats/multidelete';
      const finalUrl = api.defaults.baseURL + cleanPath;
      await api.post(finalUrl, { ids: selectedIds });


      setSelectedIds([]);
      fetchSubcats();
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Something went wrong deleting users.');
    }
  };

if (categoryid === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      
      <h1 className="text-2xl font-semibold mb-4">SubCategories version 2.02</h1>
      <div className='mt-2 mb-4'>
  
      <Link href={`/superadmin/subcat/add${categoryid ? `?catid=${categoryid}` : ''}`} className="mt-2 mb-4">
        &rsaquo; Add SubCategory
      </Link>

      </div>
      
      {loading ? (
        <p>Loading subcategories...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (

        <>
        <p> categoryid {categoryid}</p>
        <SubcatFilterHeader setSearchTerm={setSearchTerm} cats={cats} selectedCatId={categoryid} 
        setCategoryid={setCategoryid} />


        <table className="w-full border-collapse border border-gray-200">

          <SubcatTableHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} 
          toggleSelectAll ={toggleSelectAll}
           allSelected={selectedIds.length === subcats.length && subcats.length > 0}/>

          <tbody>
            {subcats.map((subcat) => (
              <SubcatTableRow 
                key={subcat.id}
                subcat={subcat}
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
      
       {categoryid !== undefined && (
          <Pagination pagination={pagination} onPageChange={fetchSubcats} />
        )}
      
    </div>
  );
}



