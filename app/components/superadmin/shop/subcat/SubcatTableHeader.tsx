//app\components\superadmin\shop\subcat\SubcatTableHeader.tsx
'use client';

import React from 'react';

interface Props {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (column: string) => void;
  toggleSelectAll: () => void;
  allSelected: boolean;
}


export default function SubcatTableHeader({ sortBy, sortOrder, handleSort, toggleSelectAll, allSelected }: Props) {
  return (
    <thead>
      <tr className="bg-gray-100">
        <th className="border p-2 text-left w-[50px]">
          <input type="checkbox" onChange={toggleSelectAll} checked={allSelected} />
        </th>
        <th 
          className="border p-2 cursor-pointer w-[80px]" 
          onClick={() => handleSort('id')}
        >
          ID {sortBy === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>
        <th 
          className="border p-2 cursor-pointer text-left w-[25%]" 
          onClick={() => handleSort('name')}
        >
          Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>
        <th 
          className="border p-2 cursor-pointer text-left w-[25%]" 
          onClick={() => handleSort('catid')}
        >
          Category {sortBy === 'catid' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
        </th>
        <th className="border p-2">Actions</th>
      </tr>
    </thead>
  );
}
