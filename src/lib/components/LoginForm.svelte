<script lang="ts">
    import type { Message } from '$lib/types';
    import type { LoginResponse } from '$lib/utils/forms';
    import { enhance as enhanceForms } from '$app/forms';
    import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
    
    let { onLoginSuccess } = $props<{
        onLoginSuccess: (messages: Message[]) => void;
    }>();
    
    let error = $state('');
    let isSubmitting = $state(false);

    function getEnhanceHandler(): SubmitFunction {
        return () => {
            error = '';
            isSubmitting = true;

            return async ({ result, update }: { 
                result: ActionResult, 
                update: (options?: { reset: boolean }) => Promise<void> 
            }) => {
                if (result.type === 'success') {
                    const data = result.data as LoginResponse;
                    if (data?.success) {
                        onLoginSuccess(data.messages || []);
                        isSubmitting = false;
                        await update({ reset: false });
                        return;
                    }
                    if (data?.error) {
                        error = data.error;
                    }
                }
                error = error || 'שגיאה לא צפויה בהתחברות';
                isSubmitting = false;
                await update();
            };
        };
    }
</script>

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
        use:enhanceForms={getEnhanceHandler()}
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
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
        >
            {#if isSubmitting}
                מתחבר...
            {:else}
                התחבר
            {/if}
        </button>
    </form>
</div>
