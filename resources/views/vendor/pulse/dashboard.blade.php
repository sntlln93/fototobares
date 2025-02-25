<x-pulse>    
    <livewire:pulse.servers cols="full" />

    <livewire:pulse.usage cols="4" rows="1" />

    <livewire:pulse.slow-queries cols="8" />

    <livewire:pulse.exceptions cols="6" />

    <livewire:pulse.slow-requests cols="6" />

    {{-- <livewire:pulse.slow-outgoing-requests cols="7" /> --}}

    {{-- <livewire:pulse.queues cols="5" /> --}}

    {{-- <livewire:pulse.cache cols="5" /> --}}

    {{-- <livewire:pulse.slow-jobs cols="7" /> --}}
</x-pulse>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        const snapshotDiv = document.querySelector('[wire\\:snapshot]');
        
        if (snapshotDiv) {
            const container = snapshotDiv.cloneNode()
            container.removeAttribute('wire:effect')
            container.removeAttribute('wire:snapshot')
            container.removeAttribute('wire:id')
            container.innerHTML = `
            <a href="/telescope" class="block p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600 hover:text-gray-500 focus:text-gray-500 dark:hover:text-gray-500 dark:focus:text-gray-500" >
                    <svg class="block w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-telescope"><path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/><path d="m6.158 8.633 1.114 4.456"/><path d="m8 21 3.105-6.21"/><circle cx="12" cy="13" r="2"/></svg>
            </a>
            `;

            snapshotDiv.insertAdjacentElement("afterend", container);

        }
    });
</script>


