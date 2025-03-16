import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSettingsStore } from "../store/settings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function getSearchUrl(engine: string): string {
  const searchUrls: { [key: string]: string } = {
    google: 'https://www.google.com/search?q=%s',
    duckduckgo: 'https://duckduckgo.com/?q=%s',
    bing: 'https://www.bing.com/search?q=%s',
  };
  return searchUrls[engine] || searchUrls.google;
}

export async function encodeUrl(url: string, searchEngine: string, service: string): Promise<string> {
  if (!window.chemical) return url;
  try {
    return await window.chemical.encode(url, {
      service: service,
      autoHttps: true,
      searchEngine: getSearchUrl(searchEngine),
    });
  } catch (error) {
    console.error('Error encoding URL:', error);
    return url;
  }
}

export function normalizeUrl(url: string): string {
  if (!url) return '';

  if (url.toLowerCase().startsWith('zen://')) {
    return url.toLowerCase();
  }

  url = url.trim();
  if (url.includes(' ')) return url;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const testUrl = new URL(url);
    return testUrl.toString();
  } catch {
    console.error('Invalid URL:', url);
    return url;
  }
};