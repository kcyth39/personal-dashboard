import React, { useState, useEffect } from 'react';
import { FaStar, FaSun, FaMoon, FaCheck } from 'react-icons/fa';

export default function TipsCard() {
    const [tips, setTips] = useState([]);
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentIndex, setCurrentIndex] = useState(0);

    const [currentPeriod, setCurrentPeriod] = useState(() => {
        const hour = new Date().getHours();
        const morning = hour >= 4 && hour < 12;
        const evening = hour >= 22 || hour < 2;
        return morning ? 'morning' : evening ? 'evening' : 'other';
    });

    const [isDismissed, setIsDismissed] = useState(() => {
        const savedPeriod = localStorage.getItem('diaryCompletedPeriod');
        const savedDate = localStorage.getItem('diaryCompletedDate');

        // 現時刻における論理的な「今日」の日付文字列を生成する関数
        const getLogicalDateStr = () => {
            const now = new Date();
            // 0:00 - 1:59 の間は、前日の夜として扱うために日付を1日戻した文字列にする
            if (now.getHours() < 2) {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                return yesterday.toDateString();
            }
            return now.toDateString();
        };

        const hour = new Date().getHours();
        const period = (hour >= 4 && hour < 12) ? 'morning' : (hour >= 22 || hour < 2) ? 'evening' : 'other';

        return savedDate === getLogicalDateStr() && savedPeriod === period;
    });

    useEffect(() => {
        fetch('/data/gemini-insights.json')
            .then(res => res.json())
            .then(data => {
                setTips(data || []);
            })
            .catch(err => console.error('Failed to load insights:', err));
    }, []);

    useEffect(() => {
        if (tips.length === 0) return;

        const updateState = () => {
            const hour = new Date().getHours();
            setCurrentHour(hour);
            setCurrentIndex(Math.floor(Date.now() / (1000 * 60 * 60)) % tips.length);

            const morning = hour >= 4 && hour < 12;
            const evening = hour >= 22 || hour < 2;
            const newPeriod = morning ? 'morning' : evening ? 'evening' : 'other';

            setCurrentPeriod(prevPeriod => {
                if (prevPeriod !== newPeriod) {
                    setIsDismissed(false); // 期間が変わったらリセット
                }
                return newPeriod;
            });
        };

        updateState(); // Initialize

        const timer = setInterval(updateState, 60000);
        return () => clearInterval(timer);
    }, [tips]);

    const currentData = tips.length > 0 ? tips[currentIndex] : null;

    const isMorning = currentHour >= 4 && currentHour < 12;
    const isEvening = currentHour >= 22 || currentHour < 2;



    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('diaryCompletedPeriod', currentPeriod);

        const now = new Date();
        if (now.getHours() < 2) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            localStorage.setItem('diaryCompletedDate', yesterday.toDateString());
        } else {
            localStorage.setItem('diaryCompletedDate', now.toDateString());
        }
    };

    if (isMorning && !isDismissed) {
        return (
            <div className="relative p-5 md:p-6 flex flex-col h-full bg-[#fcfbfa] dark:bg-[#2b2a27] border border-[#e8e4db] dark:border-[#403e39] shadow-sm rounded-sm overflow-hidden font-serif">
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

                <div className="relative z-10 flex flex-col h-full text-[#4a4540] dark:text-[#d4cfc7]">
                    <div className="flex items-center justify-between mb-4 border-b border-[#e8e4db] dark:border-[#403e39] pb-2">
                        <div className="flex items-center space-x-2">
                            <FaSun className="text-[#a67c52] dark:text-[#c49a6c] text-xl" />
                            <h2 className="text-2xl font-bold font-['Caveat',_cursive] text-[#5c4f42] dark:text-[#bba995]">6-Minute Diary</h2>
                        </div>
                        <span className="text-xs tracking-widest text-[#8c8273] dark:text-[#8a8071] font-sans font-bold">MORNING</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-start pt-2">
                        <ul className="space-y-6 text-[15px] leading-relaxed">
                            <li className="flex items-start gap-3">
                                <span className="font-['Caveat',_cursive] text-2xl text-[#a67c52] dark:text-[#c49a6c] leading-none pt-0.5">1.</span>
                                <span className="flex-1 border-b border-dashed border-[#d1ccc0] dark:border-[#5a554f] pb-1">私がいま感謝しているのは・・・</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-['Caveat',_cursive] text-2xl text-[#a67c52] dark:text-[#c49a6c] leading-none pt-0.5">2.</span>
                                <span className="flex-1 border-b border-dashed border-[#d1ccc0] dark:border-[#5a554f] pb-1">今日を素晴らしい１日にするために、何をする？</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-['Caveat',_cursive] text-2xl text-[#a67c52] dark:text-[#c49a6c] leading-none pt-0.5">3.</span>
                                <span className="flex-1 border-b border-dashed border-[#d1ccc0] dark:border-[#5a554f] pb-1">肯定的なアファメーション</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end">
                        <button
                            onClick={handleDismiss}
                            className="group flex items-center justify-center gap-2 px-6 py-1.5 rounded-sm border-2 border-[#a67c52] dark:border-[#c49a6c] text-[#a67c52] dark:text-[#c49a6c] hover:bg-[#a67c52] hover:text-[#fcfbfa] dark:hover:bg-[#c49a6c] dark:hover:text-[#2b2a27] font-['Caveat',_cursive] text-2xl transition-all shadow-[2px_2px_0px_#d1ccc0] dark:shadow-[2px_2px_0px_#5a554f] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            Done! <FaCheck className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isEvening && !isDismissed) {
        return (
            <div className="relative p-5 md:p-6 flex flex-col h-full bg-[#fcfbfa] dark:bg-[#2b2a27] border border-[#e8e4db] dark:border-[#403e39] shadow-sm rounded-sm overflow-hidden font-serif">
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

                <div className="relative z-10 flex flex-col h-full text-[#4a4540] dark:text-[#d4cfc7]">
                    <div className="flex items-center justify-between mb-4 border-b border-[#e8e4db] dark:border-[#403e39] pb-2">
                        <div className="flex items-center space-x-2">
                            <FaMoon className="text-[#5b7a99] dark:text-[#8baecf] text-xl" />
                            <h2 className="text-2xl font-bold font-['Caveat',_cursive] text-[#42525c] dark:text-[#95a8bb]">6-Minute Diary</h2>
                        </div>
                        <span className="text-xs tracking-widest text-[#8c8273] dark:text-[#8a8071] font-sans font-bold">EVENING</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-start pt-2">
                        <ul className="space-y-6 text-[15px] leading-relaxed">
                            <li className="flex items-start gap-3">
                                <span className="font-['Caveat',_cursive] text-2xl text-[#5b7a99] dark:text-[#8baecf] leading-none pt-0.5">1.</span>
                                <span className="flex-1 border-b border-dashed border-[#d1ccc0] dark:border-[#5a554f] pb-1">今日は誰にどんな良いことをしてあげた？</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-['Caveat',_cursive] text-2xl text-[#5b7a99] dark:text-[#8baecf] leading-none pt-0.5">2.</span>
                                <span className="flex-1 border-b border-dashed border-[#d1ccc0] dark:border-[#5a554f] pb-1">明日を良い日にするために、何をする？</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-['Caveat',_cursive] text-2xl text-[#5b7a99] dark:text-[#8baecf] leading-none pt-0.5">3.</span>
                                <span className="flex-1 border-b border-dashed border-[#d1ccc0] dark:border-[#5a554f] pb-1">今日のうれしかった出来事は・・・</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end">
                        <button
                            onClick={handleDismiss}
                            className="group flex items-center justify-center gap-2 px-6 py-1.5 rounded-sm border-2 border-[#5b7a99] dark:border-[#8baecf] text-[#5b7a99] dark:text-[#8baecf] hover:bg-[#5b7a99] hover:text-[#fcfbfa] dark:hover:bg-[#8baecf] dark:hover:text-[#2b2a27] font-['Caveat',_cursive] text-2xl transition-all shadow-[2px_2px_0px_#d1ccc0] dark:shadow-[2px_2px_0px_#5a554f] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            Done! <FaCheck className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-5 md:p-6 rounded-2xl flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-purple-100/50 dark:border-purple-800/30">
            <div className="flex items-center space-x-3 mb-4">
                <FaStar className="text-purple-500 text-2xl animate-pulse" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">Hourly Insight</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center p-5 md:p-6 bg-white/50 dark:bg-black/20 rounded-xl text-gray-800 dark:text-gray-200 shadow-inner">
                {currentData ? (
                    <>
                        <p className="font-serif leading-relaxed text-base md:text-lg font-medium mb-3">"{currentData.quote}"</p>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-right italic">— {currentData.author}</p>
                    </>
                ) : (
                    <p className="font-serif leading-relaxed text-lg text-center">Loading insights...</p>
                )}
            </div>
        </div>
    );
}
