/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { quotes } from '../data';
import { getRandomQouteHTML, getTodaysQouteHTML } from './html';
import { getRandomFromArray, getRandomIndexFromArray } from './random';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	STORE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const route = new URL(request.url).pathname;
		console.log('route', route);

		if (route === '/api/all') {
			const allResponse = JSON.stringify(quotes, null, 2);
			return new Response(allResponse, {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
				},
			});
		} else if (route === '/api/random') {
			const randomQuote = getRandomFromArray(quotes);
			const randomQuoteResponse = JSON.stringify(randomQuote, null, 2);
			return new Response(randomQuoteResponse, {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
				},
			});
		} else if (route === '/today') {
			const index = await env.STORE.get('today');
			console.log('index', index);
			if (!index) {
				const index = getRandomIndexFromArray(quotes);
				await env.STORE.put('today', index.toString());
				const randomQuote = quotes[index];
				const html = getTodaysQouteHTML(randomQuote);
				return new Response(html, {
					headers: {
						'content-type': 'text/html;charset=UTF-8',
					},
				});
			} else {
				const randomQuote = quotes[parseInt(index)];
				const html = getTodaysQouteHTML(randomQuote);
				return new Response(html, {
					headers: {
						'content-type': 'text/html;charset=UTF-8',
					},
				});
			}
		} else {
			const randomQuote = getRandomFromArray(quotes);
			const html = getRandomQouteHTML(randomQuote);
			return new Response(html, {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
			});
		}
	},

	async scheduled(event: ScheduledEvent, env: Env) {
		const index = getRandomIndexFromArray(quotes)?.toString() || '';
		env.STORE.put('today', index);
	},
};
