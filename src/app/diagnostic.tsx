"use client";

import React, { useEffect } from "react";

// This runs immediately when the module loads
if (typeof window !== "undefined") {
  console.log("🔍 [DIAGNOSTIC] Module loaded - CLIENT SIDE");
  console.log("🔍 [DIAGNOSTIC] Window exists:", !!window);
  console.log("🔍 [DIAGNOSTIC] Document exists:", !!document);
  console.log("🔍 [DIAGNOSTIC] React version:", React.version);
} else {
  console.log("🔍 [DIAGNOSTIC] Module loaded - SERVER SIDE");
}

export function Diagnostic() {

  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC] useEffect running - HYDRATION SUCCESSFUL");
    console.log("🔍 [DIAGNOSTIC] Current URL:", window.location.href);
    console.log("🔍 [DIAGNOSTIC] User Agent:", navigator.userAgent);

    // Test if console.log works
    for (let i = 1; i <= 5; i++) {
      console.log(`🔍 [DIAGNOSTIC] Test log ${i}/5`);
    }

    // Test if errors work
    console.error("🔍 [DIAGNOSTIC] Test error (intentional)");
    console.warn("🔍 [DIAGNOSTIC] Test warning (intentional)");

    return () => {
      console.log("🔍 [DIAGNOSTIC] Component unmounting");
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        background: "red",
        color: "white",
        padding: "10px",
        zIndex: 9999,
        fontSize: "12px",
      }}
    >
      🔍 DIAGNOSTIC: If you see this, React is rendering
    </div>
  );
}
