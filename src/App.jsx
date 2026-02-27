import React from 'react';
import NewsCard from './components/NewsCard';
import CalendarCard from './components/CalendarCard';
import LinksCard from './components/LinksCard';
import TipsCard from './components/TipsCard';
import WeatherCard from './components/WeatherCard';
import CustomWeatherCard from './components/CustomWeatherCard';

function App() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();

  // Get Greeting based on time
  const getGreeting = () => {
    const greetings = {
      morning: [
        "おはようございます！今日も世界を驚かせる準備はできていますか？",
        "おはようございます。早起きは三文の徳と言いますが、このダッシュボードにはそれ以上の価値があります。",
        "朝のコーヒーとダッシュボード。これこそが成功者のモーニングルーチンです。"
      ],
      afternoon: [
        "こんにちは！午後のパフォーマンスを最大化する情報を揃えておきました。",
        "お疲れ様です。一息ついて、最新のマーケットを確認しましょう。",
        "こんにちは。効率的な午後のスタートを切るための準備は万端です。"
      ],
      evening: [
        "こんばんは。一日の成果を確認し、明日のための英気を養いましょう。",
        "こんばんは。夜の静かな時間は、深い思考とマーケット分析に最適です。",
        "お疲れ様でした。今日はどんな素晴らしいことがありましたか？"
      ],
      midnight: [
        "静かな夜ですね。明日の成功を夢見ながら、最後のチェックをしましょう。",
        "こんな時間までお疲れ様です。暗闇の中にこそ、未来の光が隠れています。",
        "おやすみなさい。あるいは、誰も見ていない間に一歩先へ進むのも悪くありません。"
      ]
    };

    let period = 'morning';
    if (hour >= 11 && hour < 17) period = 'afternoon';
    else if (hour >= 17 && hour < 22) period = 'evening';
    else if (hour >= 22 || hour < 5) period = 'midnight';

    // シンプルに1つ選ぶか、分/秒に基づいて固定的に選ぶ（リロードで変わる楽しみ）
    const pool = greetings[period];
    const index = time.getDay() % pool.length; // 曜日で変えるなどの工夫
    return pool[index];
  };

  // Get Background Image based on time
  const getBackgroundImage = () => {
    if (hour >= 5 && hour < 11) return 'url("/images/morning.png")';
    if (hour >= 11 && hour < 18) return 'url("/images/afternoon.png")';
    if (hour >= 18 || hour < 0) return 'url("/images/night.png")'; // 18-24
    return 'url("/images/midnight.png")'; // 0-5
  };

  const timeString = time.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="min-h-screen p-6 md:p-12 transition-all duration-1000 bg-cover bg-fixed bg-center"
      style={{ backgroundImage: getBackgroundImage() }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none backdrop-blur-[2px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-5xl font-black text-white drop-shadow-lg mb-4 leading-tight">
            {getGreeting()}
          </h1>
          <p className="text-2xl font-medium text-white/90 drop-shadow-md">
            現在、大阪は {timeString} です。良い一日を。
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
            <CustomWeatherCard />
            <CalendarCard />
            <LinksCard />
          </div>

          {/* Tips Section (Bottom) */}
          <div className="md:col-span-12 mt-4">
            <TipsCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
