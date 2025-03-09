import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProxyEngine = 'ultraviolet' | 'rammerhead' | 'scramjet';
type ProxyTransport = 'libcurl' | 'epoxy';

interface SettingsState {
  isOpen: boolean;
  themeId: string;
  proxyEngine: ProxyEngine;
  proxyTransport: ProxyTransport;
  searchEngine: 'google' | 'duckduckgo' | 'bing';
  sidebarVisible: boolean;
  bookmarks: Array<{ title: string; url: string; favicon: string }>;
  setSettingsOpen: (isOpen: boolean) => void;
  setThemeId: (themeId: string) => void;
  setProxyEngine: (engine: ProxyEngine) => void;
  setProxyTransport: (transport: ProxyTransport) => void;
  setSearchEngine: (engine: 'google' | 'duckduckgo' | 'bing') => void;
  toggleSidebar: () => void;
  addBookmark: (bookmark: { title: string; url: string; favicon: string }) => void;
  removeBookmark: (url: string) => void;
}

// Initialize Chemical.js storage
const initChemicalStorage = () => {
  if (typeof window !== 'undefined') {
    window.chemical.setStore('proxyEngine', 'ultraviolet');
    window.chemical.setStore('proxyTransport', 'libcurl');
    window.chemical.setStore('searchEngine', 'google');
    window.chemical.setStore('bookmarks', '[]');
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isOpen: false,
      themeId: 'mocha',
      proxyEngine: 'ultraviolet',
      proxyTransport: 'libcurl',
      searchEngine: 'google',
      sidebarVisible: true,
      bookmarks: [],
      setSettingsOpen: (isOpen) => set({ isOpen }),
      setThemeId: (themeId) => {
        set({ themeId });
        if (typeof window !== 'undefined') {
          window.chemical.setStore('theme', themeId);
        }
      },
      setProxyEngine: (proxyEngine) => {
        set({ proxyEngine });
        if (typeof window !== 'undefined') {
          window.chemical.setStore('proxyEngine', proxyEngine);
        }
      },
      setProxyTransport: (proxyTransport) => {
        set({ proxyTransport });
        if (typeof window !== 'undefined') {
          window.chemical.setStore('proxyTransport', proxyTransport);
        }
      },
      setSearchEngine: (searchEngine) => {
        set({ searchEngine });
        if (typeof window !== 'undefined') {
          window.chemical.setStore('searchEngine', searchEngine);
        }
      },
      toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      addBookmark: (bookmark) => set((state) => {
        const newBookmarks = [...state.bookmarks, bookmark];
        if (typeof window !== 'undefined') {
          window.chemical.setStore('bookmarks', JSON.stringify(newBookmarks));
        }
        return { bookmarks: newBookmarks };
      }),
      removeBookmark: (url) => set((state) => {
        const newBookmarks = state.bookmarks.filter(b => b.url !== url);
        if (typeof window !== 'undefined') {
          window.chemical.setStore('bookmarks', JSON.stringify(newBookmarks));
        }
        return { bookmarks: newBookmarks };
      })
    }),
    {
      name: 'browser-settings',
      onRehydrateStorage: () => {
        initChemicalStorage();
      }
    }
  )
);