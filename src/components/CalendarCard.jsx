import React from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';

export default function CalendarCard() {
    const today = new Date();

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
                <FaRegCalendarAlt className="text-rose-500 text-2xl" />
                <h2 className="text-xl font-bold">Today</h2>
            </div>

            <div className="mb-4 text-center">
                <div className="text-3xl font-black text-rose-500 dark:text-rose-400">
                    {today.getDate()}
                </div>
                <div className="text-sm font-medium text-gray-500">
                    {today.toLocaleDateString('ja-JP', { weekday: 'long', month: 'long' })}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white/20 dark:bg-black/20">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No events scheduled.</p>
            </div>
        </div>
    );
}
