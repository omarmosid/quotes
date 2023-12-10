import { Quote } from '../data';

const formatDate = (date: Date): string => {
	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'short' });
	const suffix = getDaySuffix(day);

	return `${day}${suffix} ${month} ${date.getFullYear()}`;
};

const getDaySuffix = (day: number): string => {
	if (day >= 11 && day <= 13) {
		return 'th';
	}
	switch (day % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
};

export const getHead = (title = "Omar's favourite quotes!") => `
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark light">
    <title>${title}</title>
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
</head>`;

export const getRandomQouteHTML = (quote: Quote | undefined) => `<html lang="en">
${getHead()}
<body>
    <div class="container">
        <h1>${quote?.text}</h1>
        <p class="sub">- ${quote?.author}</p>
    </div>
</body>
</html>`;

export const getTodaysQouteHTML = (quote: Quote | undefined) => `<html lang="en">
${getHead()}
<body>
    <div class="container">
        <p class="today">${formatDate(new Date())}</p>
        <h1>${quote?.text}</h1>
        <p class="sub">- ${quote?.author}</p>
    </div>
</body>
</html>`;
