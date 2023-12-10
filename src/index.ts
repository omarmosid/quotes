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
import { getRandomFromArray } from './random';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
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
		} else {
			const randomQuote = getRandomFromArray(quotes);
			const html = `<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="color-scheme" content="dark light">
				<title>Omars favourites quotes!</title>
				<style>
					body {
						padding: 4em;
						display: flex;
						justify-content: center;
						align-items: center;
						flex-wrap: wrap;
					}
					h1 {
						font-size: 1.6em;
						max-width: 20em;
						width: 100%;
					}
					p.sub {
						display: inline-block;
						width: 100%;
						color: rgba(255, 255, 255, 50%);
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>${randomQuote?.text}</h1>
					<p class="sub">- ${randomQuote?.author}</p>
				</div>
			</body>
		</html>`;
			return new Response(html, {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
			});
		}
	},
};
