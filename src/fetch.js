
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

export async function fetchRates(baseCurrency) {
    const url=`https://api.exchangeratesapi.io/latest?base=${baseCurrency}`;
    if (url) {
        console.debug('Fetch ', url);
        let response = await fetch(url, {method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            if (data && data.rates) {
                return data.rates;
            }
        }
        throw new Error(`Error fetching ${url} > ${response.status}`);
    }
} 
