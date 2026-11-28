import type { Metadata } from "next";
import { VerPedido } from "@/components/cuenta/VerPedido";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="wrap page">
      <VerPedido />
    </div>
  );
}
