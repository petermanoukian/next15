'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
 
interface Tagg {
  prods_count: ReactNode;
  id: number;
  name: string;
}

interface Props {
  tagg: Tagg;
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  handleDelete: (id: number) => void;
  user?: { is_admin: string };
}

export default function TagTableRow({ tagg, selectedIds, toggleSelect, handleDelete, user }: Props) {
  return (
    <tr key={tagg.id}>
        <td className="border p-2 text-left w-[50px]">
            <input type="checkbox" checked={selectedIds.includes(tagg.id)} onChange={() => toggleSelect(tagg.id)} />
        </td>
        <td className="border p-2 w-[80px]">{tagg.id}</td>
      <td className="border p-2 w-[25%]">{tagg.name}</td>
      <td className="border p-2 space-x-3">
        <div className="inline-block">
          <Link
            href={`/superadmin/tagg/edit/${tagg.id}`}
            className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]">
            &raquo; Edit
          </Link>
        </div>

        {/* Delete Button (Restricted to Super Admin) */}
        {user?.is_admin === 'superadmin' && (
          <div className="inline-block">
            <button
              onClick={() => handleDelete(tagg.id)}
              className="px-3 py-1 border rounded bg-red-500 text-white hover:bg-red-600 ml-2">
              Delete
            </button>
          </div>
        )}



        <div className="inline-block">
          <Link
            href={`/superadmin/prod/add/?taggid=${tagg.id}`} // ✅ Uses category ID for adding a product
            className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]"
          >
            + Add Product
          </Link>
        </div>

        {/* View Products Link */}
        <div className="inline-block">
          <Link
            href={`/superadmin/prod/view/?taggid=${tagg.id}`} // ✅ Uses category ID for viewing products
            className="text-orange-500 font-bold hover:text-orange-600 ml-2 text-[12px]"
          >
            View Products ({tagg.prods_count})
          </Link>
        </div>


      </td>

    </tr>
  );
}
