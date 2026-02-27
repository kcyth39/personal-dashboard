import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function test() {
    try {
        const quote = await yahooFinance.quote('^N225');
        console.log(JSON.stringify(quote, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
