<script>
    export let important = false;
    export let description;
    export let number;
</script>

<style>
.description {
    text-align: left;
}
.number {
    text-align: right;
}
td {
    padding: 0.2rem;
}

.important {
    background-color: darkmagenta;
    color: whitesmoke;
    font-weight: bolder;
}
</style>

<tr class={important && 'important'}>
    <td class="description">{description}</td>
    <td class="number">{number}</td>
</tr>
