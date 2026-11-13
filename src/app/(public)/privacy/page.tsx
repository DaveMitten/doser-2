import type { Metadata } from "next";
import { LegalDocument, readLegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Privacy Policy — Doser" };
export const dynamic = "force-static";

export default function Page() {
  return <LegalDocument html={readLegalDocument("privacy.md")} />;
}
