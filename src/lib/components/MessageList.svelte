<script lang="ts">
    import Message from './Message.svelte';
    import type { Message as MessageType } from '$lib/types';
    import { enhance } from '$app/forms';
    import type { ActionResult } from '@sveltejs/kit';
    
    let { messages, onRefresh, onLogout } = $props<{
        messages: MessageType[];
        onRefresh: () => void;
        onLogout: () => void;
    }>();

    function handleRefreshSubmit() {
        return async ({ result }: { result: ActionResult }) => {
            if (result.type === 'success') {
                onRefresh();
            }
        };
    }

    function handleLogoutSubmit() {
        return async ({ result }: { result: ActionResult }) => {
            if (result.type === 'success') {
                onLogout();
            }
        };
    }
</script>

<div>
    <div class="flex gap-3 mb-5">
        <form 
            method="POST" 
            action="?/refresh" 
            class="contents"
            use:enhance={handleRefreshSubmit}
        >
            <button 
                type="submit"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                רענן הודעות
            </button>
        </form>

        <form 
            method="POST" 
            action="?/logout" 
            class="contents"
            use:enhance={handleLogoutSubmit}
        >
            <button 
                type="submit"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                התנתק
            </button>
        </form>
    </div>

    <div class="space-y-4">
        {#each messages as message (message.server_date + message.phone)}
            <Message {message} />
        {/each}
    </div>
</div>
