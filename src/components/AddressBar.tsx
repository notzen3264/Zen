import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCw, UnlockKeyhole, Settings, PanelLeft, LockKeyhole, Shield } from 'lucide-react';
import { useBrowserStore } from '../store/browser';
import { useSettingsStore } from '../store/settings';
import { encodeUrl, normalizeUrl } from '../lib/utils';

export function AddressBar({ setUrlKey }: { setUrlKey: React.Dispatch<React.SetStateAction<number>> }) {
  const { searchEngine, sidebarVisible, toggleSidebar, service } = useSettingsStore();
  const { tabs, activeTabId, updateTab, setLoading, addTab, setActiveTab, goBack, goForward, addToHistory } = useBrowserStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [isSecure, setIsSecure] = useState<boolean | null>(null);

  // Calculate navigation states locally
  const canGoBack = activeTab?.history && activeTab.historyIndex > 0;
  const canGoForward = activeTab?.history && activeTab.historyIndex < (activeTab.history.length - 1);

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
    if (!activeTabId || !activeTab?.url) {
      setInputs(prev => ({
        ...prev,
        [activeTabId || '']: ''
      }));
      setIsSecure(null);
      return;
    }

    if (activeTab.url.startsWith('zen://') || activeTab.url === 'about:blank') {
      setInputs(prev => ({
        ...prev,
        [activeTabId]: activeTab.url === 'about:blank' ? '' : activeTab.url
      }));
      setIsSecure(null);
      return;
    }

    try {
      const currentUrl = activeTab.url || activeTab.url;

      if (currentUrl.startsWith('https://')) {
        setIsSecure(true);
      } else if (currentUrl.startsWith('http://')) {
        setIsSecure(false);
      } else {
        setIsSecure(null);
      }

      setInputs(prev => ({ ...prev, [activeTabId]: currentUrl }));
    } catch (error) {
      setInputs(prev => ({ ...prev, [activeTabId]: activeTab.url }));
    }
  }, [activeTab?.url, activeTabId]);

  const handleInputChange = (tabId: string, value: string) => {
    setInputs((prevInputs) => ({
      ...prevInputs,
      [tabId]: value,
    }));
  }

  const handleBrowserUrl = (url: string) => {
    if (!url) return false;

    const browserUrl = url.toLowerCase();

    switch (browserUrl) {
      case 'zen://settings':
        if (activeTabId) {
          updateTab(activeTabId, {
            url: browserUrl,
            title: 'Settings',
          });
        }
        return true;

      case 'zen://newtab':
        addTab({
          url: 'about:blank',
          title: 'New Tab'
        });
        return true;

      default:
        if (browserUrl.startsWith('zen://')) {
          return true;
        }
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabId || !inputs[activeTabId]) return;

    const inputUrl = inputs[activeTabId] || '';
    if (!inputUrl.trim()) return;

    let url = inputUrl;

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

    console.log(url);

    setLoading(activeTabId, true);
    addToHistory(activeTabId, url);

    try {
      const encodedUrl = await encodeUrl(url, searchEngine, service);

      console.log(encodedUrl);

      updateTab(activeTabId, { url, iframeUrl: encodedUrl, title: url, favicon: '' });

      console.log(activeTabId, { url, iframeUrl: encodedUrl, title: url, favicon: '' });

      setUrlKey(prev => prev + 1);
    } catch (error) {
      console.error("Error Loading Web Content", error);
    }
  };

  const reload = async () => {
    if (activeTab) {
      setLoading(activeTabId, true);

      const url = activeTab?.url;
      const newIframeUrl = await encodeUrl(url, searchEngine, service);
      const favicon = activeTab?.favicon

      updateTab(activeTabId, { url: url, iframeUrl: newIframeUrl, favicon });

      setUrlKey(prev => prev + 1);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full mx-auto px-6 py-3 overflow-hidden">
      <div className="flex items-center gap-2">
        {!sidebarVisible && (
          <button
            onClick={toggleSidebar}
            className="btn-icon"
            title="Show Sidebar"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={goBack}
          className="btn-icon hidden sm:flex"
          aria-label="Back"
          title='Back'
          disabled={!canGoBack}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goForward}
          className="btn-icon hidden sm:flex"
          aria-label="Forward"
          title='Forward'
          disabled={!canGoForward}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          className="btn-icon hidden sm:flex"
          aria-label="Reload"
          title='Reload'
          onClick={reload}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative group active:scale-[0.99] transition-transform">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            {activeTab?.url?.startsWith('zen://') ? (
              <Shield className="h-4 w-4 text-text group-focus-within:text-text" />
            ) : isSecure === null ? (
              <Search className="h-4 w-4 text-text group-focus-within:text-text" />
            ) : isSecure ? (
              <LockKeyhole className="h-4 w-4 text-green-500 group-focus-within:text-green-400" />
            ) : (
              <UnlockKeyhole className="h-4 w-4 text-red-500 group-focus-within:text-red-400" />
            )}
          </div>
          <input
            type="text"
            value={inputs[activeTabId || ''] || ''}
            onChange={(e) => handleInputChange(activeTabId || '', e.target.value)}
            className="input-search"
            placeholder="Search the web or enter URL"
            aria-label="Address Bar"
          />
        </div>
      </form>
      <button 
        onClick={handleSettingsClick}
        className="btn-icon"
        aria-label="Settings"
        title='Settings'
      >
        <Settings className="w-5 h-5 text-text" />
      </button>
    </div>
  );
}