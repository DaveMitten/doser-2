import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import ErrorContent from "./ErrorContent";

function ErrorContentFallback() {
  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-doser-text mb-4">Loading...</h2>
        <p className="text-doser-text-muted mb-6">Loading error details...</p>
        <div className="space-y-3">
          <Link href="/auth">
            <Button variant="doser" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<ErrorContentFallback />}>
      <ErrorContent />
    </Suspense>
  );
}
