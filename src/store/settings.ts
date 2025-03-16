import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type service = 'uv' | 'rh' | 'scramjet';
type transport = 'libcurl' | 'epoxy';
type searchEngine = 'google' | 'duckduckgo' | 'bing';

interface SettingsState {
  isOpen: boolean;
  themeId: string;
  service: service;
  transport: transport;
  searchEngine: searchEngine;
  sidebarVisible: boolean;
  bookmarks: Array<{ title: string; url: string; favicon: string }>;
  setSettingsOpen: (isOpen: boolean) => void;
  setThemeId: (themeId: string) => void;
  setService: (engine: service) => void;
  setTransport: (transport: transport) => void;
  setSearchEngine: (engine: 'google' | 'duckduckgo' | 'bing') => void;
  toggleSidebar: () => void;
  addBookmark: (bookmark: { title: string; url: string; favicon: string }) => void;
  removeBookmark: (url: string) => void;
}

const initChemicalStorage = () => {
  if (typeof window !== 'undefined' && window.chemical?.connection) {
    const defaults = {
      service: 'uv',
      transport: 'libcurl',
      searchEngine: 'google',
      bookmarks: '[]',
    };

    Object.keys(defaults).forEach((key) => {
      if (!window.chemical.getStore(key)) {
        window.chemical.setStore(key, defaults[key as keyof typeof defaults]);
      }
    });
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isOpen: false,
      themeId: 'mocha',
      service: 'uv',
      transport: 'libcurl',
      searchEngine: 'google',
      sidebarVisible: true,
      bookmarks: [],
      setSettingsOpen: (isOpen) => set({ isOpen }),
      setThemeId: (themeId) => {
        set({ themeId });
        if (typeof window !== 'undefined' && window.chemical) {
          window.chemical.setStore('theme', themeId);
        }
      },
      setService: (service) => {
        set({ service });
        if (typeof window !== 'undefined' && window.chemical) {
          window.chemical.setStore('service', service);
        }
      },
      setTransport: (transport) => {
        set({ transport });
        if (typeof window !== 'undefined' && window.chemical) {
          window.chemical.setStore('transport', transport);
        }
      },
      setSearchEngine: (searchEngine) => {
        set({ searchEngine });
        if (typeof window !== 'undefined' && window.chemical) {
          window.chemical.setStore('searchEngine', searchEngine);
        }
      },
      toggleSidebar: () =>
        set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      addBookmark: (bookmark) =>
        set((state) => {
          const newBookmarks = [...state.bookmarks, bookmark];
          if (typeof window !== 'undefined' && window.chemical) {
            window.chemical.setStore('bookmarks', JSON.stringify(newBookmarks));
          }
          return { bookmarks: newBookmarks };
        }),
      removeBookmark: (url) =>
        set((state) => {
          const newBookmarks = state.bookmarks.filter((b) => b.url !== url);
          if (typeof window !== 'undefined' && window.chemical) {
            window.chemical.setStore('bookmarks', JSON.stringify(newBookmarks));
          }
          return { bookmarks: newBookmarks };
        }),
    }),
    {
      name: 'browser-settings',
      onRehydrateStorage: () => {
        initChemicalStorage();
      },
    }
  )
);