'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

export type SubcatType = {
  id: number;
  catid: number;
  name: string;
  subprods_count?: ReactNode;
  cat: {
    id: number;
    name: string;
  };
};


interface Props {
  subcat: SubcatType;
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  handleDelete: (id: number) => void;
  user?: { is_admin: string };
}


export default function SubcatTableRow({ subcat, selectedIds, toggleSelect, handleDelete, user }: Props) {
  return (
    <tr key={subcat.id}>
      <td className="border p-2 text-left w-[50px]">
          <input type="checkbox" checked={selectedIds.includes(subcat.id)} 
          onChange={() => toggleSelect(subcat.id)} />
      </td>
      <td className="border p-2 w-[80px]">{subcat.id}</td>
      <td className="border p-2 w-[20%]">{subcat.name}</td>
      <td className="border p-2 w-[20%]">{subcat.cat.name}</td>
      <td className="border p-2 space-x-3">
          <div className="inline-block">
            <Link
              href={`/superadmin/subcat/edit/${subcat.id}`}
              className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]">
              &raquo; Edit
            </Link>
          </div>

          {/* Delete Button (Restricted to Super Admin) */}
          {user?.is_admin === 'superadmin' && (
            <div className="inline-block">
              <button
                onClick={() => handleDelete(subcat.id)}
                className="px-3 py-1 border rounded bg-red-500 text-white hover:bg-red-600 ml-2">
                Delete
              </button>
            </div>
          )}

          {/* Add Subcategory Link (Visible to All Users) */}
          <div className="inline-block">
            <Link
              href={`/superadmin/subcat/add/${subcat.cat.id}`}
              className="text-green-500 font-bold hover:text-green-600 ml-2 text-[12px]"
            >
              + Subcategory 
            </Link>
          </div>


        <div className="inline-block">
          <Link
            href={`/superadmin/prod/add/${subcat.cat.id}/${subcat.id}`} // ✅ Passes both `catid` and `subcatid`
            className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]"
          >
            + Add Product
          </Link>
        </div>

        {/* View Products Link */}
        <div className="inline-block">
          <Link
            href={`/superadmin/prod/view/${subcat.cat.id}/${subcat.id}`} // ✅ Ensures products are scoped by category and subcategory
            className="text-orange-500 font-bold hover:text-orange-600 ml-2 text-[12px]"
          >
            View Products ({subcat.subprods_count ? subcat.subprods_count : 0})
          </Link>
        </div>


      </td>
    </tr>
  );
}
