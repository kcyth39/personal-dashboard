import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');
const DATA_PATH = path.join(DATA_DIR, 'dashboard-data.json');
const parser = new Parser();

// ニュース取得関数
async function fetchNews() {
    console.log('Fetching Google News...');
    try {
        const feed = await parser.parseURL('https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja');
        return {
            items: feed.items.slice(0, 10).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate
            })),
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return null;
    }
}

// マーケットデータ取得関数
async function fetchMarket() {
    console.log('Fetching Market Data...');
    const symbols = {
        nikkei: '^N225',
        sp500: '^GSPC',
        gold: 'GC=F',
        usdjpy: 'USDJPY=X'
    };

    const results = {};
    const now = new Date().toISOString();

    for (const [key, symbol] of Object.entries(symbols)) {
        try {
            const quote = await yahooFinance.quote(symbol);
            results[key] = {
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
                currency: quote.currency,
                symbol: quote.symbol,
                name: quote.shortName || symbol
            };
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error.message);
        }
    }

    return {
        data: results,
        lastUpdated: now
    };
}

// データ保存関数
async function updateData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let existingData = {
        news: { items: [], lastUpdated: null },
        market: { data: {}, lastUpdated: null }
    };

    if (fs.existsSync(DATA_PATH)) {
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        } catch (e) {
            console.error('Error reading existing data, starting fresh.');
        }
    }

    const now = new Date();

    // マーケットデータは毎回更新（5分間隔想定）
    const market = await fetchMarket();
    if (Object.keys(market.data).length > 0) {
        existingData.market = market;
    }

    // ニュースは30分間隔で更新
    const lastNewsUpdate = existingData.news.lastUpdated ? new Date(existingData.news.lastUpdated) : new Date(0);
    if (now - lastNewsUpdate >= 30 * 60 * 1000) {
        const news = await fetchNews();
        if (news) {
            existingData.news = news;
        }
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(existingData, null, 2));
    console.log(`[${now.toLocaleTimeString()}] Dashboard data updated.`);
}

// 初回実行
updateData();

// 定期実行（5分ごと）
// マーケットは毎回更新され、ニュースはスクリプト内部のロジックで30分ごとに更新される
setInterval(updateData, 5 * 60 * 1000);
