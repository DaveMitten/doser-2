import type { Metadata } from "next";
import { LegalDocument, readLegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Support — Doser" };
export const dynamic = "force-static";

export default function Page() {
  return <LegalDocument html={readLegalDocument("support.md")} />;
}
