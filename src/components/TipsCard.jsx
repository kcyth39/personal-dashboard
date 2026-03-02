import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

export default function TipsCard() {
    const [tips, setTips] = useState([]);

    useEffect(() => {
        fetch('/data/gemini-insights.json')
            .then(res => res.json())
            .then(data => {
                setTips(data || []);
            })
            .catch(err => console.error('Failed to load insights:', err));
    }, []);

    // 1分ごとに現在時刻ベースでインデックスを再計算させるためのタイマー
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const currentIndex = tips.length > 0 ? Math.floor(Date.now() / (1000 * 60 * 60)) % tips.length : 0;

    const currentData = tips.length > 0 ? tips[currentIndex] : null;

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-purple-100/50 dark:border-purple-800/30">
            <div className="flex items-center space-x-3 mb-4">
                <FaStar className="text-purple-500 text-2xl animate-pulse" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">Hourly Insight</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center p-6 bg-white/50 dark:bg-black/20 rounded-xl text-gray-800 dark:text-gray-200 shadow-inner">
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
