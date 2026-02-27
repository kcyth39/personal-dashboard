import React from 'react';
import { FaRegNewspaper } from 'react-icons/fa';

export default function NewsCard() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
                <FaRegNewspaper className="text-accent text-2xl" />
                <h2 className="text-xl font-bold">News & Market</h2>
            </div>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white/20 dark:bg-black/20">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading news...</p>
            </div>
        </div>
    );
}
