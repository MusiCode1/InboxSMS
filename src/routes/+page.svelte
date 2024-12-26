<script lang="ts">
    import { login, logout, getMessages } from '$lib/api';
    import MessageList from '$lib/components/MessageList.svelte';
    import type { Message } from '$lib/types';
    
    let token = $state<string | null>(null);
    let messages = $state<Message[]>([]);
    let username = $state('');
    let password = $state('');
    let error = $state('');

    async function handleLogin() {
        if (!username || !password) {
            error = 'נא להזין שם משתמש וסיסמה';
            return;
        }

        try {
            error = '';
            token = await login(username, password);
            await loadMessages();
        } catch (err) {
            error = err instanceof Error ? err.message : 'שגיאה בהתחברות';
        }
    }

    async function handleLogout() {
        if (token) {
            await logout(token);
            token = null;
            messages = [];
        }
    }

    async function loadMessages() {
        if (!token) return;

        try {
            messages = await getMessages(token);
        } catch (err) {
            error = err instanceof Error ? err.message : 'שגיאה בטעינת ההודעות';
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">הודעות SMS נכנסות</h1>
    
    {#if !token}
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4 text-gray-700">התחברות</h2>
            
            {#if error}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            {/if}
            
            <form 
                class="space-y-4"
                onsubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
            >
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                        שם משתמש:
                    </label>
                    <input
                        type="text"
                        id="username"
                        bind:value={username}
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
                        bind:value={password}
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
            {messages}
            onRefresh={loadMessages}
            onLogout={handleLogout}
        />
    {/if}
</div>
