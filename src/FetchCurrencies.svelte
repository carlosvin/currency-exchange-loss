<script>
    import Fetch from "./Fetch.svelte";

    export let currencies;

    function handleData (data) {
        if (data && data.detail.symbols) {
            currencies = data.detail.symbols;
        }
    }
</script>

<Fetch 
    params={{access_key: 'e17dca7d1c71d7f2b48eceb15311b604'}}
    baseUrl='http://data.fixer.io/api/symbols' 
    on:data={handleData}>
    
    <slot {currencies}/>

</Fetch>
