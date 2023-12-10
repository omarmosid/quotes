export type Quote = {
	text: string;
	author: string;
	source?: string;
	link?: string;
	tags?: Array<Tag>;
};

type Tag = 'Inspiring' | 'Reality Check' | 'Life' | 'Goals' | 'Book' | 'Movie';

export const quotes: Quote[] = [
	{
		text: 'You will not be asked what happened. You will be asked what did you do.',
		author: 'Mirza Yawar Baig',
	},
	{
		text: `Sometimes there's so much beauty in the world, I feel like I can't take it, and my heart is just going to cave in.`,
		author: 'Alan Bell',
	},
	{
		text: `So I guess this is where I tell you what I learned - my conclusion, right? Well, my conclusion is: Hate is baggage. Life's too short to be pissed off all the time. It's just not worth it. Derek says it's always good to end a paper with a quote. He says someone else has already said it best. So if you can't top it, steal from them and go out strong. So I picked a guy I thought you'd like. 'We are not enemies, but friends. We must not be enemies. Though passion may have strained, it must not break our bonds of affection. The mystic chords of memory will swell when again touched, as surely they will be, by the better angels of our nature.'`,
		author: 'David McKenna',
		source: 'American History X',
		link: 'https://www.imdb.com/title/tt0120586/?ref_=tt_ch',
	},
];
