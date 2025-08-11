"use client";

import React from "react";

type SuccessAndErrorMessagesProps = {
  submitSuccess: boolean;
  submitError: string | null;
};

const SuccessAndErrorMessages = ({
  submitSuccess,
  submitError,
}: SuccessAndErrorMessagesProps) => {
  if (!submitSuccess && !submitError) return null;

  return (
    <>
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-3 text-green-500">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-medium">Session logged successfully!</div>
              <div className="text-sm text-green-500/80">
                Your session has been saved to the database.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-3 text-red-500">
            <span className="text-xl">❌</span>
            <div>
              <div className="font-medium">Error saving session</div>
              <div className="text-sm text-red-500/80">{submitError}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuccessAndErrorMessages;
