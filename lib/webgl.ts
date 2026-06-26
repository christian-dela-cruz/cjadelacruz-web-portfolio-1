import { useState, useEffect } from "react";

export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    return !!gl;
  } catch (e) {
    return false;
  }
}

export function useWebGLSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(detectWebGL());
  }, []);

  return isSupported;
}
