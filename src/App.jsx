import React from 'react';
import NewsCard from './components/NewsCard';
import CalendarCard from './components/CalendarCard';
import LinksCard from './components/LinksCard';
import TipsCard from './components/TipsCard';
import WeatherCard from './components/WeatherCard';

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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Left Column: News & Market */}
        <div className="md:col-span-8 h-full">
          <NewsCard />
        </div>

        {/* Right Column: Weather, Calendar, Links */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <WeatherCard />
          <CalendarCard />
          <LinksCard />
        </div>

        {/* Tips Section (Bottom) */}
        <div className="md:col-span-12 mt-4">
          <TipsCard />
        </div>

      </div>
    </div>
  );
}

export default App;
