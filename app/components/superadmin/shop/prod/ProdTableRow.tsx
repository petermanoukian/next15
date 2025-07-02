//app\components\superadmin\shop\prod\ProdTableRow.tsx


'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

 type ProdType = {
  id: number;
  catid: number;
  subcatid: number;
  name: string;
  image_url?: string;
  file_url?: string | null;
  cat: {
    id: number;
    name: string;
  };
  subcat: {
    id: number;
    name: string;
  };
  taggs?: {
    id: number;
    name: string;
  }[];
};

interface Props {
  prod: ProdType;
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  handleDelete: (id: number) => void;
  user?: { is_admin: string };
}


export default function ProdTableRow({ prod, selectedIds, toggleSelect, handleDelete, user }: Props) {
  return (
    <tr key={prod.id}>
      <td className="border p-2 text-left w-[2%]">
          <input type="checkbox" checked={selectedIds.includes(prod.id)} 
          onChange={() => toggleSelect(prod.id)} />
      </td>
      <td className="border p-2 w-[2%]">{prod.id}</td>
      <td className="border p-2 w-[17%]">{prod.name}</td>
      <td className="border p-2 w-[18%]">{prod.cat.name}</td>
      <td className="border p-2 w-[17%]">{prod.subcat.name}</td>

      <td className="border p-2 w-[16%]"> 
        <Image
          src={prod.image_url}
          alt={prod.name || 'User Image'}
          width={100}
          height={100}
          className = 'mb-2'
          unoptimized
        />

        {prod.file_url ? (
          <>
          <hr/>
          <a
            href={prod.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline mt-2"
          >
            View File
          </a>
          </>
        ) : (
          <span className="text-gray-400"></span>
        )}
      </td>
     


      <td className="border p-2 space-x-3 w-[20%]">
         <div className="w-full space-y-2">
          <div className="inline-block">
            <Link
              href={`/superadmin/prod/edit/${prod.id}`}
              className="text-blue-500 font-bold hover:text-blue-600 ml-2 text-[12px]">
              &raquo; Edit
            </Link>
          </div>

          {/* Delete Button (Restricted to Super Admin) */}
          {user?.is_admin === 'superadmin' && (
            <div className="inline-block">
              <button
                onClick={() => handleDelete(prod.id)}
                className="px-3 py-1 border rounded bg-red-500 text-white hover:bg-red-600 ml-2">
                Delete
              </button>
            </div>
          )}

         
          <div className="inline-block">
            <Link
              href={`/superadmin/prod/add/${prod.cat.id}/${prod.subcat.id}`}
              className="text-green-500 font-bold hover:text-green-600 ml-2 text-[12px]"
            >
              + Product
            </Link>
          </div>
        </div>


      {prod.taggs && prod.taggs.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {prod.taggs.map(tagg => (
            <Link
              key={tagg.id}
              href={`/superadmin/prod/add/?taggid=${tagg.id}`}
              className="inline-block bg-gray-100 text-gray-700 text-[11px] px-2 py-1 rounded hover:bg-gray-200 border"
              title={`Add new product with tag: ${tagg.name}`}
            >
              #{tagg.name}
            </Link>
          ))}
        </div>
      )}



      </td>
    </tr>
  );
}



