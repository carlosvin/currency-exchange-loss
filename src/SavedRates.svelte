<script>
    import {readRates} from './ratesStorage';
    export const rates = readRates();
</script>

<slot {rates}/>
