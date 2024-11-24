<script lang="ts">
    import { onMount } from "svelte";

    /** @type {import('./$types').PageData} */
	export let data: any;

    onMount(async () => {
        console.log(data);
    });

</script>


<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
