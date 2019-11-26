<script>
    export let selected = 'EUR';
    export let name;
    export let currencies;
</script>

<select name={name} bind:value={selected}>
    {#each currencies as [code, name]}
        <option value={code}>{name}</option>
    {/each}	
</select>