<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores"; 
    import { goto } from "$app/navigation";

    /** @type {import('./$types').PageData} */
	export let data: any;

    let currentDate = new Date();
    let selectedDate = new Date();
    let selectedView = "Day";

    console.log(data);


    onMount(async () => {
        if ($page.url.searchParams.has('view')) {
            selectedView = $page.url.searchParams.get('view'); 
        }

        if ($page.url.searchParams.has('date')) {
            selectedDate = new Date($page.url.searchParams.get('date')); 
        }
    });

    function updateView() {
        $page.url.searchParams.set('view', selectedView); 
        goto(`?${$page.url.searchParams.toString()}`);
        selectedView = $page.url.searchParams.get('view'); 
    }

    function updateDate(diff: number | Date) {
        if (diff instanceof Date) {
            selectedDate = diff;
        } else if ((diff < 0 && selectedDate > currentDate) || diff >= 0) {
            selectedDate.setDate(selectedDate.getDate() + diff);
        }

        $page.url.searchParams.set('date', selectedDate.toDateString()); 
        goto(`?${$page.url.searchParams.toString()}`);
        selectedDate = new Date($page.url.searchParams.get('date'));
    }

    function dateRange(startDate: Date, days: number): string[] {
        const copiedDate = new Date(startDate.getTime());
        var dates: string[] = [];
        const range = Array.from({length: days}, (v, k) => k);
        
        range.forEach((r) => {
            dates.push(copiedDate.toDateString())
            copiedDate.setDate(copiedDate.getDate() + 1)
        });

        return dates;
    }
</script>


<div class="navbar bg-neutral text-neutral-content">
    <button class="btn btn-ghost text-xl">UBC Tennis Courts 🎾</button>
</div>

<div class="content mx-4">
    <label class="form-control w-full max-w-xs">
        <div class="label">
            <span class="label-text">View</span>
        </div>
        <select class="select select-bordered" bind:value={selectedView} on:change={updateView}>
            <option>Day</option>
            <option>Week</option>
        </select>
    </label>

    <div class="mt-8">
        <div class="navbar bg-base-300">
            <div class="navbar-start">
                <button class="btn btn-square" on:click={() => updateDate(-1)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                    </svg>
                </button>
                <button class="btn ml-2" on:click={() => updateDate(new Date())}>
                    Today
                </button>
            </div>
            <div class="navbar-center">
                <span class="text-large">
                    {selectedDate.toDateString()}
                </span>
            </div>
            <div class="navbar-end">
                <button class="btn btn-square" on:click={() => updateDate(1)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="overflow-x-scroll">
            {#if selectedView == "Day"}
            <table class="table table-zebra">
            <!-- head -->
            <thead>
                <tr>
                    <th>Time</th>
                    {#each data.courts as court}
                        <th><a href="https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId={court.id}">{court.name}</a></th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each data.hours as hour}
                <!-- row 1 -->
                <tr>
                <th>{hour}:00</th>
                    {#each data.courts as court}
                        {#if court.availabilities.has((new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour - selectedDate.getTimezoneOffset() / 60, 0, 0)).toJSON())}
                            <td>
                                {#if court.availabilities.get((new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour - selectedDate.getTimezoneOffset() / 60, 0, 0)).toJSON()) }
                                <a href="https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId={court.id}" target="_blank" class="btn btn-neutral btn-sm" tabindex="-1" role="button" aria-disabled="true">
                                    Book
                                </a>
                                {:else}
                                <div class="tooltip" data-tip="Bookable 24 hours in advance">
                                    <a href="https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId={court.id}" target="_blank" class="btn btn-disabled btn-sm" tabindex="-1" role="button" aria-disabled="true">
                                        Open
                                    </a>
                                </div>
                                {/if}
                            </td>
                        {:else}
                            <td class="disabled"></td>
                        {/if}
                    {/each}
                </tr>
                {/each}
            </tbody>
            </table>
            {:else}
            <table class="table table-zebra">
                <!-- head -->
                <thead>
                    <tr>
                        <th>Time</th>
                        {#each dateRange(selectedDate, 7) as date}
                            <th>{date}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each data.hours as hour}
                    <!-- row 1 -->
                    <tr>
                    <th>{hour}:00</th>
                        {#each dateRange(selectedDate, 7) as date}
                            <td>
                            {#each data.courts as court}
                                {#if court.availabilities.has((new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate(), hour - new Date(date).getTimezoneOffset() / 60, 0, 0)).toJSON())}
                                    {#if court.availabilities.get((new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate(), hour - new Date(date).getTimezoneOffset() / 60, 0, 0)).toJSON()) }
                                    <a href="https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId={court.id}" target="_blank" class="btn btn-square btn-neutral btn-sm mx-1 mb-1" tabindex="-1" role="button" aria-disabled="true">
                                        {court.shortName}
                                    </a>
                                    {:else}
                                    <div class="tooltip" data-tip="Bookable 24 hours in advance">
                                        <button class="btn btn-square btn-disabled btn-sm mx-1 mb-1" tabindex="-1" role="button" aria-disabled="true">
                                            {court.shortName}
                                        </button>
                                    </div>
                                    {/if}
                                {/if}
                            {/each}
                            </td>
                        {/each}
                    </tr>
                    {/each}
                </tbody>
            </table>
            {/if}
        </div>
    </div>
</div>