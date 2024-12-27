// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authenticated: boolean;
		}
		interface PageData {
			messages: import('$lib/types').Message[];
			authenticated: boolean;
		}
		// interface Platform {}
	}
}

export {};
