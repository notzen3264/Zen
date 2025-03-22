import { useBrowserStore } from '../store/browser';
import { AddressBar } from './AddressBar';
import { Settings } from './Settings';
import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/settings';
import { Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn, encodeUrl, normalizeUrl } from '../lib/utils';
import NewTab from './NewTab';

declare global {
  interface Window {
    chemical: any;
    __uv$location: Location;
    location: Location;
  }
  interface ContentWindow extends Window {
    __uv$location: Location;
  }
}

export function Browser() {
  const isMac = navigator.userAgent.includes("Mac");
  const { tabs, activeTabId, updateTab, setLoading } = useBrowserStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const { searchEngine, service } = useSettingsStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chemical) {
      const defaults = {
        service: 'uv',
        proxyTransport: 'libcurl',
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

  useEffect(() => {
    if (iframeRef.current) {
      handleIframeLoad(iframeRef.current);
    }
  }, [activeTab?.url]);

  const handleIframeLoad = async (iframe: HTMLIFrameElement) => {
    if (!iframeRef.current || !activeTabId) return;
  
    const contentWindow = iframeRef.current.contentWindow as ContentWindow;
    if (!contentWindow) return;
  
    try {
      let origin = activeTab?.url;
      if (!origin || typeof origin !== "string") return;
  
      try {
        origin = new URL(origin).origin;
      } catch (e) {
        console.error("Invalid URL:", origin);
        return;
      }
  
      const faviconUrl = await encodeUrl(`${origin}/favicon.ico`, searchEngine, service);
      const title = contentWindow.document?.title;
      const favicon =
        contentWindow.document?.querySelector<HTMLLinkElement>("link[rel*='icon']")?.href ||
        faviconUrl;
  
      updateTab(activeTabId, { title, favicon });
  
      const updateUrl = async () => {
        if (!iframeRef.current) return;
  
        const newIframeUrl = contentWindow.location.href;
  
        if (!newIframeUrl) return;
  
        const newUrl = await window.chemical.decode(newIframeUrl);
  
        if (!newUrl) return;
  
        if (
          newIframeUrl !== activeTab?.iframeUrl &&
          newUrl !== activeTab?.url
        ) {
          updateTab(activeTabId, { url: newUrl });
          updateTab(activeTabId, { iframeUrl: newIframeUrl });
        } else {
          updateTab(activeTabId, { url: newUrl });
          updateTab(activeTabId, { iframeUrl: newIframeUrl });
        }
      };
  
      const checkIframeLoaded = () => {
        if (
          contentWindow.document &&
          contentWindow.document.body &&
          contentWindow.document.head &&
          contentWindow.document.body.children.length > 0 &&
          contentWindow.document.head.children.length > 0
        ) {
          setLoading(activeTabId, false);
        } else {
          console.warn("Iframe content is empty, reloading...");
          iframe.src = iframe.src;
        }
      };
  
      contentWindow.addEventListener("popstate", updateUrl);
      contentWindow.addEventListener("hashchange", updateUrl);
      iframe.addEventListener("load", updateUrl);
      iframe.addEventListener("load", checkIframeLoaded);
    } catch (error) {
      console.error("Error updating iframe:", error);
    }
  };  

  const renderContent = () => {
    if (!activeTab) return null;

    if (activeTab.url === 'about:blank') {
      return (
        <NewTab />
      );
    }

    if (activeTab.url === 'zen://settings') {
      return <Settings />;
    }

    return (
      <iframe
        key={activeTab.id}
        ref={iframeRef}
        src={activeTab.iframeUrl}
        className={cn("w-full h-full rounded-2xl border-none transition-opacity duration-300 z-50", activeTab.loading && "animate-pulse duration-1000")}
        title={activeTab.title}
        aria-label={activeTab.title}
        onLoad={(e) => handleIframeLoad(e.target as HTMLIFrameElement)}
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