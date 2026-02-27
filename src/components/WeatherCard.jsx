import React from 'react';
import { WiDaySunny, WiCloud, WiCloudy, WiFog, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function WeatherCard() {
    const [data, setData] = React.useState(null);
    const [locationName, setLocationName] = React.useState('Loading...');

    const fetchData = () => {
        // configから場所名を取得
        fetch('/data/dashboard-config.json')
            .then(res => res.json())
            .then(config => setLocationName(config.location?.name || '東京'))
            .catch(() => { });

        // 実際の天気データを取得
        fetch('/data/dashboard-data.json')
            .then(res => res.json())
            .then(json => setData(json.weather))
            .catch(err => console.error('Failed to load weather data:', err));
    };

    React.useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    // WMO Weather Codes to Icons/Colors mapping
    const getWeatherInfo = (code) => {
        if (code === 0) return { icon: <WiDaySunny className="text-amber-400" />, label: '快晴', color: 'from-orange-400/20 to-amber-400/20' };
        if ([1, 2, 3].includes(code)) return { icon: <WiCloudy className="text-gray-400" />, label: '晴れ / 曇り', color: 'from-blue-400/10 to-gray-400/10' };
        if ([45, 48].includes(code)) return { icon: <WiFog className="text-slate-300" />, label: '霧', color: 'from-slate-400/10 to-slate-200/10' };
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: <WiRain className="text-blue-500" />, label: '雨', color: 'from-blue-600/20 to-blue-400/20' };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <WiSnow className="text-sky-200" />, label: '雪', color: 'from-sky-300/20 to-white/20' };
        if ([95, 96, 99].includes(code)) return { icon: <WiThunderstorm className="text-purple-500" />, label: '雷雨', color: 'from-purple-600/20 to-indigo-600/20' };
        return { icon: <WiCloud className="text-gray-400" />, label: '不明', color: 'from-gray-400/10 to-gray-300/10' };
    };

    if (!data || !data.current) {
        return (
            <div className="glass-panel p-6 rounded-2xl flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm animate-pulse">Loading weather...</p>
            </div>
        );
    }

    const weather = getWeatherInfo(data.current.weatherCode);

    return (
        <div className={`glass-panel p-4 rounded-xl flex flex-col overflow-hidden bg-gradient-to-br ${weather.color}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    {locationName}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">
                    {new Date(data.lastUpdated).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="text-4xl">
                        {weather.icon}
                    </div>
                    <div>
                        <div className="text-3xl font-black tracking-tighter leading-none">
                            {Math.round(data.current.temp)}°
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                            {weather.label}
                        </div>
                    </div>
                </div>

                <div className="text-right flex items-center space-x-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center justify-end text-rose-500 font-black text-xs leading-none">
                            <FaArrowUp className="text-[8px] mr-1" />
                            {Math.round(data.daily.tempMax)}°
                        </div>
                        <div className="flex items-center justify-end text-blue-500 font-black text-xs leading-none">
                            <FaArrowDown className="text-[8px] mr-1" />
                            {Math.round(data.daily.tempMin)}°
                        </div>
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold border-l border-gray-300 dark:border-gray-700 pl-3">
                        湿度<br />{data.current.humidity}%
                    </div>
                </div>
            </div>
        </div>
    );
}
