import React from 'react';
import { FaRegNewspaper, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function NewsCard() {
    const [data, setData] = React.useState(null);

    const fetchData = () => {
        fetch('/data/dashboard-data.json')
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error('Failed to load news/market data:', err));
    };

    React.useEffect(() => {
        fetchData();
        // 5分おきにデータの有無をチェック（スクリプト側で更新されているものを拾う）
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

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full overflow-hidden">
            {/* Market Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <FaChartLine className="text-blue-500 text-2xl" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Market</h2>
                        <div className="hidden sm:flex items-center space-x-2 ml-4">
                            <a href="https://www.nikkei.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline font-bold">日経</a>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <a href="https://shikiho.toyokeizai.net/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline font-bold">四季報</a>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <a href="https://www.sbisec.co.jp/ETGate/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline font-bold">SBI</a>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-white/50 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                        {formatTime(data.market.lastUpdated)} 更新
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(data.market.data).map(([key, item]) => {
                        const isUp = item.change >= 0;
                        return (
                            <div key={key} className="bg-white/30 dark:bg-slate-800/30 p-3 rounded-xl border border-white/20 dark:border-gray-700 shadow-sm">
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">{item.name}</div>
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

            {/* News Section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <FaRegNewspaper className="text-violet-500 text-2xl" />
                        <h2 className="text-xl font-bold">Top News</h2>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {formatTime(data.news.lastUpdated)} 更新
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {data.news.items.map((news, idx) => (
                        <a
                            key={idx}
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                            <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{news.title}</h3>
                            <span className="text-[10px] text-gray-400 mt-1.5 block">
                                {new Date(news.pubDate).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
