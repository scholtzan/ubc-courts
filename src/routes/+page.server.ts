import { getCourts } from "$lib/api";

const HOURS = Array.from({length: (23 - 8)}, (v, k) => k + 8)

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		courts: await getCourts(),
        hours: HOURS
	};
}