'use client';

import React, { useCallback } from 'react';
import { debounce } from 'lodash';

interface Props {
  search: string;
  setSearch: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
}

export default function UserFilterHeader({
  search,
  setSearch,
  role,
  setRole,
}: Props) {

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 300),
    []
  );


  return (
    <div className="flex items-center gap-4 mb-4">
      <input
        type="text"
        placeholder="Search name or email..."
        value={search}
        onChange={(e) => debouncedSearch(e.target.value)}
        
        className="border px-3 py-2 rounded w-96"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border px-3 py-2 rounded w-44"
      >
        <option value="">All Roles</option>
        <option value="superadmin">Super Admin</option>
        <option value="admin">Admin</option>
        <option value="orduser">User</option>
      </select>
    </div>
  );
}
