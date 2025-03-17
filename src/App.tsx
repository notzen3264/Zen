import { Sidebar } from './components/Sidebar';
import { Browser } from './components/Browser';

function App() {
  return (
    <div className="flex h-screen transition-colors text-text bg-crust">
      <Sidebar />
      <Browser />
    </div>
  );
}

export default App;