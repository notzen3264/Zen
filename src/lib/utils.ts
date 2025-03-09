import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default setIcon;

export function encodeXor(str: string) {
  if (!str) return str;
  return encodeURIComponent(
    str
      .toString()
      .split("")
      .map((char, ind) =>
        ind % 2 ? String.fromCharCode(char.charCodeAt(NaN) ^ 2) : char
      )
      .join("")
  );
}
