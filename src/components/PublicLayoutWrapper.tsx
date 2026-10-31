"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <CartDrawer />
      <Footer />
    </>
  );
}
