import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';
import { Dropdown } from './ui/Dropdown';
import { ThemeSelector } from './ui/ThemeSelector';
import {
  Palette,
  Globe,
  Search,
  Shield,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

type SettingsTab = 'appearance' | 'proxy' | 'search' | 'privacy' | 'about';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const {
    service,
    setService,
    transport,
    setTransport,
    searchEngine,
    setSearchEngine
    // bookmarks and removeBookmark
  } = useSettingsStore();

  const [localService, setLocalService] = useState<string>(service);
  const [localTransport, setLocalTransport] = useState<string>(transport);
  const [localSearchEngine, setLocalSearchEngine] = useState<string>(searchEngine);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chemical) {
      const storedService = window.chemical.getStore('service') || 'uv';
      const storedTransport = window.chemical.getStore('transport') || 'libcurl';
      const storedSearchEngine = window.chemical.getStore('searchEngine') || 'google';
      setLocalService(storedService);
      setLocalTransport(storedTransport);
      setLocalSearchEngine(storedSearchEngine);
    }
  }, []);

  const serviceOptions = [
    { value: 'uv', label: 'Ultraviolet', icon: <img src='/icons/ultraviolet.png' className="w-4 h-4" alt='Ultraviolet' aria-label='Ultraviolet' title='Ultraviolet'/> },
    { value: 'rh', label: 'Rammerhead', icon: <img src='/icons/rammerhead.png' className="w-4 h-4" alt='Rammerhead' aria-label='Rammerhead' title='Rammerhead'/> },
    { value: 'scramjet', label: 'Scramjet', icon: <img src='/icons/scramjet.png' className="w-4 h-4" alt='Scramjet' aria-label='Scramjet' title='Scramjet'/> },
  ];

  const transportOptions = [
    { value: 'libcurl', label: 'Libcurl', icon: <Shield className="w-4 h-4" aria-label='Libcurl'/> },
    { value: 'epoxy', label: 'Epoxy', icon: <Shield className="w-4 h-4" aria-label='Epoxy'/> },
  ];

  const searchEngineOptions = [
    { value: 'google', label: 'Google', icon: <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" aria-label='Google' title='Google'/> },
    { value: 'duckduckgo', label: 'DuckDuckGo', icon: <img src="https://duckduckgo.com/favicon.ico" className="w-4 h-4" alt="DuckDuckGo" aria-label='DuckDuckGo' title='DuckDuckGo'/> },
    { value: 'bing', label: 'Bing', icon: <img src="https://www.bing.com/favicon.ico" className="w-4 h-4" alt="Bing" aria-label='Bing' title='Bing'/> },
  ];

  const handleServiceChange = (value: string) => {
    setLocalService(value);
    setService(value as 'uv' | 'rh' | 'scramjet');
  };

  const handleTransportChange = (value: string) => {
    setLocalTransport(value);
    setTransport(value as 'libcurl' | 'epoxy');
  };

  const handleSearchEngineChange = (value: string) => {
    setLocalSearchEngine(value);
    setSearchEngine(value as 'google' | 'duckduckgo' | 'bing');
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" aria-label='Appearance'/> },
    { id: 'proxy', label: 'Proxy', icon: <Globe className="w-5 h-5" aria-label='Proxy'/> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" aria-label='Search'/> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" aria-label='Privacy'/> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" aria-label='About'/> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Theme</h3>
              <p className="base-regular mb-4 text-text">
                Personalize your browser with a wide range of themes, each designed with a matching wallpaper.
              </p>
              <ThemeSelector />
            </div>
          </div>
        );
      case 'proxy':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Proxy Engine</h3>
              <p className="base-regular mb-4 text-text">
                Select the backend proxy service that powers your browsing.
                Changing the service may make some websites perform better, support more web technologies, and may make your overall experience better.
              </p>
                <Dropdown
                  options={serviceOptions}
                  value={localService}
                  onChange={handleServiceChange}
                />
            </div>
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Proxy Transport</h3>
              <p className="base-regular mb-4 text-text">
                Configure how your connection is routed through the proxy.
                Different transport methods may offer varying levels of speed, security, and compatibility.
                This is an advanced feature, please do not change it if you do not no what you are doing.  
              </p>
              <Dropdown
                options={transportOptions}
                value={localTransport}
                onChange={handleTransportChange}
              />
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Search Engine</h3>
              <p className="base-regular mb-4 text-text">
                Customize your browsing experience by selecting your preferred search engine.
                This setting changes which search provider is used when you enter queries in the search bar.
              </p>
              <Dropdown
                options={searchEngineOptions}
                value={localSearchEngine}
                onChange={handleSearchEngineChange}
              />
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Privacy Settings</h3>
              <p className="base-regular mb-4 text-text">Manage your privacy preferences</p>
              {/* Additional privacy content */}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">About Zen</h3>
              <p className="base-regular text-text mb-4">
                Zen is a clean & modern web proxy browser interface with vertical tabs,
                built with React and TypeScript.
              </p>
              <div className="bg-surface0 p-4 rounded-2xl">
                <div className='mb-2'>
                  <p className="small-semibold mb-1 text-text">Version</p>
                  <p className="small-medium text-subtext0">1.0.0</p>
                </div>
                <div className='mb-2'>
                  <p className="small-semibold mb-1 text-text">Creator</p>
                  <p className="small-medium text-subtext0">CyMasterDev (or ZenDev)</p>
                </div>
                <div>
                  <p className="small-semibold mb-1 text-text">Company</p>
                  <p className="small-medium text-subtext0">Blackwell Labs</p>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Development Team</h3>
              <p className="base-regular text-text">
                Zen is completely open-source and is owned, maintained, and managed by the dedicated Zen Development Team at Blackwell Labs.
                All of the source code is available on the official GitHub repository.
              </p>
            </div>
            <div className="card">
              <h3 className="h3-bold mb-4 text-text">Technologies</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">React</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">TypeScript</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Tailwind CSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Chemical.js</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Libcurl</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Epoxy</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Ultraviolet</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Rammerhead</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium text-text">Scramjet</span>
                </li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="frame max-w-5xl h-full mx-auto flex overflow-hidden">
      <div className="settings-sidebar">
        <h2 className="h2-bold mb-6 px-4 text-text">Settings</h2>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "settings-sidebar-item text-text",
              activeTab === tab.id
                ? "settings-sidebar-item-active"
                : "settings-sidebar-item-inactive"
            )}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            title={tab.label}
          >
            {tab.icon}
            <span className={cn("small-medium text-text bg-transparent",
              activeTab === tab.id
              ? "settings-sidebar-item-active"
              : "settings-sidebar-item-inactive"
            )}>{tab.label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="h1-bold mb-2 text-text">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h1>
        {renderTabContent()}
      </div>
    </div>
  );
}
