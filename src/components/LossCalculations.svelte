<script>
    import RowPair from './RowPair.svelte';

    export let rateExpected;
    export let rateOffered;
    export let amountToChange;
    export let targetCurrency;
    export let baseCurrency;

    $: amountLost = (rateExpected - rateOffered) * amountToChange;
</script>

<style>
table {
    border: 1px darkmagenta dashed;
}
</style>

<table>
    <RowPair description='Current rate' number={rateExpected.toFixed(3)}/>
   
    {#if amountToChange}
        <RowPair 
            description='Expected amount' 
            number={new Intl.NumberFormat(undefined, 
                    { style: 'currency', currency: targetCurrency })
                    .format(rateExpected * amountToChange)}/>

        {#if rateOffered}
            <RowPair 
                description='What you get' 
                number={new Intl.NumberFormat(undefined, 
                        { style: 'currency', currency: targetCurrency })
                        .format(rateOffered * amountToChange)}/>

            <RowPair 
                description='You are lossing' 
                number={new Intl.NumberFormat(undefined, 
                        { style: 'currency', currency: targetCurrency })
                        .format(amountLost)}/>
            
            <RowPair 
                important
                description='You are lossing' 
                number={new Intl.NumberFormat(undefined, 
                        { style: 'currency', currency: baseCurrency })
                        .format(amountLost/ rateExpected)}/>
        {/if}
    {/if}
</table>
