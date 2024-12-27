<script lang="ts">
    import MessageList from '$lib/components/MessageList.svelte';
    import LoginForm from '$lib/components/LoginForm.svelte';
    import type { PageData } from './$types';
    import type { Message } from '$lib/types';
    const { data } = $props<{ data: PageData }>();
    let messages = $state<Message[]>(data.messages);
    let isAuthenticated = $state(data.authenticated);

    $effect(() => {
        messages = data.messages;
        isAuthenticated = data.authenticated;
    });
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="flex flex-col items-center mb-8">
        <img src="/sms-auth-logo.svg" alt="SMS Authentication Logo" class="w-24 h-24 mb-4" />
        <h1 class="text-3xl font-bold text-center text-gray-800">הודעות SMS נכנסות</h1>
    </div>
    
    {#if !isAuthenticated}
        <LoginForm 
            onLoginSuccess={(newMessages) => {
                messages = newMessages;
                isAuthenticated = true;
            }}
        />
    {:else}
        <MessageList messages={messages} />
    {/if}
</div>
