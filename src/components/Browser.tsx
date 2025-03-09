import { useBrowserStore } from '../store/browser';
import { AddressBar } from './AddressBar';
import { Settings } from './Settings';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';
import { Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
interface ContentWindow extends Window {
  __uv$location: Location;
}

declare global {
  interface Window {
    chemical: any;
  }
}

export function Browser() {
  const isMac = navigator.userAgent.includes("Mac");
  const { tabs, activeTabId, updateTab, setLoading, addTab, setActiveTab } = useBrowserStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const { searchEngine, proxyEngine } = useSettingsStore();
  const { currentTheme } = useTheme();
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});

  // Initialize Chemical.js storage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.chemical) {
      if (!window.chemical.getStore('proxyEngine')) {
        window.chemical.setStore('proxyEngine', 'ultraviolet');
      }
      if (!window.chemical.getStore('proxyTransport')) {
        window.chemical.setStore('proxyTransport', 'libcurl');
      }
      if (!window.chemical.getStore('searchEngine')) {
        window.chemical.setStore('searchEngine', 'google');
      }
      if (!window.chemical.getStore('bookmarks')) {
        window.chemical.setStore('bookmarks', '[]');
      }
    }
  }, []);

  const handleInputChange = (tabId: string, value: string) => {
    setInputs((prevInputs) => ({
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
        service: proxyEngine, // Use the selected proxy engine
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
        updateTab(activeTabId!, {
          url: browserUrl,
          title: 'Settings',
          favicon: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          `),
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
      // Encode the URL using Chemical.js
      const encodedUrl = await window.chemical.encode(url);
      console.log(encodedUrl)
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
        const favicon = win.document.querySelector("link[rel*='icon']")?.href ||
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

  const renderContent = () => {
    if (!activeTab) return null;

    if (activeTab.url === 'about:blank') {
      return (
        <div className="w-full h-full bg-crust flex items-center justify-center rounded-2xl relative overflow-hidden">
          <img className='new-tab-background' src={`${currentTheme?.wallpaper}`} alt="Background" />
          <div className="scale-up-animation w-full max-w-lg p-12 flex-col items-center z-10">
            <h1 className="zen-bold text-blue text-center mb-5 space_grotesk bg-base max-w-[6rem] mx-auto rounded-2xl">
              Zen
            </h1>
            <form onSubmit={handleSubmit} className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                  <Search className="h-4 w-4 text-text invert-text group-focus-within:text-text" />
                </div>
                <input
                  type="text"
                  value={inputs[activeTabId || ''] || ''}
                  onChange={(e) => handleInputChange(activeTabId || '', e.target.value)}
                  className="max-w-465 w-full h-10 bg-base rounded-full pl-12 pr-4 py-6
                  text-sm text-light-1 placeholder-subtext0
                  focus:outline-none focus:ring-0 focus:surface0 
                  focus:bg-surface0 transition-all z-10"
                  placeholder="Search the web freely with Zen..."
                />
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (activeTab.url === 'zen://settings') {
      return <Settings />;
    }

    return (
      <iframe
        key={activeTab.id}
        src={activeTab.url}
        className={cn(
          "w-full h-full rounded-2xl border-none transition-opacity duration-300 z-50",
          activeTab.loading && "animate-pulse"
        )}
        title={activeTab.title}
        onLoad={(e) => handleIframeLoad(e.target as HTMLIFrameElement)}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="h-20 flex items-center">
        <AddressBar />
      </div>
      <div className="content-frame">
        {renderContent()}
      </div>
    </div>
  );
}