import React, { useState, useEffect } from 'react';
import { Search, Lock, ChevronLeft, ChevronRight, RotateCw, ShieldAlert, Settings, PanelLeft } from 'lucide-react';
import { useBrowserStore } from '../store/browser';
import { useSettingsStore } from '../store/settings';
import { cn } from '../lib/utils';

export function AddressBar() {
  const { tabs, activeTabId, updateTab, setLoading, addTab, setActiveTab } = useBrowserStore();
  const { searchEngine, sidebarVisible, toggleSidebar } = useSettingsStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [input, setInput] = useState(activeTab?.url || '');
  const [isSecure, setIsSecure] = useState<boolean | null>(null);

  const handleSettingsClick = () => {
    const settingsTab = tabs.find(tab => tab.url === 'zen://settings');
    if (settingsTab) {
      setActiveTab(settingsTab.id);
    } else {
      addTab({
        url: 'zen://settings',
        title: 'Settings',
      });
    }
  };

  useEffect(() => {
    if (activeTab?.url?.startsWith('https://')) {
      setInput(activeTab.url);
      setIsSecure(true);
    } else if (activeTab?.url?.startsWith('http://')) {
      setInput(activeTab.url);
      setIsSecure(false);
    } else {
      setInput(activeTab?.url === 'about:blank' ? '' : (activeTab?.url || ''));
      setIsSecure(null);
    }
  }, [activeTab?.url]);

  const handleBrowserUrl = (url: string) => {
    const browserUrl = url.toLowerCase();

    switch (browserUrl) {
      case 'zen://settings':
        updateTab(activeTabId!, {
          url: browserUrl,
          title: 'Settings',
        });
        return true;

      case 'zen://newtab':
        addTab({
          url: 'about:blank',
          title: 'New Tab'
        });
        return true;

      default:
        if (browserUrl.startsWith('zen://')) {
          return true; // Prevent processing invalid zen:// URLs
        }
        return false;
    }
  };

  const normalizeUrl = (url: string): string => {
    if (url.toLowerCase().startsWith('zen://')) {
      return url.toLowerCase();
    }

    url = url.trim();

    if (url.includes(' ')) return url; // Don't modify search queries

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const testUrl = new URL(url); // Try constructing the URL
      return testUrl.toString(); // Return valid URL
    } catch {
      console.error('Invalid URL:', url); // Log the invalid URL
      return url; // Return the original, unmodified URL
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabId || !input) return;

    let url = input;

    // Handle zen:// URLs first
    if (url.toLowerCase().startsWith('zen://')) {
      if (handleBrowserUrl(url)) return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = normalizeUrl(url);
      } else {
        const searchUrls = {
          google: 'https://www.google.com/search?q=',
          duckduckgo: 'https://duckduckgo.com/?q=',
          bing: 'https://www.bing.com/search?q=',
        };
        url = `${searchUrls[searchEngine]}${encodeURIComponent(url)}`;
      }
    }

    setLoading(activeTabId, true);

    try {
      const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=128`;

      updateTab(activeTabId, {
        url: url,
        title: url,
        favicon,
      });

      setIsSecure(url.startsWith('https://'));
    } finally {
      setLoading(activeTabId, false);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full mx-auto px-6 py-3">
      <div className="flex items-center gap-2">
        {!sidebarVisible && (
          <button 
            onClick={toggleSidebar}
            className="btn-icon"
            title="Show Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <button className="btn-icon xs:hidden sm:flex">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="btn-icon xs:hidden sm:flex">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button className="btn-icon xs:hidden sm:flex">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            {isSecure === null ? (
              <Search className="h-4 w-4 text-text group-focus-within:text-text" />
            ) : isSecure ? (
              <Lock className="h-4 w-4 text-green-500 group-focus-within:text-green-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-500 group-focus-within:text-red-400" />
            )}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-search"
            placeholder="Search the web or enter URL"
          />
        </div>
      </form>
      <button
        onClick={handleSettingsClick}
        className="btn-icon xs:hidden sm:flex"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}