<script>
	import { Currencies, CODES } from 'currencies-map';

    export let selected = 'EUR';
    export let name;
</script>

<select name={name} bind:value={selected}>
    {#each CODES as code}
        <option value={code}>{Currencies.names.get(code)}</option>
    {/each}	
</select>