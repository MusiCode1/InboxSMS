<script lang="ts">
    import MessageList from '$lib/components/MessageList.svelte';
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import type { Message } from '$lib/types';
    
    const { data } = $props<{ data: PageData }>();
    let error = $state('');
    let messages = $state<Message[]>([]);

    $effect(() => {
        messages = data.messages;
    });

    function handleLoginResult({ type, data: resultData }: { type: string; data?: any }) {
        if (type === 'success') {
            error = '';
        } else if (resultData?.error) {
            error = resultData.error;
        }
    }

    async function handleRefreshResult(result: { success: boolean; error?: string; messages?: Message[] }) {
        if (result.success && result.messages) {
            messages = result.messages;
        } else if (result.error) {
            error = result.error;
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">הודעות SMS נכנסות</h1>
    
    {#if !data.messages.length}
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4 text-gray-700">התחברות</h2>
            
            {#if error}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            {/if}
            
            <form 
                method="POST"
                action="?/login"
                class="space-y-4"
                use:enhance={({ formElement, formData }) => {
                    return async ({ result }) => {
                        handleLoginResult(result);
                    };
                }}
            >
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                        שם משתמש:
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="הכנס שם משתמש"
                        autocomplete="username"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                        סיסמה:
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="הכנס סיסמה"
                        autocomplete="current-password"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <button
                    type="submit"
                    class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                    התחבר
                </button>
            </form>
        </div>
    {:else}
        <MessageList
            messages={messages}
            onRefresh={async () => {
                const response = await fetch('?/refresh', { 
                    method: 'POST',
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const result = await response.json();
                handleRefreshResult(result);
            }}
            onLogout={async () => {
                await fetch('?/logout', { 
                    method: 'POST',
                    headers: {
                        'accept': 'application/json'
                    }
                });
            }}
        />
    {/if}
</div>
