<script>
    import { onMount, createEventDispatcher } from "svelte";

    export let baseUrl;
    export let params = {};
    let data;
    
	const dispatch = createEventDispatcher();

    function getUrl () {
        if (baseUrl) {
            const url = new URL(baseUrl);
            Object
                .keys(params)
                .forEach(
                    key => url.searchParams.append(key, params[key]));
            return url.toString();
        }
        return undefined;
    }

    onMount (async function () {
        const url = getUrl();
        if (url) {
            let response = await fetch(url, {method: 'GET' });
            if (response.ok) {
                data = await response.json();
                dispatch('data', data);
            } else {
                throw new Error(`Error fetching ${url} > ${response.status}`);
            }
        }
    });

</script>

<slot {data}/>
