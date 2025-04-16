import { create } from 'zustand';

interface Tab {
  id: string;
  url: string;
  iframeUrl: string;
  title: string;
  favicon?: string;
  loading?: boolean;
  history: string[];
  historyIndex: number;
}

interface BrowserState {
  tabs: Tab[];
  activeTabId: string;
  bookmarks: Array<{ id: string; url: string; title: string; favicon?: string }>;
  addTab: (tab: Omit<Tab, 'id' | 'iframeUrl' | 'history' | 'historyIndex'>) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setActiveTab: (id: string) => void;
  setLoading: (id: string, loading: boolean) => void;
  reorderTabs: (newTabs: Tab[]) => void;
  addBookmark: (bookmark: { url: string; title: string; favicon?: string }) => void;
  removeBookmark: (id: string) => void;
  ensureTabExists: () => void;
  goBack: (id: string) => void;
  goForward: (id: string) => void;
  addToHistory: (id: string, url: string) => void;
  getHistory: (id: string) => string[];
}

const createNewTab = (): Tab => ({
  id: Math.random().toString(36).slice(2),
  url: 'about:blank',
  iframeUrl: 'about:blank',
  title: 'New Tab',
  history: ['about:blank'],
  historyIndex: 0,
});

const initialTab = createNewTab();

export const useBrowserStore = create<BrowserState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  bookmarks: [],

  addTab: (tab) => set((state) => {
    const newTab: Tab = {
      ...tab,
      id: Math.random().toString(36).slice(2),
      iframeUrl: tab.url,
      history: [tab.url],
      historyIndex: 0,
    };
    return {
      tabs: [newTab, ...state.tabs],
      activeTabId: newTab.id,
    };
  }),

  removeTab: (id: string) => set((state) => {
    const tabIndex = state.tabs.findIndex((tab) => tab.id === id);
    let newTabs = state.tabs.filter((tab) => tab.id !== id);
    let newActiveTabId = state.activeTabId;

    if (newTabs.length === 0) {
      newTabs = [createNewTab()];
      newActiveTabId = newTabs[0].id;
    } else if (state.activeTabId === id) {
      newActiveTabId = newTabs[Math.max(0, tabIndex - 1)]?.id || newTabs[0].id;
    }

    return {
      tabs: newTabs,
      activeTabId: newActiveTabId,
    };
  }),

  updateTab: (id: string, updates: Partial<Tab>) => set((state) => ({
    tabs: state.tabs.map((tab) => {
      if (tab.id === id) {
        const newHistory = updates.url && tab.url !== updates.url 
          ? [...tab.history.slice(0, tab.historyIndex + 1), updates.url] 
          : tab.history;
        return { ...tab, ...updates, history: newHistory, historyIndex: newHistory.length - 1 };
      }
      return tab;
    }),
  })),

  setActiveTab: (id: string) => {
    const state = get();
    if (state.tabs.some((tab) => tab.id === id)) {
      set({ activeTabId: id });
    }
  },

  setLoading: (id: string, loading: boolean) => set((state) => ({
    tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, loading } : tab)),
  })),

  reorderTabs: (newTabs: Tab[]) => set({ tabs: newTabs }),

  addBookmark: (bookmark) => set((state) => ({
    bookmarks: [...state.bookmarks, { id: Math.random().toString(36).slice(2), ...bookmark }],
  })),

  removeBookmark: (id: string) => set((state) => ({
    bookmarks: state.bookmarks.filter((b) => b.id !== id),
  })),

  ensureTabExists: () => {
    set((state) => {
      if (state.tabs.length === 0) {
        const newTab = createNewTab();
        return { 
          tabs: [newTab], 
          activeTabId: newTab.id,
        };
      }
      return state;
    });
  },

  goBack: (id: string) => set((state) => ({
    tabs: state.tabs.map((tab) => {
      if (tab.id === id && tab.historyIndex > 0) {
        return { ...tab, historyIndex: tab.historyIndex - 1, url: tab.history[tab.historyIndex - 1] };
      }
      return tab;
    }),
  })),

  goForward: (id: string) => set((state) => ({
    tabs: state.tabs.map((tab) => {
      if (tab.id === id && tab.historyIndex < tab.history.length - 1) {
        return { ...tab, historyIndex: tab.historyIndex + 1, url: tab.history[tab.historyIndex + 1] };
      }
      return tab;
    }),
  })),

  addToHistory: (id: string, url: string) => set((state) => ({
    tabs: state.tabs.map((tab) => {
      if (tab.id === id) {
        const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), url];
        return {
          ...tab,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }
      return tab;
    }),
  })),

  getHistory: (id: string): string[] => {
    const tab = get().tabs.find((tab) => tab.id === id);
    return tab ? tab.history : [];
  },
}));

useBrowserStore.getState().ensureTabExists();
