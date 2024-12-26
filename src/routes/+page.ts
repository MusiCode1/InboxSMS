import type { PageLoad } from './$types';
import type { Message } from '$lib/types';

export interface PageData {
    messages: Message[];
}

export const load: PageLoad<PageData> = async ({ data }) => {
    return {
        messages: data.messages
    };
};
