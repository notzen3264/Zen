import { create } from 'zustand';

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  loading?: boolean;
}

interface BrowserState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'>) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setActiveTab: (id: string) => void;
  setLoading: (id: string, loading: boolean) => void;
  reorderTabs: (newTabs: Tab[]) => void;
}

export const useBrowserStore = create<BrowserState>((set) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tab) => set((state) => {
    const newTab = { ...tab, id: Math.random().toString(36).slice(2) };
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
}));