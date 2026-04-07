"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const interceptorRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (interceptorRef.current !== null) {
      api.interceptors.request.eject(interceptorRef.current);
    }

    interceptorRef.current = api.interceptors.request.use(async (config) => {
      if (!isSignedIn) {
        delete config.headers.Authorization;
        return config;
      }

      const token = await getToken();

      console.log("clerk token:", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }

      return config;
    });

    return () => {
      if (interceptorRef.current !== null) {
        api.interceptors.request.eject(interceptorRef.current);
      }
    };
  }, [getToken, isLoaded, isSignedIn]);

  return <>{children}</>;
}