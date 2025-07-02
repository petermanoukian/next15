//app\components\superadmin\shop\prod\ProdTableHeader.tsx

'use client';

import React from 'react';

interface Props {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (column: string) => void;
  toggleSelectAll: () => void;
  allSelected: boolean;
}


export default function ProdTableHeader({ sortBy, sortOrder, handleSort, toggleSelectAll, allSelected }: Props) {
  return (
    <thead>
      <tr className="bg-gray-100">
        <th className="border p-2 text-left w-[6%]">
          <input type="checkbox" onChange={toggleSelectAll} checked={allSelected} />
        </th>
        <th 
          className="border p-2 cursor-pointer w-[6%]" 
          onClick={() => handleSort('id')}
        >
          ID {sortBy === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>
        <th 
          className="border p-2 cursor-pointer text-left w-[17%]" 
          onClick={() => handleSort('name')}
        >
          Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>
        <th 
          className="border p-2 cursor-pointer text-left w-[18%]" 
          onClick={() => handleSort('catid')}
        >
          Category {sortBy === 'catid' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>
        <th 
          className="border p-2 cursor-pointer text-left w-[17%]" 
          onClick={() => handleSort('catid')}
        >
          SubCategory {sortBy === 'subcatid' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>

        <th className="border p-2 w-[16%] text-left ">Image</th>


        <th className="border p-2 w-[20%]">Actions</th>
      </tr>
    </thead>
  );
}


