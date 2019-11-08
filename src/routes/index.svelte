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
	}
	.calculatedTable {
		display: flex;
		justify-content: center;
	}
	label {
		margin: 2%;
		font-size: 0.7rem;
		display: flex;
		flex-direction: column;
	}
	footer {
		position: fixed;
		width: 100%;
		bottom: 2%;
		display: flex;
		flex-flow: wrap;
		justify-items: center;
		justify-content: space-around;
		font-size: smaller;
	}
</style>

<Header title="Currency loss"/>
<main class="main">
	<form>
		<label>From
			<SelectCurrencies {currencies} bind:selected={selectedFrom} name="from"/>
		</label>
		<label>To
			<SelectCurrencies {currencies} bind:selected={selectedTo} name="to"/>
		</label>
		<label>Rate offered
			<input name="rate-offered" type="number" min="0" bind:value={rateOffered} placeholder="Rate offered" />
		</label>
		<label>Amount to change
			<input name="amount-to-change" type="number" min="0" bind:value={amountToChange} placeholder="Amount to change"/>
		</label>
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
<footer>
	<a href="https://github.com/carlosvin/currency-exchange-loss/issues">Send feedback</a>
	<a href="https://github.com/carlosvin/currency-exchange-loss">Source at Github</a>
</footer>