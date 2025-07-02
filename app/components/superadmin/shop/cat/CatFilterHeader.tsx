'use client';

import React, { useCallback } from 'react';
import { debounce } from 'lodash';

interface Props {
  setSearchTerm: (value: string) => void;
}

export default function CatFilterHeader({ setSearchTerm }: Props) {
  // Debounced search function (waits 300ms after user stops typing)
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  return (
    <div className="p-4 bg-gray-100 rounded shadow">
      <input
        type="text"
        placeholder="Search category..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="w-[60%] p-2 border rounded"
      />
    </div>
  );
}
