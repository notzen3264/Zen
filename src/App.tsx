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
  }, [addTab]);

  return (
    <div className="flex h-screen transition-colors text-text bg-crust">
      <Sidebar />
      <Browser />
    </div>
  );
}

export default App;