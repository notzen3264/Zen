import { useBrowserStore } from '../store/browser';
import { AddressBar } from './AddressBar';
import { Settings } from './Settings';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '../store/settings';
import { cn, encodeUrl } from '../lib/utils';
import NewTab from './NewTab';

declare global {
  interface Window {
    chemical: any;
  }
  interface ContentWindow extends Window {
    __uv$location: Location;
  }
}

export function Browser() {
  const { tabs, activeTabId, updateTab, setLoading } = useBrowserStore();
  const { searchEngine, service } = useSettingsStore();
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const loadedUrls = useRef<{ [key: string]: string }>({});
  const cleanupRefs = useRef<{ [key: string]: () => void }>({});
  const updatingRefs = useRef<{ [key: string]: boolean }>({});
  const [urlKey, setUrlKey] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chemical) {
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
  }, []);

  const handleIframeLoad = useCallback((tabId: string, iframe: HTMLIFrameElement) => {
    if (!iframe) return;

    const contentWindow = iframe.contentWindow as ContentWindow;
    if (!contentWindow) return;

    cleanupRefs.current[tabId]?.();

    const updateUrl = async () => {
      try {
        const rawUrl = contentWindow.location.href;
        const decodedUrl = await window.chemical.decode(rawUrl);
        updateTab(tabId, { url: decodedUrl, iframeUrl: rawUrl });
        loadedUrls.current[tabId] = rawUrl;
        updatingRefs.current[tabId] = true;
      } catch (error) {
        console.error('Failed to decode and update URL:', error);
      }
    };

    const updateMetadata = async () => {
      try {
        const rawUrl = contentWindow.location.href;
        const decodedUrl = await window.chemical.decode(rawUrl);
        const urlObj = new URL(decodedUrl);

        const uvFaviconUrl = await encodeUrl(`${contentWindow.__uv$location.origin}/favicon.ico`, searchEngine, service);
        const constructedFaviconUrl = await encodeUrl(`${urlObj.origin}/favicon.ico`, searchEngine, service);
        const docFavicon = await encodeUrl(`${contentWindow.document?.querySelector<HTMLLinkElement>("link[rel*='icon']")?.href}`, searchEngine, service);

        console.log(`UV Favicon: ${uvFaviconUrl}`, `Constrcuted ${constructedFaviconUrl}`, `doc: ${docFavicon}`);

        const documentTitle = contentWindow.document?.title || '';
        const favicon = docFavicon || constructedFaviconUrl || uvFaviconUrl;

        updateTab(tabId, {
          title: documentTitle,
          favicon: favicon,
        });
      } catch (error) {
        console.error('Failed to update metadata:', error);
      } finally {
        const documentAvailable =
          contentWindow.document &&
          contentWindow.document.readyState === 'complete' &&
          contentWindow.document.body &&
          contentWindow.document.body.childElementCount > 0;

        setLoading(tabId, !documentAvailable ? true : false);
        updatingRefs.current[tabId] = false;
      }
    };

    const handleNavigation = (initial = false) => {
      if (!initial) setLoading(tabId, true);
      updateUrl().then(() => {
        updateMetadata();
      });
    };

    const patchHistory = () => {
      const original = {
        pushState: contentWindow.history.pushState,
        replaceState: contentWindow.history.replaceState,
      };

      contentWindow.history.pushState = function (...args) {
        const result = original.pushState.apply(this, args as any);
        handleNavigation();
        return result;
      };

      contentWindow.history.replaceState = function (...args) {
        const result = original.replaceState.apply(this, args as any);
        handleNavigation();
        return result;
      };

      return () => {
        contentWindow.history.pushState = original.pushState;
        contentWindow.history.replaceState = original.replaceState;
      };
    };

    const handlePopState = () => handleNavigation();
    const handleHashChange = () => handleNavigation();
    const handleClick = (event: MouseEvent) => {
      if (event.target instanceof HTMLAnchorElement) {
        handleNavigation();
      }
    };

    const cleanupHistory = patchHistory();

    contentWindow.addEventListener('popstate', handlePopState);
    contentWindow.addEventListener('hashchange', handleHashChange);
    contentWindow.addEventListener('click', handleClick);

    const loadHandler = () => handleNavigation(true);
    iframe.addEventListener('load', loadHandler);
    iframe.addEventListener('error', () => {
      setLoading(tabId, false);
      updatingRefs.current[tabId] = false;
    });

    cleanupRefs.current[tabId] = () => {
      cleanupHistory();
      contentWindow.removeEventListener('popstate', handlePopState);
      contentWindow.removeEventListener('hashchange', handleHashChange);
      contentWindow.removeEventListener('click', handleClick);
      iframe.removeEventListener('load', loadHandler);
      iframe.removeEventListener('error', () => {
        setLoading(tabId, false);
        updatingRefs.current[tabId] = false;
      });
    };

    handleNavigation(true);
  }, [updateTab, setLoading, searchEngine, service]);

  const renderContent = () => {
    return tabs.map((tab) => {
      const isActive = tab.id === activeTabId;
      const iframeUrl = tab.iframeUrl;
      const isUpdating = updatingRefs.current[tab.id];

      return (
        <div
          key={tab.id}
          className={cn(
            'tab-window',
            isActive ? 'tab-window-active' : 'tab-window-inactive'
          )}
        >
          {tab.url === 'about:blank' ? (
            <NewTab />
          ) : tab.url === 'zen://settings' ? (
            <Settings />
          ) : (
            <iframe
              key={tab.id}
              ref={(el) => {
                iframeRefs.current[tab.id] = el;
                if (el && isActive) {
                  // set our src if we are not currently updating and if this url has not already been loaded. THIS FIXES THE DOUBLE LOADING ISSUE WOOOOOO
                  const alreadyLoaded = loadedUrls.current[tab.id] === iframeUrl;
                  if (!alreadyLoaded && !isUpdating) {
                    el.src = iframeUrl;
                    loadedUrls.current[tab.id] = iframeUrl;
                  }
                }
              }}
              className="iframe"
              onLoad={(e) =>
                isActive && handleIframeLoad(tab.id, e.target as HTMLIFrameElement)
              }
              onError={() => {
                setLoading(tab.id, false);
                updatingRefs.current[tab.id] = false;
              }}
              title={tab.title}
              style={{ visibility: isActive ? 'visible' : 'hidden' }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="browser-container">
      <div className="addressbar-container">
        <AddressBar setUrlKey={setUrlKey} />
      </div>
      <div className="content-window">{renderContent()}</div>
    </div>
  );
}
