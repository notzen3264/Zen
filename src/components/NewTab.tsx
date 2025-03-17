import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useBrowserStore } from '../store/browser';
import { useSettingsStore } from '../store/settings';
import { encodeUrl, normalizeUrl } from '../lib/utils';

export default function NewTab() {
    const { currentTheme } = useTheme();
    const { activeTabId, updateTab, setLoading } = useBrowserStore();
    const { searchEngine, service } = useSettingsStore();
    const [inputs, setInputs] = useState<{ [key: string]: string }>({});

    const handleInputChange = (tabId: string, value: string) => {
        setInputs((prevInputs) => ({
            ...prevInputs,
            [tabId]: value,
        }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTabId || !inputs[activeTabId]) return;

        let url = inputs[activeTabId];
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
            const encodedUrl = await encodeUrl(url, searchEngine, service);
            updateTab(activeTabId, { url, iframeUrl: encodedUrl, title: url, favicon: '' });
        } catch (error) {
            console.error("Error Loading Web Content", error);
        }
    };

    return (
        <div className="w-full h-full bg-crust flex items-center justify-center rounded-2xl relative overflow-hidden">
            <img className="new-tab-background" src={`${currentTheme?.wallpaper}`} alt="Wallpaper" />
            <div className="scale-up-animation w-full max-w-lg p-12 flex-col items-center z-10">
                <h1 className="zen-bold text-blue text-center mb-5 space_grotesk bg-base max-w-[6rem] mx-auto rounded-2xl">Zen</h1>
                <form onSubmit={handleSubmit} className="flex-1">
                    <div className="relative group active:scale-[0.95] transition-all">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                            <Search className="h-4 w-4 text-text invert-text group-focus-within:text-text" />
                        </div>
                        <input
                            type="text"
                            value={inputs[activeTabId || ''] || ''}
                            onChange={(e) => handleInputChange(activeTabId || '', e.target.value)}
                            className="input-new-tab-search"
                            placeholder="Search the web freely with Zen..."
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
