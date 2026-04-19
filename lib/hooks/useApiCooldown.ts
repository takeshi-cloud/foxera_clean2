"use client";

import { useEffect, useState } from "react";

export function useApiCooldown() {
  const [cooldown, setCooldown] =
    useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [cooldown]);

  const startCooldown = (
    seconds = 60
  ) => {
    setCooldown(seconds);
  };

  return {
    cooldown,
    isCooling:
      cooldown > 0,
    startCooldown,
  };
}