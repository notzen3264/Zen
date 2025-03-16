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
    { value: 'uv', label: 'Ultraviolet', icon: <img src='/public/icons/ultraviolet.png' className="w-4 h-4"/> },
    { value: 'rh', label: 'Rammerhead', icon: <img src='/public/icons/rammerhead.png' className="w-4 h-4"/> },
    { value: 'scramjet', label: 'Scramjet', icon: <img src='/public/icons/scramjet.png' className="w-4 h-4"/> },
    //{ value: 'meteor', label: 'Meteor', icon: <img src='/public/icons/meteor.png' className="w-4 h-4"/> },
  ];

  const transportOptions = [
    { value: 'libcurl', label: 'Libcurl', icon: <Shield className="w-4 h-4" /> },
    { value: 'epoxy', label: 'Epoxy', icon: <Shield className="w-4 h-4" /> },
  ];

  const searchEngineOptions = [
    { value: 'google', label: 'Google', icon: <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> },
    { value: 'duckduckgo', label: 'DuckDuckGo', icon: <img src="https://duckduckgo.com/favicon.ico" className="w-4 h-4" alt="DuckDuckGo" /> },
    { value: 'bing', label: 'Bing', icon: <img src="https://www.bing.com/favicon.ico" className="w-4 h-4" alt="Bing" /> },
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
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'proxy', label: 'Proxy', icon: <Globe className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">Theme</h3>
              <p className="base-regular mb-4">
                Personalize your browser with a wide range of themes, each designed with a matching wallpaper for a cohesive look.
                You can request more themes by contacting ZenDev <span className='text-subtext0'>@notzen3264</span> on Discord.
              </p>
              <ThemeSelector />
            </div>
          </div>
        );
      case 'proxy':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">Proxy Engine</h3>
              <p className="base-regular mb-4">Select the backend proxy service that powers your browsing.
                Changing the service may make some websites perform better, support more web technologies, and may make your overall experience better.
              </p>
                <Dropdown
                  options={serviceOptions}
                  value={localService}
                  onChange={handleServiceChange}
                />
            </div>
            <div className="card">
              <h3 className="h3-bold mb-4">Proxy Transport</h3>
              <p className="base-regular mb-4">
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
              <h3 className="h3-bold mb-4">Search Engine</h3>
              <p className="base-regular mb-4">
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
              <h3 className="h3-bold mb-4">Privacy Settings</h3>
              <p className="base-regular mb-4">Manage your privacy preferences</p>
              {/* Additional privacy content */}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">About Zen</h3>
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
              <h3 className="h3-bold mb-4">Development Team</h3>
              <p className="base-regular text-text">
                Zen is completely open-source and is owned, maintained, and managed by the dedicated Zen Dev Team at Blackwell Labs.
                All of the source code is available on the official GitHub repository.
              </p>
            </div>
            <div className="card">
              <h3 className="h3-bold mb-4">Technologies</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">React</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">TypeScript</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Tailwind CSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Chemical.js</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Libcurl</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Epoxy</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Ultraviolet</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Rammerhead</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-surface0 rounded-full"></div>
                  <span className="base-medium">Scramjet</span>
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
    <div className="frame max-w-5xl h-full mx-auto flex overflow-hidden rounded-2xl">
      <div className="settings-sidebar">
        <h2 className="h2-bold mb-6 px-4">Settings</h2>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "settings-sidebar-item",
              activeTab === tab.id
                ? "settings-sidebar-item-active"
                : "settings-sidebar-item-inactive"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span className={cn("small-medium",
              activeTab === tab.id
              ? "settings-sidebar-item-active"
              : "settings-sidebar-item-inactive"
            )}>{tab.label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="h1-bold mb-2">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h1>
        {/*<p className="base-regular text-subtext0 mb-6">
          Customize your browsing experience
        </p>*/}
        {renderTabContent()}
      </div>
    </div>
  );
}
