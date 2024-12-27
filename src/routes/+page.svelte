<script lang="ts">
    import MessageList from '$lib/components/MessageList.svelte';
    import LoginForm from '$lib/components/LoginForm.svelte';
    import type { PageData } from './$types';
    import type { Message } from '$lib/types';
    
    const { data } = $props<{ data: PageData }>();
    let messages = $state<Message[]>([]);
    let isAuthenticated = $state(data.authenticated);

    $effect(() => {
        messages = data.messages;
        isAuthenticated = data.authenticated;
    });

    import { invalidate } from '$app/navigation';

    async function handleRefresh() {
        await invalidate('app:auth');
    }

    async function handleLogout() {
        isAuthenticated = false;
        messages = [];
        await invalidate('app:auth');
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">הודעות SMS נכנסות</h1>
    
    {#if !isAuthenticated}
        <LoginForm 
            onLoginSuccess={(newMessages) => {
                messages = newMessages;
                isAuthenticated = true;
            }}
        />
    {:else}
        <MessageList
            messages={messages}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
        />
    {/if}
</div>
