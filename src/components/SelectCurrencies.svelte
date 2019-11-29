<script>
    import Select from "svelte-select";

    export let currencies;
    export let name;
    export let selected = undefined;
</script>

<Select inputAttributes={{name}} items={currencies} bind:selectedValue={selected} />
