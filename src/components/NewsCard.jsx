import React from 'react';
import { FaRegNewspaper, FaChartLine, FaArrowUp, FaArrowDown, FaTrashAlt } from 'react-icons/fa';

export default function NewsCard() {
    const [data, setData] = React.useState(null);
    // 既読記事の管理（タイムスタンプ付き、5日で自動期限切れ）
    const EXPIRY_DAYS = 5;
    const [readArticles, setReadArticles] = React.useState(() => {
        try {
            const saved = localStorage.getItem('read_articles');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            const now = Date.now();
            const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            // 旧形式（文字列配列）からの移行対応
            if (parsed.length > 0 && typeof parsed[0] === 'string') {
                const migrated = parsed.map(id => ({ id, at: now }));
                localStorage.setItem('read_articles', JSON.stringify(migrated));
                return migrated;
            }
            // 期限切れエントリを除去
            const valid = parsed.filter(entry => (now - entry.at) < expiryMs);
            if (valid.length !== parsed.length) {
                localStorage.setItem('read_articles', JSON.stringify(valid));
            }
            return valid;
        } catch {
            return [];
        }
    });

    // 高速ルックアップ用のSetを生成
    const readIds = React.useMemo(() => new Set(readArticles.map(e => e.id)), [readArticles]);

    const markAsRead = (id) => {
        if (!id) return;
        setReadArticles(prev => {
            if (prev.some(e => e.id === id)) return prev;
            const newList = [...prev, { id, at: Date.now() }];
            localStorage.setItem('read_articles', JSON.stringify(newList));
            return newList;
        });
    };

    const dismissArticle = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        markAsRead(id);
    };

    const fetchData = () => {
        fetch(`/data/dashboard-data.json?t=${Date.now()}`)
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error('Failed to load news/market data:', err));
    };

    React.useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };

    if (!data) {
        return (
            <div className="glass-panel p-6 rounded-2xl flex flex-col h-full items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Loading data...</p>
            </div>
        );
    }

    // 既読を除外し、上位件数に絞る
    const filteredTopNews = (data.news.top?.items || [])
        .filter(item => !readIds.has(item.id))
        .slice(0, 10);

    const filteredRssNews = (data.news.rss?.items || [])
        .filter(item => !readIds.has(item.id))
        .slice(0, 20);

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full overflow-hidden">
            {/* Market Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <FaChartLine className="text-blue-500 text-2xl" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Market</h2>
                        <div className="hidden sm:flex items-center space-x-3 ml-4">
                            <a href="https://www.nikkei.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">NIKKEI</a>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <a href="https://shikiho.toyokeizai.net/mypage/0" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">四季報</a>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <a href="https://www.sbisec.co.jp/ETGate/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">SBI</a>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(data.market.data).map(([key, item]) => {
                        const isUp = item.change >= 0;
                        return (
                            <div key={key} className="bg-white/30 dark:bg-slate-800/30 p-3 rounded-xl border border-white/20 dark:border-gray-700 shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{item.name}</div>
                                    <div className="text-[9px] text-gray-400 font-medium">{formatTime(item.marketTime)}</div>
                                </div>
                                <div className="text-lg font-black leading-tight tracking-tight">
                                    {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className={`text-[11px] font-bold flex items-center mt-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {isUp ? <FaArrowUp className="mr-0.5" /> : <FaArrowDown className="mr-0.5" />}
                                    {Math.abs(item.change).toFixed(2)} ({item.changePercent.toFixed(2)}%)
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* News Sections (2 columns) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden pt-2">
                {/* Column 1: Top News */}
                <div className="flex flex-col min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <FaRegNewspaper className="text-violet-500 text-2xl" />
                            <h2 className="text-xl font-bold">Top News</h2>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {formatTime(data.news.top?.lastUpdated)}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {filteredTopNews.map((news) => (
                            <div key={news.id} className="group relative p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white/10 dark:bg-slate-800/10">
                                <a
                                    href={news.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => markAsRead(news.id)}
                                    className="block pr-6"
                                >
                                    <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase-first-letter">
                                        {news.title}
                                    </h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(news.pubDate).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </a>
                                <button
                                    onClick={(e) => dismissArticle(e, news.id)}
                                    className="absolute top-3 right-3 p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                                    title="この記事を非表示"
                                >
                                    <FaTrashAlt className="text-[10px]" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: RSS Feed */}
                <div className="flex flex-col min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <FaChartLine className="text-emerald-500 text-2xl" />
                            <h2 className="text-xl font-bold">RSS Feed</h2>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {formatTime(data.news.rss?.lastUpdated)}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {filteredRssNews.map((news) => (
                            <div key={news.id} className="group relative p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white/10 dark:bg-slate-800/10">
                                <a
                                    href={news.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => markAsRead(news.id)}
                                    className="block pr-6"
                                >
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 uppercase tracking-tighter">
                                            {news.source}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {news.title}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(news.pubDate).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </a>
                                <button
                                    onClick={(e) => dismissArticle(e, news.id)}
                                    className="absolute top-3 right-3 p-1 rounded-md text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:!text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                                    title="この記事を非表示"
                                >
                                    <FaTrashAlt className="text-[10px]" />
                                </button>
                            </div>
                        ))}
                        {filteredRssNews.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                <p className="text-xs">No RSS items found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
