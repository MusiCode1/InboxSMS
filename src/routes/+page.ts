import type { PageLoad } from './$types';
import type { Message } from '$lib/types';

export interface PageData {
    messages: Message[];
    authenticated: boolean;
}

export const load: PageLoad<PageData> = async ({ data }) => {
    return {
        messages: data.messages,
        authenticated: data.authenticated
    };
};
