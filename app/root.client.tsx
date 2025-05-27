"use client";

import React from "react";
import { useNavigate, useNavigation } from "react-router";

export function ServerHmr() {
  if (import.meta.hot) {
    const navigate = useNavigate();
    React.useEffect(() => {
      const refetch = () =>
        navigate(window.location.pathname, { replace: true });
      import.meta.hot!.on("rsc:update", refetch);
      return () => {
        import.meta.hot!.off("rsc:update", refetch);
      };
    }, [navigate]);
  }
  return null;
}

export function GlobalNavigationLoadingBar() {
  const navigation = useNavigation();

  if (navigation.state === "idle") return null;

  return (
    <div className="h-1 w-full bg-pink-100 overflow-hidden fixed top-0 left-0 z-50 opacity-50">
      <div className="animate-progress origin-[0%_50%] w-full h-full bg-pink-500" />
    </div>
  );
}
