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
	.main {
		margin: 1rem;
		display: flex;
		flex-flow: column;
		justify-content: space-around;
	}
	form {
		margin: 1rem;
		display: flex;
		flex-flow: wrap;
		justify-content: space-evenly;
		justify-items: center;
	}
	.calculatedTable {
		display: flex;
		justify-content: center;
	}
</style>

<Header title="Currency loss"/>
<main class="main">
	<form>
		<SelectCurrencies {currencies} bind:selected={selectedFrom}/>
		<SelectCurrencies {currencies} bind:selected={selectedTo}/>
		<input type="number" min="0" bind:value={rateOffered} placeholder="Rate offered" />
		<input type="number" min="0" bind:value={amountToChange} placeholder="Amount to change"/>
	</form>
	{#if selectedFrom && selectedFrom !== selectedTo}
		<div class='calculatedTable'>
			<FetchRates baseCurrency={selectedFrom} targetCurrencies={Object.keys(currencies)} let:rates>
				<LossCalculations 
					rateExpected={rates[selectedTo]}
					rateOffered={rateOffered}
					amountToChange={amountToChange}
					targetCurrency={selectedTo}
					baseCurrency={selectedFrom} />
			</FetchRates>
		</div>
	{/if}
</main>
