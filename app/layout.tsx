'use client';
import api from '@/lib/axios';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { useEffect } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{

  console.log("RootLayout");

  useEffect(() => {
    console.log('main LAyout loaded');

  }, []);

    useEffect(() => {
    console.log('🧭 Axios instance:', api);
    console.log('🌐 Axios baseURL:', api.defaults.baseURL);
    console.log('📄 Axios headers:', api.defaults.headers);
    }, []);


  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
