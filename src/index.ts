/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { getRandomQouteHTML, getTodaysQouteHTML } from './html';
import { getRandomFromArray, getRandomIndexFromArray } from './random';

export interface Env {
	GOOGLE_SHEET_DOC_ID: string;
	GOOGLE_API_KEY: string;
	CF_API_KV_EDIT_TOKEN: string;
	CF_ACCOUNT_ID: string;
	CF_KV_ALL_NAMESPACE: string;

	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	STORE: KVNamespace;
	ALL: KVNamespace;

	DB: D1Database;
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

export type Quote = {
	id: string;
	text: string;
	author: string;
	source: string;
	link: string;
	theme: string;
};

const normalizeSheetData = (input: Array<Array<string>>): Array<Quote> => {
	const result: Array<Quote> = [];

	for (let i = 1; i < input.length; i++) {
		const quoteArray = input[i];
		const quoteObj: Quote = {
			id: quoteArray[0] || '',
			text: quoteArray[1] || '',
			author: quoteArray[2] || '',
			source: quoteArray[3] || '',
			link: quoteArray[4] || '',
			theme: quoteArray[5] || '',
		};
		result.push(quoteObj);
	}

	return result;
};

const fetchQuotesFromSpreadsheet = async (env: Env) => {
	const spreadsheetId = env.GOOGLE_SHEET_DOC_ID;
	const apiKey = env.GOOGLE_API_KEY;
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${apiKey}`;
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Unable to fetch data');
		}

		const data: any = await response.json();

		// Modify this according to your response requirements
		const rows = data.values || [];

		const quotes = normalizeSheetData(rows);

		// Return the entire data
		return quotes;
	} catch (error) {
		console.error('Error fetching data:', error);
		return [];
	}
};

export const getRandomFromDB = async (env: Env) => {
	const { results } = await env.DB.prepare('SELECT * FROM quotes').run();
	const randomQuote = getRandomFromArray(results as Quote[]);
	return randomQuote;
};

export const getOneQuote = async (env: Env, id: string) => {
	const { results } = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).run();

	console.log('results', results);
	return results[0] as Quote;
};

export const setTodaysQuote = async (env: Env) => {
	const quote = await getRandomFromDB(env);
	await env.STORE.put('today', JSON.stringify(quote?.id));
};

export const getTodaysFromDB = async (env: Env) => {
	const todayId = await env.STORE.get('today');
	console.log('todayId', todayId);

	if (!todayId) {
		console.log('set todayId');
		const randomQuote = await getRandomFromDB(env);
		await env.STORE.put('today', JSON.stringify(randomQuote?.id));
		return randomQuote;
	}
	console.log('todayId', todayId);

	return await getOneQuote(env, todayId);
};

export const emptyTable = async (env: Env) => {
	await env.DB.prepare(`DELETE FROM quotes`).run();
};

// Sync google sheets with D1
export const syncGoogleSheetsWithD1 = async (env: Env) => {
	const quotes = await fetchQuotesFromSpreadsheet(env);

	await emptyTable(env);
	for await (const quote of quotes) {
		const response = await env.DB.prepare(
			`
					INSERT OR REPLACE INTO quotes (id, text, author, source, link, theme) VALUES (?, ?, ?, ?, ?, ?)	
				`
		)
			.bind(quote.id, quote.text, quote.author, quote.source, quote.link, quote.theme)
			.run();
	}
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const params = new URLSearchParams(url.searchParams);
		const route = url.pathname;

		const quotes: Quote[] = [];

		if (route === '/api/all') {
			const allResponse = await env.DB.prepare(`SELECT * FROM quotes`).run();
			return new Response(JSON.stringify(allResponse.results), {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
				},
			});
		} else if (route === '/api/quote') {
			const id = params.get('id');
			const allResponse = await env.DB.prepare(`SELECT * FROM quotes WHERE id = ?`).bind(id).run();
			const quote = allResponse.results[0] || {};
			return new Response(JSON.stringify(quote), {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
				},
			});
		} else if (route === '/api/random') {
			const randomQuote = await getRandomFromDB(env);
			const randomQuoteResponse = JSON.stringify(randomQuote, null, 2);
			return new Response(randomQuoteResponse, {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
				},
			});
		} else if (route === '/api/sync') {
			await syncGoogleSheetsWithD1(env);
			return new Response('Synced!');
		} else if (route === '/today') {
			const todaysQuote = await getTodaysFromDB(env);
			console.log('todaysQuote', todaysQuote);
			const html = getTodaysQouteHTML(todaysQuote);
			return new Response(html, {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
			});
		} else {
			const todaysQuote = await getTodaysFromDB(env);
			const html = getRandomQouteHTML(todaysQuote);
			return new Response(html, {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
			});
		}
	},

	async scheduled(event: ScheduledEvent, env: Env) {
		if (event.cron === '0 0 * * *') {
			await syncGoogleSheetsWithD1(env);
			await setTodaysQuote(env);
		}
		console.log('cron job ran!');
	},
};
