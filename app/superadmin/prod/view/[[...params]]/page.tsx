// app\superadmin\prod\view\[[...params]]\page.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';
//import Image from 'next/image';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import  Pagination  from '@/app/components/superadmin/Pagination';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

import ProdFilterHeader from '@/app/components/superadmin/shop/prod/ProdFilterHeader';
import ProdTableHeader from '@/app/components/superadmin/shop/prod/ProdTableHeader';
import ProdTableRow  from '@/app/components/superadmin/shop/prod/ProdTableRow';
import { APP_API_URL } from '@/lib/config';

type Prod = {
  id: number;
  catid: number;
  subcatid: number;
  name: string;
  image_url: string
  file_url: string | null
 
};

type Subcat = {
  id: number;
  catid: number;
  name: string;
};

type Cat = {
  id: number;
  name: string;
};

type TaggType = {
  id: number;
  name: string;
};

export default function ViewProdsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [subcats, setSubcats] = useState<Subcat[]>([]);

  const [prods, setProds] = useState<Prod[]>([]);
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

  const params = useParams();
  const [categoryid, setCategoryid] = useState<number | null>(null);
  const [subcategoryid, setSubcategoryid] = useState<number | null>(null);
  const hasUserSelectedFilters = useRef(false);

  const [selectedTaggId, setSelectedTaggId] = useState<string | null>(null);
  //const [availableTaggs, setAvailableTaggs] = useState<any[]>([]);
  const [availableTaggs, setAvailableTaggs] = useState<TaggType[]>([]);
  const [selectedTaggIds, setSelectedTaggIds] = useState<string[]>([]);

  const setCategoryidWithIntent = (val: number | null) => {
    hasUserSelectedFilters.current = true;
    setCategoryid(val);
    setSubcategoryid(null);
  };

  const setSubcategoryidWithIntent = (val: number | null) => {
    hasUserSelectedFilters.current = true;
    setSubcategoryid(val);
  };


  const hasSyncedFromUrl = useRef(false);
  useEffect(() => {
    
    const routeParams = params.params || []; // fallback to empty array
    const routeCatid = routeParams[0] ? Number(routeParams[0]) : null;

    const queryCatid = searchParams.get('catid');
    const finalCatid = routeCatid ?? (queryCatid ? Number(queryCatid) : null);

    console.log('queryCatid:', queryCatid, '| routeCatid:', routeCatid, '| finalCatid:', finalCatid);
 
  }, [params, searchParams]);


  useEffect(() => {
  
    const routeParams = params.params || []; // fallback to an empty array if undefined
    const routeSubcatid = routeParams[1] ? Number(routeParams[1]) : null;
    const querySubcatid = searchParams.get('subcatid');
    const finalSubcatid = routeSubcatid ?? (querySubcatid ? Number(querySubcatid) : null);

    if (finalSubcatid !== subcategoryid) {
      setSubcategoryid(finalSubcatid);
      console.log('🔄 Setting subcategoryid:', finalSubcatid);
    }
    
  }, [params, searchParams]);



  useEffect(() => {
    console.log("Line 106 Updated categoryid:", categoryid);
  }, [categoryid]);

  useEffect(() => {
    console.log("Line 110 Updated subcategoryid:", subcategoryid);
  }, [subcategoryid]);
 
      useEffect(() => {
    const taggidParam = searchParams.get('taggid');
    if (taggidParam && /^\d+$/.test(taggidParam)) {
      setSelectedTaggId(taggidParam);
      console.log('🟢 taggid from query string:', taggidParam);
    }
  }, [searchParams]);


  useEffect(() => {
    console.log('important useEffect triggered line 111 ');
    // Determine valid category and subcategory values
    const routeParams = Array.isArray(params?.params) ? params.params : [];
    const routeCatid = routeParams[0] ? Number(routeParams[0]) : null;
    const routeSubcatid = routeParams[1] ? Number(routeParams[1]) : null;

    const queryCatid = searchParams.get('catid');
    const querySubcatid = searchParams.get('subcatid');

    const finalCatid = routeCatid ?? (queryCatid ? Number(queryCatid) : null);
    const finalSubcatid = routeSubcatid ?? (querySubcatid ? Number(querySubcatid) : null);

    console.log('finalCatid ' , finalCatid);
    console.log('finalSubcatid ' , finalSubcatid);
    console.log('routeCatid ' , routeCatid);
    console.log('routeSubcatid ' , routeSubcatid);
    console.log('catid ' , categoryid);
    console.log('subcategoryid ' , subcategoryid);
    // Update state only when necessary

    if (!hasUserSelectedFilters.current && finalCatid !== null && finalCatid !== categoryid) {
      setCategoryid(finalCatid);
      setSubcategoryid(null); // Reset subcategoryid if category
      console.log("🟢 Set categoryid from params/query:", finalCatid);
    }

    if (!hasUserSelectedFilters.current && finalSubcatid !== null && finalSubcatid !== subcategoryid) {
      setSubcategoryid(finalSubcatid);
      console.log("🟢 Set subcategoryid from params/query:", finalSubcatid);
    }

    /*
    const effectiveCatid = categoryid ?? finalCatid;
    const effectiveSubcatid = subcategoryid ?? finalSubcatid;
    */
/*
    const effectiveCatid = hasUserSelectedFilters.current ? categoryid : (categoryid ?? finalCatid);
    const effectiveSubcatid = hasUserSelectedFilters.current
      ? (categoryid ? subcategoryid : null)
      : (subcategoryid ?? finalSubcatid);
//selectedTaggId
    fetchProds({ selectedCatId: effectiveCatid, selectedSubCatId: effectiveSubcatid, selectedTaggIdParam: selectedTaggId });
*/

const effectiveCatid = hasUserSelectedFilters.current
  ? categoryid
  : (categoryid ?? finalCatid);

const effectiveSubcatid = hasUserSelectedFilters.current
  ? subcategoryid
  : (subcategoryid ?? finalSubcatid);

fetchProds({
  selectedCatId: effectiveCatid,
  selectedSubCatId: effectiveSubcatid,
  selectedTaggIdParam: selectedTaggId
});

    
  }, [searchParams, params, reset, sortBy, sortOrder, searchTerm, categoryid, subcategoryid, selectedTaggId]);




  const fetchProds = async ({
      baseUrl = '/api/superadmin/prods/viewprods',
      search = searchTerm,
      selectedCatId = categoryid,
      selectedSubCatId = subcategoryid,
      selectedTaggIdParam = selectedTaggId
    } = {}) => {
    try {
      console.log("🔍 Fetching prods...");
      console.log("➡️ Selected Category ID:", selectedCatId);
      console.log("➡️ Selected Subcategory ID:", selectedSubCatId);
      console.log("🔍 Search Term:", search);
      console.log("🔽 Sorting:", { sortBy, sortOrder });
      
      const url = new URL(baseUrl, window.location.origin);
      console.log("🌐 Base URL:", url.toString()); // Debugging base URL

      const page = searchParams.get('page') ?? '1';
      url.searchParams.set('page', page);


      url.searchParams.set('sort_by', sortBy);
      url.searchParams.set('sort_order', sortOrder);
      if (search) url.searchParams.set('search', search);
      if (selectedCatId) url.searchParams.set('catid', selectedCatId.toString());
      if (selectedSubCatId) url.searchParams.set('subcatid', selectedSubCatId.toString());
      if (selectedTaggIdParam) {
        console.log("🔍 Selected Tagg ID:", selectedTaggIdParam);
        url.searchParams.set('taggid', selectedTaggIdParam.toString());
      }
      console.log("🌎 Final API Request URL:", url.toString()); // Debugging request URL

      const res = await api.get(url.toString());
      
      console.log("✅ API Response:", res.data);

      setSubcats(res.data.subcats);
      setCats(res.data.cats);
      setProds(res.data.data);
      setAvailableTaggs(res.data.taggs || []); // Ensure taggs are set
      console.log("📌 Setting Pagination with:", {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        links: res.data.links,
      });

      setPagination((prev) => {
        //console.log("🕵️‍♂️ Previous Pagination:", prev);
        //console.log("📌 API Returned Pagination:", res.data.current_page, res.data.last_page);

        return {
          current_page: res.data.current_page ?? prev?.current_page ?? 1,
          last_page: res.data.last_page ?? prev?.last_page ?? 1,
          links: res.data.links ?? prev?.links ?? [],
        };
      });


      //console.log("📌 Updated Pagination State:", pagination);

      if (selectedCatId !== null) {
        console.log("🔄 Updating URL with categoryid:", selectedCatId);
      }
      if (selectedSubCatId !== null) {
        console.log("🔄 Updating URL with subcategoryid:", selectedSubCatId);
      }
      if (search) {
        console.log("🔄 Updating URL with search:", search);
      }
      if (sortBy) {
        console.log("🔄 Updating URL with sortBy:", sortBy);
      }
      /*
        router.replace(
          `/superadmin/subcat/view?sort_by=${sortBy}&sort_order=${sortOrder}&search=${search}&catid=${categoryid}`
        );
      */
    } catch (err) {
      console.error("❌ Error Fetching:", err);
    } finally {
      setLoading(false);
    }
  };


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
      await api.delete(`/api/superadmin/prod/deleteone/${id}`);

      fetchProds(); 
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
    if (selectedIds.length === prods.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(prods.map((u) => u.id));
    }
  };

  const handleMultiDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected records?`);
    if (!confirmed) return;

    try {
      await api.post('/api/superadmin/prods/multidelete', {
        ids: selectedIds,
      });

      setSelectedIds([]);
      fetchProds();
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Something went wrong deleting users.');
    }
  };

  /*
  const updateQueryParam = (key: string, value: string | null) => {
      const current = new URLSearchParams(Array.from(searchParams.entries())); // preserve other params

      if (value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, value);
      }

      const newSearch = current.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;

      window.history.replaceState(null, '', newUrl);
  };
  */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (categoryid) {
      query.set('catid', categoryid.toString());
    } else {
      query.delete('catid');
    }

    if (subcategoryid && categoryid) {
      query.set('subcatid', subcategoryid.toString());
    } else {
      query.delete('subcatid');
    }

    const newUrl = `${window.location.pathname}?${query.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [categoryid, subcategoryid]);


