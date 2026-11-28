import type { Metadata } from "next";
import { MiCuenta } from "@/components/cuenta/MiCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="wrap page">
      <MiCuenta />
    </div>
  );
}
