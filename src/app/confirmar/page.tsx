import type { Metadata } from "next";
import { Confirmar } from "@/components/cuenta/Confirmar";

export const metadata: Metadata = {
  title: "Confirmá tu pedido",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="wrap page">
      <Confirmar />
    </div>
  );
}
