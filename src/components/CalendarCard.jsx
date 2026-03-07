import React from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';

export default function CalendarCard() {
    const today = new Date();

    const [tasks, setTasks] = React.useState([]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/data/kanban-data.json?t=${Date.now()}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            // "today" カラムのタスクIDを取得し、タスクの実体リストを作る
            if (data.columns && data.columns.today && data.columns.today.taskIds && data.tasks) {
                const todayTaskIds = data.columns.today.taskIds;
                const todayTasks = todayTaskIds.map(id => data.tasks[id]).filter(Boolean);
                setTasks(todayTasks);
            }
        } catch (err) {
            console.error('Failed to load kanban tasks:', err);
        }
    };

    React.useEffect(() => {
        fetchTasks();
        window.addEventListener('refreshData', fetchTasks);
        return () => window.removeEventListener('refreshData', fetchTasks);
    }, []);

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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tasks.length > 0 ? (
                    <ul className="space-y-2">
                        {tasks.map((task) => (
                            <li key={task.id} className="group">
                                <a
                                    href="http://localhost:5174"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 rounded-xl bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500/50"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {task.content}
                                        </span>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white/20 dark:bg-black/20 pb-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
