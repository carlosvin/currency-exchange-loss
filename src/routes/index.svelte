<script>
	import Header from '../components/Header.svelte';
	import { fetchRates } from '../fetch';
	import SelectCurrencies from '../components/SelectCurrencies.svelte';
	import LossCalculations from '../components/LossCalculations.svelte';
	import { Currencies } from 'currencies-map';

	let selectedFrom;
	let selectedTo;
	let amountToChange;
	let rateOffered;

	const currencies = [...Currencies.names.entries()].map(([value, label]) => ({value, label}));
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
		justify-items: stretch;
	}
	.calculatedTable {
		display: flex;
		justify-content: center;
	}
	label {
		min-width: 10rem;
		width: 40%;
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
	input {
		border: 1px solid #D8DBDF;
		border-radius: 0.2rem;
		height: 1.8rem;
		padding-left: 0.4rem;
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
	{#if selectedFrom && (selectedTo === undefined || selectedFrom.value !== selectedTo.value)}
		{@debug selectedFrom,  selectedTo}
		<div class='calculatedTable'>
			{#await fetchRates(selectedFrom.value)}
				<p>...fetching</p>
			{:then rates}
				{@debug rates}
				{#if selectedTo}
					<LossCalculations 
						rateExpected={rates[selectedTo.value]}
						rateOffered={rateOffered}
						amountToChange={amountToChange}
						targetCurrency={selectedTo.value}
						baseCurrency={selectedFrom.value} />
					{/if}
			{:catch error}
				<p style="color: red">{error.message}</p>
			{/await}
		</div>
	{/if}
</main>
<footer>
	<a href="https://github.com/carlosvin/currency-exchange-loss/issues">Send feedback</a>
	<a href="https://github.com/carlosvin/currency-exchange-loss">Source at Github</a>
</footer>