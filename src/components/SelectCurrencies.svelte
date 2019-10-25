<script>
    export let currencies;
    export let selected = 'EUR';
</script>

{#if currencies}
    <select class='select' bind:value={selected}>
        {#each Object.entries(currencies) as [code, name]}
            <option value={code}>{name}</option>
        {/each}	
    </select>
{:else}
    <p>Loading...</p>
{/if}