useEffect(() => {
  if (reset) {
    setSortBy('id');
    setSortOrder('desc');
    setSearchTerm('');
    setCategoryid(null);
    setSubcategoryid(null);
    setSelectedTaggId(null);
    setSelectedTaggIds([]);
    const newUrl = `${window.location.pathname}`;
    window.history.replaceState(null, '', newUrl);
  }
}, [reset]);


  console.log("final subcats:", subcats); 
  if (categoryid === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        {selectedTaggId && (
          <div className="text-sm text-gray-600 mt-2">
            Filtering by tag ID: <strong>{selectedTaggId}</strong>
          </div>
        )};

      
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <div className='mt-2 mb-4'>
  
      <Link
        href={`/superadmin/prod/add${categoryid ? `/${categoryid}` : ''}${
          subcategoryid ? `/${subcategoryid}` : ''
        }`}
        className="mt-2 mb-4"
      >
        &rsaquo; Add product 
      </Link>


      </div>
      
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (

        <>
   
        <ProdFilterHeader
          setSearchTerm={setSearchTerm}
          cats={cats}
          selectedCatId={categoryid}
          setCategoryid={setCategoryidWithIntent}
          subcats={subcats}
          prods={prods}
          selectedSubCatId={subcategoryid}
          setSubcategoryid={setSubcategoryidWithIntent}
            taggs={availableTaggs}
  selectedTaggId={selectedTaggId}
  setSelectedTaggId={setSelectedTaggId}
        />



        <table className="w-full border-collapse border border-gray-200">
        
          <ProdTableHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} 
          toggleSelectAll ={toggleSelectAll}
          allSelected={
              Array.isArray(prods) && prods.length > 0 &&
              selectedIds.length === prods.length
            }

           
           />


          <tbody>
            {prods.map((prod) => (
              <ProdTableRow 
                key={prod.id}
                prod={prod}
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
      
    {categoryid !== undefined && subcategoryid !== undefined && (
     
     <Pagination
      pagination={pagination}

      onPageChange={(url: string) => {
        const pageParam = new URL(url, window.location.origin).searchParams.get('page');
        if (pageParam) {
          const query = new URLSearchParams(window.location.search);
          query.set('page', pageParam);

          const newUrl = `${window.location.pathname}?${query.toString()}`;
          history.replaceState(null, '', newUrl); // silent URL update

          // Then trigger re-fetch with updated URL param
          fetchProds(); // will now pick up the page from useSearchParams
        }
      }}

    />

    )}

      
    </div>
  );
}



