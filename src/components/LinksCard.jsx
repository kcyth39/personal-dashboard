import React from 'react';
import { FaLink } from 'react-icons/fa';

export default function LinksCard() {
    const [links, setLinks] = React.useState([]);

    React.useEffect(() => {
        fetch('/data/dashboard-config.json')
            .then(res => res.json())
            .then(data => setLinks(data.links || []))
            .catch(err => console.error('Failed to load links:', err));
    }, []);

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
                <FaLink className="text-green-500 text-2xl" />
                <h2 className="text-xl font-bold">Quick Links</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
                {links.length > 0 ? (
                    links.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-3 rounded-xl bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 transition-colors border border-gray-100 dark:border-gray-700"
                        >
                            <span>{link.icon}</span>
                            <span className="font-medium text-sm">{link.name}</span>
                        </a>
                    ))
                ) : (
                    <p className="col-span-2 text-center text-sm text-gray-400">Loading links...</p>
                )}
            </div>
        </div>
    );
}
