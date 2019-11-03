<script>
    export let currencies = [];
    export let selected = 'EUR';
    export let name;
</script>

{#if currencies}
    <select name={name} bind:value={selected}>
        {#each Object.entries(currencies) as [code, name]}
            <option value={code}>{name}</option>
        {/each}	
    </select>
{/if}
