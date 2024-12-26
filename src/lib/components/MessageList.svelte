<script lang="ts">
    import Message from './Message.svelte';
    import type { Message as MessageType } from '$lib/types';
    
    let { messages, onRefresh, onLogout } = $props<{
        messages: MessageType[];
        onRefresh: () => void;
        onLogout: () => void;
    }>();
</script>

<div>
    <div class="flex gap-3 mb-5">
        <button 
            onclick={onRefresh}
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
            רענן הודעות
        </button>
        <button 
            onclick={onLogout}
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
            התנתק
        </button>
    </div>

    <div class="space-y-4">
        {#each messages as message (message.server_date + message.phone)}
            <Message {message} />
        {/each}
    </div>
</div>
