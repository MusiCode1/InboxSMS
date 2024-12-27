<script lang="ts">
	import Message from './Message.svelte';
	import type { Message as MessageType } from '$lib/types';
	import type { RefreshResponse, LogoutResponse } from '$lib/utils/forms';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	let { messages = $bindable([]) } = $props<{
		messages: MessageType[];
	}>();

	let isRefreshing = $state(false);

	function handleRefresh() {
		return () => {
			isRefreshing = true;

			return async ({ result }: { result: ActionResult }) => {
				if (result.type === 'success') {
					const data = result.data as RefreshResponse;
					if (data?.success && data.messages) {
						messages = data.messages;
					}
				}
				isRefreshing = false;
			};
		};
	}
</script>

<div>
	<div class="mb-5 flex gap-3">
		<form method="POST" action="?/refresh" class="m-0" use:enhance={handleRefresh()}>
			<button
				type="submit"
				class="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
				disabled={isRefreshing}
			>
				{#if isRefreshing}
					מרענן...
				{:else}
					רענן הודעות
				{/if}
			</button>
		</form>

		<form 
			method="POST" 
			action="?/logout" 
			class="m-0"
			use:enhance={() => {
				return async ({ result }: { result: ActionResult }) => {
					if (result.type === 'success') {
						const data = result.data as LogoutResponse;
						if (data?.success) {
							window.location.href = '/';
						}
					}
				};
			}}
		>
			<button
				type="submit"
				class="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
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
