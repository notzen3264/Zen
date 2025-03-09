import { create } from 'zustand';

interface Tab {
  id: string;
  url: string;          // Original, unencoded URL
  iframeUrl: string;    // Encoded URL for iframe
  title: string;
  favicon?: string;
  loading?: boolean;
}

interface BrowserState {
  tabs: Tab[];
  activeTabId: string | null;
  bookmarks: Array<{ id: string; url: string; title: string; favicon?: string }>;
  addTab: (tab: Omit<Tab, 'id' | 'iframeUrl'>) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setActiveTab: (id: string) => void;
  setLoading: (id: string, loading: boolean) => void;
  reorderTabs: (newTabs: Tab[]) => void;
  addBookmark: (bookmark: { url: string; title: string; favicon?: string }) => void;
  removeBookmark: (id: string) => void;
}

export const useBrowserStore = create<BrowserState>((set) => ({
  tabs: [],
  activeTabId: null,
  bookmarks: [],
  addTab: (tab) => set((state) => {
    const newTab = { 
      ...tab, 
      id: Math.random().toString(36).slice(2),
      iframeUrl: tab.url // Will be encoded when actually loading
    };
    return {
      tabs: [newTab, ...state.tabs],
      activeTabId: newTab.id,
    };
  }),
  removeTab: (id) => set((state) => ({
    tabs: state.tabs.filter((tab) => tab.id !== id),
    activeTabId: state.activeTabId === id
      ? state.tabs[state.tabs.length - 2]?.id || null
      : state.activeTabId,
  })),
  updateTab: (id, updates) => set((state) => ({
    tabs: state.tabs.map((tab) =>
      tab.id === id ? { ...tab, ...updates } : tab
    ),
  })),
  setActiveTab: (id) => set({ activeTabId: id }),
  setLoading: (id, loading) => set((state) => ({
    tabs: state.tabs.map((tab) =>
      tab.id === id ? { ...tab, loading } : tab
    ),
  })),
  reorderTabs: (newTabs) => set({ tabs: newTabs }),
  addBookmark: (bookmark) => set((state) => ({
    bookmarks: [...state.bookmarks, { id: Math.random().toString(36).slice(2), ...bookmark }]
  })),
  removeBookmark: (id) => set((state) => ({
    bookmarks: state.bookmarks.filter((b) => b.id !== id)
  }))
}));