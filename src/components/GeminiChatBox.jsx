import React, { useState } from 'react';
import { FaMagic, FaPaperPlane, FaCheck } from 'react-icons/fa';

export default function GeminiChatBox() {
    const [prompt, setPrompt] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        try {
            // クリップボードにコピー
            await navigator.clipboard.writeText(prompt);
            setIsCopied(true);

            // Geminiを開く
            window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');

            // 入力欄をクリアし、コピー完了状態を元に戻す
            setTimeout(() => {
                setPrompt('');
                setIsCopied(false);
            }, 3000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            // コピーに失敗しても一応開く
            window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3 mb-4">
                <FaMagic className="text-blue-500 text-xl animate-pulse" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Ask Gemini</h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-100 dark:border-slate-700 ml-auto flex items-center">
                    <span className="mr-1">💡</span>
                    送信時にコピーされます。Geminiの画面で「貼り付け」してください。
                </div>
            </div>
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Geminiに何でも聞いてください..."
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-4 pr-12 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-inner"
                />
                <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${!prompt.trim()
                        ? 'text-gray-400 cursor-not-allowed'
                        : isCopied
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95'
                        }`}
                    title="コピーしてGeminiを開く"
                >
                    {isCopied ? <FaCheck /> : <FaPaperPlane />}
                </button>
            </form>
        </div>
    );
}
