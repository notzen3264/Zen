import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

async function searchURL(
  input: string,
  searchEngine = "https://www.google.com/search?q=%s"
) {
  return await window.chemical.encode(input, {
    autoHttps: true,
    searchEngine,
  });
}

export { searchURL };

const setIcon = async function (this: any, index: number) {
  if (!this?.tabs || !this?.tabs[index]) return;

  const tab = this.tabs[index];
  const defaultFavicon = tab.url ? `https://${new URL(tab.url).hostname}/favicon.ico` : null;

  const href =
    tab.iframe?.querySelector("link[rel=icon]")?.href || defaultFavicon;

  if (href) {
    try {
      const res = await chemical.fetch(href);
      if (!res.ok) return;
      this.tabs[index].icon = URL.createObjectURL(await res.blob());
    } catch (error) {
      console.error("Error fetching icon:", error);
    }
  }
};

export default setIcon;
