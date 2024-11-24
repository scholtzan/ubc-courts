import { getCourts } from "$lib/api";


/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		courts: await getCourts()
	};
}