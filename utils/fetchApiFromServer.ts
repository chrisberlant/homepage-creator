import { headers } from 'next/headers';

// Used to fetch data from RSC
export default async function fetchApiFromServer(url: string) {
	const apiUrl = process.env.API_URL;
	const data = await fetch(`${apiUrl}${url}`, {
		headers: headers(),
	});
	return await data.json();
}
