import React, { useState } from 'react';
import { useSettingsStore } from '../store/settings';
import { Dropdown } from './ui/Dropdown';
import { ThemeSelector } from './ui/ThemeSelector';
import {
  Palette,
  Globe,
  Search,
  Shield,
  User,
  Lock,
  HelpCircle,
  Info,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

type SettingsTab = 'appearance' | 'proxy' | 'search' | 'privacy' | 'about';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const {
    proxyEngine,
    setProxyEngine,
    proxyTransport,
    setProxyTransport,
    searchEngine,
    setSearchEngine,
    bookmarks,
    removeBookmark
  } = useSettingsStore();

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'proxy', label: 'Proxy', icon: <Globe className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
  ];

  const searchEngineOptions = [
    { value: 'google', label: 'Google', icon: <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> },
    { value: 'duckduckgo', label: 'DuckDuckGo', icon: <img src="https://duckduckgo.com/favicon.ico" className="w-4 h-4" alt="DuckDuckGo" /> },
    { value: 'bing', label: 'Bing', icon: <img src="https://www.bing.com/favicon.ico" className="w-4 h-4" alt="Bing" /> },
  ];

  const proxyEngineOptions = [
    { value: 'ultraviolet', label: 'Ultraviolet', icon: <Shield className="w-4 h-4" /> },
    { value: 'rammerhead', label: 'Rammerhead', icon: <Shield className="w-4 h-4" /> },
    { value: 'scramjet', label: 'Scramjet', icon: <Shield className="w-4 h-4" /> },
  ];

  const proxyTransportOptions = [
    { value: 'libcurl', label: 'LibCurl', icon: <Shield className="w-4 h-4" /> },
    { value: 'epoxy', label: 'Epoxy', icon: <Shield className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">Theme</h3>
              <p className="base-medium mb-4">Choose a theme for your browser</p>
              <ThemeSelector />
            </div>
          </div>
        );

      case 'proxy':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">Proxy Engine</h3>
              <p className="base-medium mb-4">Select which proxy engine to use for web browsing</p>
              <div className='z-[9999999]'>
              <Dropdown
                options={proxyEngineOptions}
                value={proxyEngine}
                onChange={(value) => setProxyEngine(value as 'ultraviolet' | 'rammerhead' | 'scramjet')}
              />
              </div>
            </div>
            <div className="card">
              <h3 className="h3-bold mb-4">Proxy Transport</h3>
              <p className="base-medium mb-4">Select the transport method for proxy connections</p>
              <Dropdown
                options={proxyTransportOptions}
                value={proxyTransport}
                onChange={(value) => setProxyTransport(value as 'libcurl' | 'epoxy')}
              />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">Search Engine</h3>
              <p className="base-medium mb-4">Choose your default search engine</p>
              <Dropdown
                options={searchEngineOptions}
                value={searchEngine}
                onChange={setSearchEngine}
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">Privacy Settings</h3>
              <p className="base-medium mb-4">Manage your privacy preferences</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="base-semibold">Block Trackers</p>
                    <p className="small-medium text-light-3">Block known tracking scripts</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="base-semibold">Clear Data on Exit</p>
                    <p className="small-medium text-light-3">Clear browsing data when closing the browser</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="h3-bold mb-4">About Zen</h3>
              <p className="base-medium mb-4">
                Zen is a clean & modern modern web proxy browser interface with vertical tabs, built with React and TypeScript.
              </p>
              <div className="bg-surface0 p-4 rounded-2xl">
                <div className='mb-2'>
                  <p className="small-semibold mb-1 text-text">Version</p>
                  <p className="small-medium text-subtext0">1.0.0</p>
                </div>
                <div>
                  <p className="small-semibold mb-1 text-text">Creator</p>
                  <p className="small-medium text-subtext0">CyMasterDev (or ZenDev)</p>
                </div>
              </div>
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
              activeTab === tab.id ? "settings-sidebar-item-active" : "settings-sidebar-item-inactive"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span className="text-sm text-text">{tab.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="h1-bold mb-2">{tabs.find(t => t.id === activeTab)?.label}</h1>
        <p className="base-medium text-light-3 mb-6">Customize your browsing experience</p>

        {renderTabContent()}
      </div>
    </div>
  );
}