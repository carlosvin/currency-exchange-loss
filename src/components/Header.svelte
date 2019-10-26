<script>
	export let title;
</script>

<style>
	header {
		display: flex;
        flex-grow: 1;
        flex-direction: row;
        background-color: darkmagenta;
        color: ghostwhite;
        position: sticky;
    }
    
    h1 {
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>

<header>
    <h1>{title}</h1>
</header>