import React from 'react';
import NewsCard from './components/NewsCard';
import CalendarCard from './components/CalendarCard';
import LinksCard from './components/LinksCard';
import TipsCard from './components/TipsCard';

function App() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 mb-2">
          Good Morning, Shige!
        </h1>
        <p className="text-2xl font-light text-gray-500 dark:text-gray-400">
          It's {timeString} — Let's make it a great day.
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">

        {/* News Section (Large) */}
        <div className="md:col-span-8 md:row-span-2 min-h-[400px]">
          <NewsCard />
        </div>

        {/* Calendar Section */}
        <div className="md:col-span-4 min-h-[250px]">
          <CalendarCard />
        </div>

        {/* Links Section */}
        <div className="md:col-span-4 min-h-[200px]">
          <LinksCard />
        </div>

        {/* Tips Section (Full width on smaller, takes remaining space on large) */}
        <div className="md:col-span-12 min-h-[150px] mt-4">
          <TipsCard />
        </div>

      </div>
    </div>
  );
}

export default App;
