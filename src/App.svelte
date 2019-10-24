<script>
	import Header from './Header.svelte';
	import FetchRates from './FetchRates.svelte';
	import FetchCurrencies from './FetchCurrencies.svelte';
	import SelectCurrencies from './SelectCurrencies.svelte';
	export let name;
	let selectedFrom;
	let selectedTo;
	let amountToChange;
	let rateOffered;
</script>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		clear: both;
	}

	.main {
		margin: 1rem;
	}
</style>

<Header title="Currency loss"/>
<main class="main">
<FetchCurrencies let:currencies>
	{#if currencies}
		<SelectCurrencies {currencies} bind:selected={selectedFrom}/>
		<SelectCurrencies {currencies} bind:selected={selectedTo}/>
		<input type="number" min="0" placeholder="Rate offered" bind:value={rateOffered}/>
		{#if selectedFrom && selectedFrom !== selectedTo}
			<FetchRates baseCurrency={selectedFrom} targetCurrencies={Object.keys(currencies)}
				let:rates>
				<input type="number" bind:value={amountToChange} placeholder="Amount to change" min="0"/>
				{#if amountToChange}
				<p>Expected amount: {rates[selectedTo] * amountToChange} {selectedTo}</p>
					{#if rateOffered}
						<p>What you get: {rateOffered * amountToChange} {selectedTo}</p>
						<p>You are lossing {(rates[selectedTo] - rateOffered) * amountToChange} {selectedTo}
						= {((rates[selectedTo] - rateOffered) * amountToChange)/ rates[selectedTo]} {selectedFrom}
						</p>

					{/if}
				{/if}
				<p>Current rate: {rates[selectedTo]}</p>
			</FetchRates>
		{/if}

	{/if}
	
</FetchCurrencies>
</main>
