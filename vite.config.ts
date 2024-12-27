import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit()],
		server: {
			fs: {
				allow: ['.']
			}
		},
		define: {
			'process.env.API_USERNAME': JSON.stringify(env.API_USERNAME),
			'process.env.API_PASSWORD': JSON.stringify(env.API_PASSWORD),
			'process.env.CLIENT_USERNAME': JSON.stringify(env.CLIENT_USERNAME),
			'process.env.CLIENT_PASSWORD': JSON.stringify(env.CLIENT_PASSWORD),
			'process.env.API_URL': JSON.stringify(env.API_URL)
		}
	};
});
