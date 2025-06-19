"use client";

// TODO: `false` would break server HMR
export const shouldRevalidate = () => import.meta.env.DEV;
