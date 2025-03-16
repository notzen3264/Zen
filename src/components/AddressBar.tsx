import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCw, UnlockKeyhole, Settings, PanelLeft, LockKeyhole } from 'lucide-react';
import { useBrowserStore } from '../store/browser';
import { useSettingsStore } from '../store/settings';
import { encodeUrl, normalizeUrl } from '../lib/utils';

export function AddressBar() {
  const isMac = navigator.userAgent.includes("Mac");
  const { searchEngine, sidebarVisible, toggleSidebar, service } = useSettingsStore();
  const { tabs, activeTabId, updateTab, setLoading, addTab, setActiveTab } = useBrowserStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
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
    setInputs(prevInputs => ({
      ...prevInputs,
      [tabId]: value,
    }));
  };

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
    if (!activeTabId) return;

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

    setLoading(activeTabId, true);

    try {
      const encodedUrl = await encodeUrl(url, searchEngine, window.chemical.getStore("service"));

      console.log(encodedUrl);

      updateTab(activeTabId, { url, iframeUrl: encodedUrl, title: url, favicon: '' });
    } catch (error) {
      console.error("Error Loading Web Content", error);
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
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <button className="btn-icon xs:hidden sm:flex" aria-label="Back">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="btn-icon xs:hidden sm:flex" aria-label="Forward">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button className="btn-icon xs:hidden sm:flex" aria-label="Reload">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative group active:scale-[0.99] transition-transform">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            {isSecure === null ? (
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
        className="btn-icon xs:hidden sm:flex"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-text" />
      </button>
    </div>
  );
}