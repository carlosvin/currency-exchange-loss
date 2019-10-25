<script>
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
</style>

<tr>
    <td class="description">{description}</td>
    <td class="number">{number}</td>
</tr>
