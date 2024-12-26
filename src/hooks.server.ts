import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// בדיקת סשן קיים
	const session = event.cookies.get('session');
	
	// הוספת הסשן לlocals כדי שיהיה נגיש בכל המקומות
	event.locals.session = session;

	const response = await resolve(event);
	return response;
};
