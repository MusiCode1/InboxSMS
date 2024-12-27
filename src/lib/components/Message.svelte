<script lang="ts">
    let { message } = $props<{
        message: {
            server_date: string;
            phone: string;
            message: string;
            dest: string;
        }
    }>();

    let showCopied = $state(false);

    function findCode(text: string): string | null {
        const match = text.match(/\b\d{4,7}\b/);
        return match ? match[0] : null;
    }

    async function copyCode() {
        const code = findCode(message.message);
        if (code) {
            await navigator.clipboard.writeText(code);
            showCopied = true;
            setTimeout(() => {
                showCopied = false;
            }, 1000);
        }
    }
</script>

<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
    <div class="flex justify-between text-gray-600 text-sm mb-2">
        <span>תאריך: {new Date(message.server_date).toLocaleString()}</span>
        <span>מאת: {message.phone}</span>
    </div>
    <div class="text-gray-800">
        {message.message}
    </div>
    <div class="mt-2 text-gray-600 text-sm flex justify-between items-center">
        <span>נשלח אל: {message.dest}</span>
        {#if findCode(message.message)}
            <button 
                onclick={copyCode}
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors relative"
            >
                {#if showCopied}
                    הועתק ✓
                {:else}
                    העתק קוד
                {/if}
            </button>
        {/if}
    </div>
</div>
