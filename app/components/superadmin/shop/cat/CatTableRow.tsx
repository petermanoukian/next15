//C:\My-Documents\next\app\components\superadmin\cat\CatTableRow.tsx

'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface Cat {
  subcats_count: ReactNode;
  catprods_count: ReactNode;
  id: number;
  name: string;
}

interface Props {
  cat: Cat;
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  handleDelete: (id: number) => void;
  user?: { is_admin: string };
}

export default function CatTableRow({ cat, selectedIds, toggleSelect, handleDelete, user }: Props) {
  return (
    <tr key={cat.id}>
        <td className="border p-2 text-left w-[50px]">
            <input type="checkbox" checked={selectedIds.includes(cat.id)} onChange={() => toggleSelect(cat.id)} />
        </td>
        <td className="border p-2 w-[80px]">{cat.id}</td>
      <td className="border p-2 w-[25%]">{cat.name}</td>
      <td className="border p-2 space-x-3">
        <div className="inline-block">
          <Link
            href={`/superadmin/cat/edit/${cat.id}`}
            className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]">
            &raquo; Edit
          </Link>
        </div>

        {/* Delete Button (Restricted to Super Admin) */}
        {user?.is_admin === 'superadmin' && (
          <div className="inline-block">
            <button
              onClick={() => handleDelete(cat.id)}
              className="px-3 py-1 border rounded bg-red-500 text-white hover:bg-red-600 ml-2">
              Delete
            </button>
          </div>
        )}

        {/* Add Subcategory Link (Visible to All Users) */}
        <div className="inline-block">
          <Link
            href={`/superadmin/subcat/add/${cat.id}`}
            className="text-green-500 font-bold hover:text-green-600 ml-2 text-[12px]"
          >
            + Add Subcategory
          </Link>
        </div>

        {/* View Subcategories Link with Count (Visible to All Users) */}
        <div className="inline-block">
          <Link
            href={`/superadmin/subcat/view/${cat.id}`}
            className="text-purple-500 font-bold hover:text-purple-600 ml-2 text-[12px]">
            View Subcategories ({cat.subcats_count})
          </Link>
        </div>

        <div className="inline-block">
          <Link
            href={`/superadmin/prod/add/${cat.id}`} // ✅ Uses category ID for adding a product
            className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]"
          >
            + Add Product
          </Link>
        </div>

        {/* View Products Link */}
        <div className="inline-block">
          <Link
            href={`/superadmin/prod/view/${cat.id}`} // ✅ Uses category ID for viewing products
            className="text-orange-500 font-bold hover:text-orange-600 ml-2 text-[12px]"
          >
            View Products ({cat.catprods_count})
          </Link>
        </div>


      </td>

    </tr>
  );
}
