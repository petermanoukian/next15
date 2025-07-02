'use client';

import React, { useCallback } from 'react';
import { debounce } from 'lodash';
import Select from "react-select";

type TaggType = {
  id: string;
  name: string;
 
};

type CatType = {
  id: number;
  name: string;
};


type SubCatType = {
  id: number;
  catid: number;
  name: string;
};



interface Props {
  setSearchTerm: (value: string) => void;
  cats?: CatType[]; 
  selectedCatId?: number | null;
  setCategoryid: (value: number | null) => void;
  subcats?: SubCatType[];

  selectedSubCatId?: number | null;
  setSubcategoryid: (value: number | null) => void;
  taggs?: TaggType[];
  selectedTaggId?: string | null;
  setSelectedTaggId: (value: string | null) => void;
}

export default function ProdFilterHeader({ 
    setSearchTerm , cats , selectedCatId, setCategoryid , subcats ,
    taggs, selectedTaggId, setSelectedTaggId,
     selectedSubCatId, setSubcategoryid }: Props) {
  // Debounced search function (waits 300ms after user stops typing)
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

    const categoryOptions = [
    { value: '', label: "All Categories" }, 
    ...(cats ? cats.map(cat => ({ value: cat.id, label: cat.name })) : [])
    ];

    const subcategoryOptions = [
      { value: '', label: "All Subcategories" }, 
      ...(subcats ? subcats.map(subcat => ({ value: subcat.id, label: subcat.name })) : [])
    ];

    const taggOptions = [
    { value: '', label: "All Tags" },
    ...(taggs ? taggs.map(t => ({ value: t.id.toString(), label: t.name })) : [])
  ];

    console.log("Category Options:", categoryOptions); // ✅ Debug log
    console.log("Subcategory Options:", subcategoryOptions); // ✅ Debug log

  return (
    <div className="p-4 bg-gray-100 rounded shadow flex items-center gap-4">

        <Select
          options={categoryOptions}
          value={
            categoryOptions.find(
              option => String(option.value) === String(selectedCatId)
            ) || null
          }
          onChange={(option) => {
            const newVal = option?.value;
            console.log("✅ Category changed to newVal:", newVal);
            const normalized = newVal === '' || newVal === null ? null : Number(newVal);
            console.log("✅ component normalized Category changed to:", normalized);
            setCategoryid(normalized);
          }}
          placeholder="Select Category"
          className="w-[40%] p-2 border rounded"
        />

        <Select
          options={subcategoryOptions}
          value={
            subcategoryOptions.find(
              option => String(option.value) === String(selectedSubCatId)
            ) || null
          }
          onChange={(option) => {
            const newVal = option?.value;
            const normalized = newVal === '' || newVal === null ? null : Number(newVal);
            console.log("✅ Subcategory changed to:", normalized);
            setSubcategoryid(normalized);
          }}
          placeholder="Select Subcategory"
          className="w-[40%] p-2 border rounded"
        />

        <input
            type="text"
            placeholder="Search subcategory..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-[40%] p-2 border rounded"
        />

        <Select
          options={taggOptions}
          value={
            taggOptions.find(option => option.value === String(selectedTaggId)) || null
          }
          onChange={(option) => {
            const newVal = option?.value;
            const normalized = newVal === '' || newVal === null ? null : newVal;
            console.log("✅ Tagg changed to:", normalized);
            setSelectedTaggId(normalized);
          }}
          placeholder="Select Tagg"
          className="w-[40%] p-2 border rounded"
        />



    </div>
  );
}
