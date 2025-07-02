'use client'

import React from 'react';

interface Props {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (column: string) => void;
  allSelected: boolean;
  toggleSelectAll: () => void;

}

export default function UserTableHeader({ sortBy, sortOrder, handleSort,   allSelected,
  toggleSelectAll,
 }: Props) {
  const renderArrow = (column: string) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ↕';
  };

  return (
    <thead>
      <tr className="bg-gray-200">

      <th className="border p-2">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
        />
      </th>





        <th className="border p-2 cursor-pointer" onClick={() => handleSort('id')}>
          #
          {renderArrow('id')}
        </th>
        <th className="border p-2 cursor-pointer" onClick={() => handleSort('name')}>
          Name
          {renderArrow('name')}
        </th>
        <th className="border p-2 cursor-pointer" onClick={() => handleSort('email')}>
          Email
          {renderArrow('email')}
        </th>
        <th className="border p-2 cursor-pointer" onClick={() => handleSort('is_admin')}>
          Role
          {renderArrow('is_admin')}
        </th>
        <th className="border p-2">Image</th>
        <th className="border p-2">File</th>
        <th className="border p-2">Actions</th>
      </tr>
    </thead>
  );
}