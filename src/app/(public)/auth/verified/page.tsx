import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import VerifiedContent from "./VerifiedContent";

function VerifiedContentFallback() {
  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-doser-text mb-4">
          Email Verified!
        </h2>
        <p className="text-doser-text-muted mb-4">
          Your account has been successfully verified. You&apos;re now signed
          in!
        </p>
        <p className="text-doser-text-muted mb-6">Loading...</p>
        <Link href="/dashboard">
          <Button variant="doser" className="w-full">
            Go to Dashboard Now
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function EmailVerified() {
  return (
    <Suspense fallback={<VerifiedContentFallback />}>
      <VerifiedContent />
    </Suspense>
  );
}
