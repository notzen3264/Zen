import React, { useState, useEffect } from 'react';
import { Search, Lock, ChevronLeft, ChevronRight, RotateCw, ShieldAlert, Settings, PanelLeft } from 'lucide-react';
import { useBrowserStore } from '../store/browser';
import { useSettingsStore } from '../store/settings';

export function AddressBar() {
  const isMac = navigator.userAgent.includes("Mac");
  // Destructure proxyEngine along with other settings
  const { searchEngine, sidebarVisible, toggleSidebar, proxyEngine } = useSettingsStore();
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
    if (!activeTabId) return;
    if (activeTab?.url?.startsWith('https://')) {
      setInputs(prev => ({ ...prev, [activeTabId]: activeTab.url }));
      setIsSecure(true);
    } else if (activeTab?.url?.startsWith('http://')) {
      setInputs(prev => ({ ...prev, [activeTabId]: activeTab.url }));
      setIsSecure(false);
    } else {
      setInputs(prev => ({
        ...prev,
        [activeTabId]: activeTab?.url === 'about:blank' ? '' : (activeTab?.url || '')
      }));
      setIsSecure(null);
    }
  }, [activeTab?.url, activeTabId]);

  const handleInputChange = (tabId: string, value: string) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [tabId]: value,
    }));
  };

  const getSearchUrl = (engine: string) => {
    switch (engine) {
      case 'google':
        return 'https://www.google.com/search?q=%s';
      case 'duckduckgo':
        return 'https://duckduckgo.com/?q=%s';
      case 'bing':
        return 'https://www.bing.com/search?q=%s';
      default:
        return 'https://www.google.com/search?q=%s';
    }
  };

  const encodeUrl = async (url: string): Promise<string> => {
    if (!window.chemical) return url;

    try {
      // Configure Chemical.js options
      const options = {
        service: proxyEngine, // Use the selected proxy engine from settings
        autoHttps: true,
        searchEngine: getSearchUrl(searchEngine)
      };

      // Encode the URL using Chemical.js
      const encodedUrl = await window.chemical.encode(url, options);
      return encodedUrl;
    } catch (error) {
      console.error('Error encoding URL:', error);
      return url;
    }
  };

  const handleBrowserUrl = (url: string) => {
    const browserUrl = url.toLowerCase();

    switch (browserUrl) {
      case 'zen://settings':
        if (activeTabId) {
          updateTab(activeTabId, {
            url: browserUrl,
            title: 'Settings',
            favicon:
              'data:image/svg+xml,' +
              encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          `),
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

  const normalizeUrl = (url: string): string => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabId || !inputs[activeTabId]) return;

    let url = inputs[activeTabId];

    if (url.toLowerCase().startsWith('zen://')) {
      if (handleBrowserUrl(url)) return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = normalizeUrl(url);
      } else {
        const searchUrls: { [key: string]: string } = {
          google: 'https://www.google.com/search?q=',
          duckduckgo: 'https://duckduckgo.com/?q=',
          bing: 'https://www.bing.com/search?q=',
        };
        url = `${searchUrls[searchEngine]}${encodeURIComponent(url)}`;
      }
    }

    setLoading(activeTabId, true);

    try {
      // Use the encodeUrl helper to get the encoded URL
      const encodedUrl = await encodeUrl(url);
      console.log(encodedUrl);
      const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=128`;

      updateTab(activeTabId, {
        url: encodedUrl,
        title: url,
        favicon,
      });
    } finally {
      setLoading(activeTabId, false);
    }
  };

  const handleIframeLoad = (iframe: HTMLIFrameElement) => {
    if (!iframe.contentWindow) return;

    const win = iframe.contentWindow;

    // Back navigation
    win.addEventListener('keyup', (e: KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.altKey) && e.key === 'ArrowLeft') {
        win.history.back();
      }
    });

    // Forward navigation
    win.addEventListener('keyup', (e: KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.altKey) && e.key === 'ArrowRight') {
        win.history.forward();
      }
    });

    // Reload page
    win.addEventListener('keyup', (e: KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.altKey) && e.key === 'r') {
        win.location.reload();
      }
    });

    // Update tab info on navigation
    const updateTabInfo = async () => {
      if (!activeTabId || !win.location.href) return;

      try {
        const url = win.location.href;
        const title = win.document.title;
        const favicon =
          win.document.querySelector("link[rel*='icon']")?.href ||
          win.document.querySelector("link[rel='shortcut icon']")?.href ||
          `https://www.google.com/s2/favicons?domain=${url}&sz=128`;

        // Re-encode the URL if needed
        const encodedUrl = await encodeUrl(url);

        updateTab(activeTabId, {
          url: encodedUrl,
          title: title || url,
          favicon,
        });
      } catch (error) {
        console.error('Error updating tab info:', error);
      }
    };

    win.addEventListener('popstate', updateTabInfo);
    win.addEventListener('load', updateTabInfo);
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
            value={inputs[activeTabId || ''] || ''}
            onChange={(e) => handleInputChange(activeTabId || '', e.target.value)}
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