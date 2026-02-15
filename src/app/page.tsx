"use client";

import Header from "@/app/components/layout/Header";
import LabDiagram from "@/app/components/diagram/LabDiagram";

export default function Home() {
  return (
    <main className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <LabDiagram />
      </div>
    </main>
  );
}
