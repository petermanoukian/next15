'use client';

import React from 'react';

interface Props {
  pagination: {
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  onPageChange: (url: string) => void;
}

export default function Pagination({ pagination, onPageChange }: Props) {
  return (
    <div className="flex justify-center mt-4 space-x-2">
    
      {pagination?.links?.length && ( 

      pagination.links.map((link, index) => {

        if (!link.url) return null;
        return (
          <button
            key={index}
            onClick={() => onPageChange(link.url!)}
            className={`px-3  py-1 border rounded ${
              link.active ? 'bg-black text-white' : 'bg-white text-black cursor-pointer'
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        );
      })
    )}
    </div>
  );
}
