import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import nodeFetch from 'node-fetch';

// タイムアウト付きPromiseラッパー
function withTimeout(promise, ms, label = 'operation') {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        )
    ]);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');
const DATA_PATH = path.join(DATA_DIR, 'dashboard-data.json');
const CONFIG_PATH = path.join(DATA_DIR, 'dashboard-config.json');
const parser = new Parser();

// 天気取得関数 (Open-Meteo) — node-fetchを使用
async function fetchWeather(lat, lon) {
    console.log(`Fetching Weather for ${lat}, ${lon}...`);
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;
        const response = await nodeFetch(url);
        const data = await response.json();

        return {
            current: {
                temp: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                weatherCode: data.current.weather_code,
            },
            daily: {
                today: {
                    tempMax: data.daily.temperature_2m_max[0],
                    tempMin: data.daily.temperature_2m_min[0],
                    weatherCode: data.daily.weather_code[0],
                },
                tomorrow: {
                    tempMax: data.daily.temperature_2m_max[1],
                    tempMin: data.daily.temperature_2m_min[1],
                    weatherCode: data.daily.weather_code[1],
                }
            },
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching weather:', error.message);
        return null;
    }
}

// ニュース取得関数
async function fetchNews(rssFeeds = []) {
    console.log('Fetching Google News and RSS feeds...');
    const topNewsUrl = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';

    try {
        // Top News (Google News)
        const topFeed = await parser.parseURL(topNewsUrl);
        const topItems = topFeed.items.slice(0, 10).map(item => ({
            id: crypto.createHash('sha256').update(item.link).digest('hex').substring(0, 12),
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: 'Google News'
        }));

        // RSS feeds from config
        let rssItems = [];
        for (const feedConfig of rssFeeds) {
            try {
                console.log(`  - Fetching RSS: ${feedConfig.name}...`);
                const feed = await parser.parseURL(feedConfig.url);
                console.log(`    * Found ${feed.items.length} items`);
                const items = feed.items.slice(0, 30).map(item => ({
                    id: crypto.createHash('sha256').update(item.link).digest('hex').substring(0, 12),
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate || item.isoDate || item.date || new Date().toISOString(),
                    source: feedConfig.name
                }));
                rssItems = [...rssItems, ...items];
            } catch (err) {
                console.error(`  - Error fetching ${feedConfig.name}:`, err.message);
            }
        }

        // 日付順にソート (RSS全体)
        rssItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        return {
            top: {
                items: topItems,
                lastUpdated: new Date().toISOString()
            },
            rss: {
                items: rssItems.slice(0, 100),
                lastUpdated: new Date().toISOString()
            },
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return null;
    }
}

// マーケットデータ取得関数 — Yahoo Finance v8 API を直接叩く（node-fetch使用）
async function fetchMarket() {
    console.log('Fetching Market Data...');
    const symbols = {
        nikkei: '^N225',
        sp500: '^GSPC',
        gold: 'GC=F',
        usdjpy: 'USDJPY=X'
    };

    const nameMap = {
        nikkei: 'Nikkei 225',
        sp500: 'S&P 500',
        gold: 'Gold',
        usdjpy: 'USD/JPY'
    };

    const results = {};
    const now = new Date().toISOString();

    for (const [key, symbol] of Object.entries(symbols)) {
        try {
            const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
            const response = await withTimeout(
                nodeFetch(quoteUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                    }
                }),
                10000,
                `fetch ${symbol}`
            );
            const data = await response.json();

            if (data.chart?.result?.[0]) {
                const meta = data.chart.result[0].meta;
                const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
                const price = meta.regularMarketPrice;
                const change = price - prevClose;
                const changePercent = prevClose ? (change / prevClose) * 100 : 0;

                results[key] = {
                    price: price,
                    change: change,
                    changePercent: changePercent,
                    currency: meta.currency,
                    symbol: meta.symbol,
                    name: nameMap[key] || symbol,
                    marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : now
                };
                console.log(`  ✅ ${symbol}: ${price}`);
            } else {
                console.error(`  ❌ ${symbol}: No data in response`, JSON.stringify(data).substring(0, 200));
            }
        } catch (error) {
            console.error(`  ❌ Error fetching ${symbol}:`, error.message);
        }
    }

    return {
        data: results,
        lastUpdated: now
    };
}

// データ保存関数
async function updateData() {
    try {
        await withTimeout(_updateDataInner(), 60000, 'updateData');
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Update cycle failed:`, error.message);
    }
}

async function _updateDataInner() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 設定ファイルの読み込み
    let location = { lat: 35.6895, lon: 139.6917 };
    let rssFeeds = [];
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
            if (config.location) location = config.location;
            if (config.rssFeeds) rssFeeds = config.rssFeeds;
        } catch (e) {
            console.error('Error reading config:', e.message);
        }
    }

    let existingData = {
        news: { items: [], lastUpdated: null },
        market: { data: {}, lastUpdated: null },
        weather: { current: {}, daily: {}, lastUpdated: null }
    };

    if (fs.existsSync(DATA_PATH)) {
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        } catch {
            console.error('Error reading existing data, starting fresh.');
        }
    }

    const now = new Date();

    // マーケットデータは毎回更新（5分間隔想定）
    const market = await fetchMarket();
    if (Object.keys(market.data).length > 0) {
        existingData.market = market;
    }

    // ニュースと天気は30分間隔で更新
    const lastNewsUpdate = existingData.news.lastUpdated ? new Date(existingData.news.lastUpdated) : new Date(0);
    const lastWeatherUpdate = existingData.weather.lastUpdated ? new Date(existingData.weather.lastUpdated) : new Date(0);

    // 天気の更新 (新構造がない場合は強制)
    const hasNextData = existingData.weather.daily && existingData.weather.daily.tomorrow;
    if (now - lastWeatherUpdate >= 30 * 60 * 1000 || !hasNextData) {
        const weather = await fetchWeather(location.lat, location.lon);
        if (weather) {
            existingData.weather = weather;
        }
    }

    // ニュースの更新 (ID欠落を防ぐため、top構造がないか30分経過で更新)
    if (now - lastNewsUpdate >= 30 * 60 * 1000 || !existingData.news.top || !existingData.news.top.items[0]?.id) {
        const news = await fetchNews(rssFeeds);
        if (news) {
            existingData.news = news;
        }
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(existingData, null, 2));
    console.log(`[${now.toLocaleTimeString()}] Dashboard data updated (including weather).`);
}

// 初回実行
updateData();

// 定期実行（5分ごと）
// マーケットは毎回更新され、ニュースはスクリプト内部のロジックで30分ごとに更新される
setInterval(updateData, 5 * 60 * 1000);
