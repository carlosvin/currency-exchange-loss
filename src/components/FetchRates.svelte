<script>
    import Fetch from "./Fetch.svelte";
    import { readRates, writeRates } from '../ratesStorage';

    let rates = readRates();
    export let baseCurrency;
    export let targetCurrencies;

    function handleData (data) {
        if (data && data.detail.rates) {
            rates = data.detail.rates;
            writeRates(rates);
        }
    }
</script>

{#if baseCurrency && targetCurrencies}
    <Fetch 
        params={{ 
            base: baseCurrency, 
            target: Array.from(targetCurrencies).join(','),
            apikey: 'T0272d9a397f6cf710dd40c09df0626c'}}
        baseUrl='https://api.currencystack.io/currency' 
        on:data={handleData}>
        
        <slot rates={rates}/>

    </Fetch>
{/if}
