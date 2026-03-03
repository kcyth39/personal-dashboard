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
            <div className="glass-panel p-5 md:p-6 rounded-2xl flex flex-col h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-orange-100/50 dark:border-orange-800/30">
                <div className="flex items-center space-x-3 mb-4">
                    <FaSun className="text-orange-500 text-2xl" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600">6-Minute Diary</h2>
                </div>
                <div className="flex-1 flex flex-col justify-center p-5 md:p-6 bg-white/50 dark:bg-black/20 rounded-xl text-gray-800 dark:text-gray-200 shadow-inner">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-bold tracking-wider">MORNING (朝の3項目)</p>
                    <ul className="space-y-4 font-medium text-sm md:text-base">
                        <li className="flex items-start gap-3">
                            <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">1</span>
                            <span>私がいま感謝しているのは・・・</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">2</span>
                            <span>今日を素晴らしい１日にするために、何をする？</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">3</span>
                            <span>肯定的なアファメーション</span>
                        </li>
                    </ul>
                    <button
                        onClick={handleDismiss}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm font-medium transition-colors"
                    >
                        <FaCheck className="text-xs" /> Done!
                    </button>
                </div>
            </div>
        );
    }

    if (isEvening && !isDismissed) {
        return (
            <div className="glass-panel p-5 md:p-6 rounded-2xl flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100/50 dark:border-blue-800/30">
                <div className="flex items-center space-x-3 mb-4">
                    <FaMoon className="text-blue-500 text-2xl" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">6-Minute Diary</h2>
                </div>
                <div className="flex-1 flex flex-col justify-center p-5 md:p-6 bg-white/50 dark:bg-black/20 rounded-xl text-gray-800 dark:text-gray-200 shadow-inner">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-bold tracking-wider">EVENING (夜の3項目)</p>
                    <ul className="space-y-4 font-medium text-sm md:text-base">
                        <li className="flex items-start gap-3">
                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">1</span>
                            <span>今日は誰にどんな良いことをしてあげた？</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">2</span>
                            <span>明日を良い日にするために、何をする？</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">3</span>
                            <span>今日のうれしかった出来事は・・・</span>
                        </li>
                    </ul>
                    <button
                        onClick={handleDismiss}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium transition-colors"
                    >
                        <FaCheck className="text-xs" /> Done!
                    </button>
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
