import { Metadata } from 'next';
import LabDiagram from "@/app/components/diagram/LabDiagram";

export const metadata: Metadata = {
  title: "Architecture Diagram | Villa Arreola Lab",
  description: "Full infrastructure topology diagram of Martin Villa Arreola's homelab — servers, VMs, containers, and network connections.",
};

export default function Architecture() {
  return (
    <main className="h-screen bg-neutral-950">
      <LabDiagram />
    </main>
  );
}
