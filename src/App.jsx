import React from 'react';
import NewsCard from './components/NewsCard';
import CalendarCard from './components/CalendarCard';
import LinksCard from './components/LinksCard';
import TipsCard from './components/TipsCard';
import WeatherCard from './components/WeatherCard';
import CustomWeatherCard from './components/CustomWeatherCard';
import GeminiChatBox from './components/GeminiChatBox';
import SettingsModal from './components/SettingsModal';
import { FaCog } from 'react-icons/fa';

function App() {
  const [time, setTime] = React.useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

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
    // 5:00 - 9:00 は以前の「昼間の壁紙」であった afternoon.png を朝用に使用
    if (hour >= 5 && hour < 9) return 'url("/images/afternoon.png")';
    // 9:00 - 13:00 白樺の林
    if (hour >= 9 && hour < 13) return 'url("/images/bg-birch-forest.png")';
    // 13:00 - 17:00 山の景色
    if (hour >= 13 && hour < 17) return 'url("/images/bg-mountain-view.png")';
    // 17:00 - 22:00 夜
    if (hour >= 17 && hour < 22) return 'url("/images/night.png")';
    // 22:00 - 05:00 深夜
    return 'url("/images/midnight.png")';
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
        <header className="mb-6 flex justify-between items-start w-full">
          {/* Greeting aligned with News/Market (Left side) */}
          <div className="flex-1 pr-4">
            <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-md leading-tight mt-2">
              {getGreeting()}
            </h1>
          </div>

          {/* Clock and Settings grouped together (Right side) */}
          <div className="flex flex-col items-end gap-2 shrink-0 pt-2">
            <div className="text-white/90 drop-shadow-md text-right">
              <span className="text-2xl md:text-3xl font-mono font-bold tracking-tighter block leading-none">
                {timeString}
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-md hover:shadow-lg border border-white/20 group w-9 h-9 flex items-center justify-center"
              title="Settings"
            >
              <FaCog className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: News & Market */}
          <div className="md:col-span-8 h-full">
            <NewsCard />
          </div>

          {/* Right Column: Insights, Weather, Calendar, Links */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <TipsCard />
            <WeatherCard />
            <CustomWeatherCard />
            <CalendarCard />
            <LinksCard />
          </div>

          {/* Gemini Chat Section (Bottom) */}
          <div className="md:col-span-12 mt-6 flex flex-col gap-6">
            <GeminiChatBox />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
