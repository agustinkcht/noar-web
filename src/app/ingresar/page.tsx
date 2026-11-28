import type { Metadata } from "next";
import { Ingresar } from "@/components/cuenta/Ingresar";

export const metadata: Metadata = {
  title: "Iniciá sesión",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="wrap page auth-page">
      <Ingresar />
    </div>
  );
}
