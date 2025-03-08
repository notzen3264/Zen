import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Browser } from './components/Browser';
import { useBrowserStore } from './store/browser';

function App() {
  const { addTab } = useBrowserStore();

  useEffect(() => {
    addTab({
      url: 'about:blank',
      title: 'New Tab',
    });

    if ('serviceWorker' in navigator) {
      console.log("service worker");
      navigator.serviceWorker.register('/uv/sw.js', {
        scope: '/uv/service',
        type: 'classic',
        updateViaCache: 'none'
      }).catch(console.error);
    }
  }, [addTab]);

  return (
    <div className="flex h-screen transition-colors rounded-2xl text-text bg-crust">
      <Sidebar />
      <Browser />
    </div>
  );
}

export default App;