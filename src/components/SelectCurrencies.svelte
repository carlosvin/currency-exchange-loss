<script>
    import Select from "svelte-select";

    export let currencies;
    export let name;
    export let selected = undefined;
</script>

<style>
  .themed {
    --borderRadius: 0.2rem;
    --height: 1.8rem;
  }
</style>

<div class='themed'>
    <Select inputAttributes={{name}} items={currencies} bind:selectedValue={selected} isClearable={false} />
</div>
