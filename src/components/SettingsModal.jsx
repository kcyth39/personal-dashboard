import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSave, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

export default function SettingsModal({ isOpen, onClose }) {
    const [config, setConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('links');
    const [isSaving, setIsSaving] = useState(false);

    // For Location Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch('/data/dashboard-config.json')
                .then(res => res.json())
                .then(data => setConfig(JSON.parse(JSON.stringify(data)))) // Deep copy
                .catch(err => console.error('Failed to load config for settings:', err));
        }
    }, [isOpen]);

    if (!isOpen || !config) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                // 保存完了後に全体をリロードして反映させる
                window.location.reload();
            } else {
                console.error('Failed to save configuration');
                alert('保存に失敗しました');
                setIsSaving(false);
            }
        } catch (e) {
            console.error('Error saving:', e);
            alert('保存に失敗しました');
            setIsSaving(false);
        }
    };

    // Generic updater for array data
    const updateArrayItem = (key, index, field, value) => {
        const newArray = [...config[key]];
        newArray[index] = { ...newArray[index], [field]: value };
        setConfig({ ...config, [key]: newArray });
    };

    const removeArrayItem = (key, index) => {
        const newArray = [...config[key]];
        newArray.splice(index, 1);
        setConfig({ ...config, [key]: newArray });
    };

    const addArrayItem = (key, defaultItem) => {
        setConfig({ ...config, [key]: [...config[key], defaultItem] });
    };

    // Geocoding Search
    const handleLocationSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]);
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=ja&format=json`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.results) {
                setSearchResults(data.results);
            } else {
                setSearchResults([]);
                alert('候補が見つかりませんでした。別の地名で試してください。');
            }
        } catch (err) {
            console.error('Error during location search:', err);
            alert('検索中にエラーが発生しました。');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectLocation = (loc) => {
        setConfig({
            ...config,
            location: {
                name: loc.name,
                lat: loc.latitude,
                lon: loc.longitude
            }
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-slate-900/80">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-1/4 min-w-[120px] bg-white/40 dark:bg-black/20 p-4 flex flex-col space-y-2 border-r border-gray-200 dark:border-gray-800">
                        {['links', 'rssFeeds', 'location'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                                    }`}
                            >
                                {tab === 'links' && 'Links'}
                                {tab === 'rssFeeds' && 'RSS Feeds'}
                                {tab === 'location' && 'Location'}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {activeTab === 'links' && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quick Links セクションに表示されるブックマークを設定します。</p>
                                {config.links.map((link, idx) => (
                                    <div key={idx} className="flex gap-3 items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <input
                                            type="text"
                                            value={link.icon}
                                            onChange={(e) => updateArrayItem('links', idx, 'icon', e.target.value)}
                                            className="w-12 px-2 py-1 flex-shrink-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center"
                                            placeholder="Emoji"
                                        />
                                        <input
                                            type="text"
                                            value={link.name}
                                            onChange={(e) => updateArrayItem('links', idx, 'name', e.target.value)}
                                            className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => updateArrayItem('links', idx, 'url', e.target.value)}
                                            className="flex-[2] px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
                                            placeholder="URL"
                                        />
                                        <button onClick={() => removeArrayItem('links', idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addArrayItem('links', { name: "New Link", url: "https://", icon: "🔗" })}
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium px-2 py-2"
                                >
                                    <FaPlus /> Add Link
                                </button>
                            </div>
                        )}

                        {activeTab === 'rssFeeds' && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">News セクションに表示されるRSSフィード元を設定します。</p>
                                {config.rssFeeds.map((feed, idx) => (
                                    <div key={idx} className="flex gap-3 items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <input
                                            type="text"
                                            value={feed.name}
                                            onChange={(e) => updateArrayItem('rssFeeds', idx, 'name', e.target.value)}
                                            className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                            placeholder="Feed Name"
                                        />
                                        <input
                                            type="text"
                                            value={feed.url}
                                            onChange={(e) => updateArrayItem('rssFeeds', idx, 'url', e.target.value)}
                                            className="flex-[2] px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
                                            placeholder="RSS URL"
                                        />
                                        <button onClick={() => removeArrayItem('rssFeeds', idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addArrayItem('rssFeeds', { name: "New Feed", url: "https://" })}
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium px-2 py-2"
                                >
                                    <FaPlus /> Add Feed
                                </button>
                            </div>
                        )}

                        {activeTab === 'location' && (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        天気予報を取得するための位置情報を設定します。（都市名で検索して選択するか、手動で入力してください）
                                    </p>

                                    {/* Location Search Box */}
                                    <div className="flex gap-2 mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                                            placeholder="都市名を入力して検索 (例: 東京, Osaka)"
                                            className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
                                            onClick={handleLocationSearch}
                                            disabled={isSearching}
                                            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-70"
                                        >
                                            {isSearching ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaSearch />}
                                            検索
                                        </button>
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="mb-6 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                                            <p className="text-xs font-bold text-gray-500 px-2 py-1">検索結果 ({searchResults.length}件)</p>
                                            {searchResults.map((loc) => (
                                                <div key={loc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors group">
                                                    <div>
                                                        <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
                                                            <FaMapMarkerAlt className="text-red-500" />
                                                            {loc.name} {loc.admin1 && <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">({loc.admin1}{loc.country && `, ${loc.country}`})</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1 pl-6">
                                                            緯度: {loc.latitude.toFixed(4)} / 経度: {loc.longitude.toFixed(4)} {loc.elevation ? `/ 標高: ${loc.elevation}m` : ''}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectLocation(loc)}
                                                        className="px-4 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 dark:bg-slate-600 dark:hover:bg-blue-900/50 dark:text-gray-300 dark:hover:text-blue-300 rounded font-medium text-sm transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        選択
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">現在の設定</h3>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location Name (表示名)</label>
                                        <input
                                            type="text"
                                            value={config.location.name}
                                            onChange={(e) => setConfig({ ...config, location: { ...config.location, name: e.target.value } })}
                                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-1 flex-col gap-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latitude (緯度)</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={config.location.lat}
                                                onChange={(e) => setConfig({ ...config, location: { ...config.location, lat: parseFloat(e.target.value) || 0 } })}
                                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Longitude (経度)</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={config.location.lon}
                                                onChange={(e) => setConfig({ ...config, location: { ...config.location, lon: parseFloat(e.target.value) || 0 } })}
                                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-white/30 dark:bg-black/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FaSave />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save & Reload'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
