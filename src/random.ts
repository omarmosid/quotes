export const getRandomFromArray = <T>(arr: Array<T>): T | undefined => {
	if (arr.length === 0) {
		return undefined;
	}

	const randomIndex: number = Math.floor(Math.random() * arr.length);
	return arr[randomIndex];
};
