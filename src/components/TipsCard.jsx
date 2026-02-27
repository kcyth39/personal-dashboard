import React from 'react';
import { FaLightbulb } from 'react-icons/fa';

export default function TipsCard() {
    const [tips, setTips] = React.useState([]);

    React.useEffect(() => {
        fetch('/data/dashboard-config.json')
            .then(res => res.json())
            .then(data => setTips(data.tips || []))
            .catch(err => console.error('Failed to load tips:', err));
    }, []);

    // Choose a random tip for the day
    const dailyTip = tips.length > 0 ? tips[new Date().getDate() % tips.length] : "Loading tips...";

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="flex items-center space-x-3 mb-4">
                <FaLightbulb className="text-yellow-500 text-2xl" />
                <h2 className="text-xl font-bold">Daily Tip</h2>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-white/40 dark:bg-black/20 rounded-xl italic text-gray-700 dark:text-gray-300">
                <p>"{dailyTip}"</p>
            </div>
        </div>
    );
}
