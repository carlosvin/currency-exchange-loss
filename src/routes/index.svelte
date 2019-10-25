<script>
	import Header from '../components/Header.svelte';
	import FetchRates from '../components/FetchRates.svelte';
	import { currencies } from '../currencies';
	import SelectCurrencies from '../components/SelectCurrencies.svelte';
	import LossCalculations from '../components/LossCalculations.svelte';

	let selectedFrom;
	let selectedTo;
	let amountToChange;
	let rateOffered;
</script>

<style>
	.main, form {
		margin: 1rem;
		display: flex;
		flex-flow: wrap;
		justify-content: space-evenly;
	}

</style>

<Header title="Currency loss"/>
<main class="main">
	{#if currencies}
		<form>
			<SelectCurrencies {currencies} bind:selected={selectedFrom}/>
			<SelectCurrencies {currencies} bind:selected={selectedTo}/>
			<input type="number" min="0" placeholder="Rate offered" bind:value={rateOffered}/>
			<input type="number" bind:value={amountToChange} placeholder="Amount to change" min="0"/>
		</form>
	{/if}
	{#if selectedFrom && selectedFrom !== selectedTo}
		<FetchRates baseCurrency={selectedFrom} targetCurrencies={Object.keys(currencies)}
			let:rates>
			<LossCalculations 
				rateExpected={rates[selectedTo]}
				rateOffered={rateOffered}
				amountToChange={amountToChange}
				targetCurrency={selectedTo}
				baseCurrency={selectedFrom}
				/>
		</FetchRates>
	{/if}
</main>
