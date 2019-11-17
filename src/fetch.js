import { writeRates } from './ratesStorage';

export function getUrl (baseUrl, params) {
    if (baseUrl) {
        const url = new URL(baseUrl);
        Object
            .keys(params)
            .forEach(
                key => url.searchParams.append(key, params[key]));
        return url.toString();
    }
    return undefined;
}

export async function fetchCall (baseUrl, params) {
    const url = getUrl(baseUrl, params);
    if (url) {
        console.debug('Fetch ', url);
        let response = await fetch(url, {method: 'GET' });
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Error fetching ${url} > ${response.status}`);
        }
    }
} 

export async function fetchRates(baseCurrency, targetCurrencies) {
    const params = { 
        base: baseCurrency, 
        target: targetCurrencies.join(','),
        apikey: 'T0272d9a397f6cf710dd40c09df0626c'
    };
    const baseUrl='https://api.currencystack.io/currency';
    const url = getUrl(baseUrl, params);
    if (url) {
        console.debug('Fetch ', url);
        let response = await fetch(url, {method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            if (data && data.rates) {
                const rates = data.rates;
                // TODO use service worker cache instead of manually writing
                writeRates(rates);
                return rates;
            }
        }
        throw new Error(`Error fetching ${url} > ${response.status}`);
    }
} 
