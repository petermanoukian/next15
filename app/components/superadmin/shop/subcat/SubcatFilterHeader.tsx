'use client';

import React, { useCallback } from 'react';
import { debounce } from 'lodash';
import Select from "react-select";

type CatType = {
  id: number;
  name: string;
};


interface Props {
  setSearchTerm: (value: string) => void;
  cats: CatType[];
  selectedCatId?: number | null;
  setCategoryid: (value: number | null) => void;
}



export default function SubcatFilterHeader({ setSearchTerm , cats , selectedCatId, setCategoryid}: Props) {
  // Debounced search function (waits 300ms after user stops typing)
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

const categoryOptions = [
  { value: '', label: "All Categories" }, // ✅ Ensure "All Categories" is selectable
  ...cats.map(cat => ({ value: cat.id, label: cat.name }))
];



  return (
    <div className="p-4 bg-gray-100 rounded shadow flex items-center gap-4">

    <Select
      options={categoryOptions}
      value={categoryOptions.find(option => option.value === selectedCatId) || null}
      onChange={(option) => {
        console.log("Category changed to:", option); // ✅ Debug log
        setCategoryid(option?.value ?? ''); // ✅ Ensure "All Categories" sets category to null
      }}
      placeholder="Select Category"
      className="w-[40%] p-2 border rounded"
    />



      <input
        type="text"
        placeholder="Search subcategory..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="w-[40%] p-2 border rounded"
      />
    </div>
  );
}
