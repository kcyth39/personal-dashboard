import React from 'react';
import { WiDaySunny, WiCloud, WiCloudy, WiFog, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';
import { FaArrowUp, FaArrowDown, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

export default function CustomWeatherCard() {
    const [query, setQuery] = React.useState('');
    const [location, setLocation] = React.useState(() => {
        const saved = localStorage.getItem('custom_location');
        return saved ? JSON.parse(saved) : { name: '札幌', lat: 43.0611, lon: 141.3564 };
    });
    const [weatherData, setWeatherData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const fetchWeather = async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;
            const response = await fetch(url);
            const data = await response.json();
            setWeatherData(data);
        } catch (err) {
            setError('天気情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ja&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (geoData.results && geoData.results.length > 0) {
                const result = geoData.results[0];
                const newLocation = {
                    name: result.name,
                    lat: result.latitude,
                    lon: result.longitude,
                    admin1: result.admin1 // 都道府県など
                };
                setLocation(newLocation);
                localStorage.setItem('custom_location', JSON.stringify(newLocation));
                fetchWeather(result.latitude, result.longitude);
                setQuery('');
            } else {
                setError('場所が見つかりませんでした');
            }
        } catch (err) {
            setError('検索中にエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchWeather(location.lat, location.lon);

        const handleRefresh = () => {
            fetchWeather(location.lat, location.lon);
        };
        window.addEventListener('refreshData', handleRefresh);
        return () => window.removeEventListener('refreshData', handleRefresh);
    }, [location.lat, location.lon]);

    const getWeatherInfo = (code) => {
        if (code === 0) return { icon: <WiDaySunny className="text-amber-400" />, label: '快晴', color: 'from-orange-400/20 to-amber-400/20' };
        if ([1, 2, 3].includes(code)) return { icon: <WiCloudy className="text-gray-400" />, label: '晴れ / 曇り', color: 'from-blue-400/10 to-gray-400/10' };
        if ([45, 48].includes(code)) return { icon: <WiFog className="text-slate-300" />, label: '霧', color: 'from-slate-400/10 to-slate-200/10' };
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: <WiRain className="text-blue-500" />, label: '雨', color: 'from-blue-600/20 to-blue-400/20' };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <WiSnow className="text-sky-200" />, label: '雪', color: 'from-sky-300/20 to-white/20' };
        if ([95, 96, 99].includes(code)) return { icon: <WiThunderstorm className="text-purple-500" />, label: '雷雨', color: 'from-purple-600/20 to-indigo-600/20' };
        return { icon: <WiCloud className="text-gray-400" />, label: '不明', color: 'from-gray-400/10 to-gray-300/10' };
    };

    const weather = weatherData ? getWeatherInfo(weatherData.current.weather_code) : null;

    return (
        <div className={`glass-panel p-4 rounded-xl flex flex-col overflow-hidden transition-all duration-500 ${weather ? `bg-gradient-to-br ${weather.color}` : 'bg-white/10'}`}>
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative mb-3 group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="場所を検索..."
                    className="w-full bg-white/20 dark:bg-black/20 border border-white/30 dark:border-gray-700 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all placeholder:text-gray-500"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
                {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </form>

            {!weatherData ? (
                <div className="flex items-center justify-center py-4">
                    <p className="text-gray-500 text-[10px] animate-pulse">Loading Custom Weather...</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center">
                            <FaMapMarkerAlt className="text-rose-400 mr-1.5" />
                            {location.name} {location.admin1 && <span className="text-[9px] font-normal opacity-70 ml-1">({location.admin1})</span>}
                        </span>
                        {error && <span className="text-[9px] text-rose-500 font-bold">{error}</span>}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">
                                {weather.icon}
                            </div>
                            <div>
                                <div className="text-2xl font-black tracking-tighter leading-none">
                                    {Math.round(weatherData.current.temperature_2m)}°
                                </div>
                                <div className="text-[9px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                                    {weather.label} / 湿度 {weatherData.current.relative_humidity_2m}%
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center justify-end text-rose-500 font-black text-xs leading-none">
                                <FaArrowUp className="text-[8px] mr-1" />
                                {Math.round(weatherData.daily.temperature_2m_max[0])}°
                            </div>
                            <div className="flex items-center justify-end text-blue-500 font-black text-xs leading-none mt-1">
                                <FaArrowDown className="text-[8px] mr-1" />
                                {Math.round(weatherData.daily.temperature_2m_min[0])}°
                            </div>
                            <div className="text-[7px] text-gray-400 font-bold mt-1 uppercase">Today</div>
                        </div>
                    </div>

                    {/* Tomorrow Forecast */}
                    <div className="border-t border-white/20 dark:border-gray-700 pt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-bold bg-white/30 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">あす</span>
                            <div className="text-lg">
                                {getWeatherInfo(weatherData.daily.weather_code[1]).icon}
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                {getWeatherInfo(weatherData.daily.weather_code[1]).label}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center text-rose-500 font-black text-[10px]">
                                <FaArrowUp className="text-[7px] mr-1" />
                                {Math.round(weatherData.daily.temperature_2m_max[1])}°
                            </div>
                            <div className="flex items-center text-blue-500 font-black text-[10px]">
                                <FaArrowDown className="text-[7px] mr-1" />
                                {Math.round(weatherData.daily.temperature_2m_min[1])}°
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
