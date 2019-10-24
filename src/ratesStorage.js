
const KEY = 'rates';

export function readRates () {
    const savedRatesString = localStorage.getItem(KEY);
    return savedRatesString ? JSON.parse(savedRatesString) : {};
}

export function writeRates (rates) {
    localStorage.setItem(KEY, JSON.stringify(rates));
}
