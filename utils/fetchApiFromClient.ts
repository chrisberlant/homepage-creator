// Used to fetch data from CC
export default async function fetchApiFromClient(url: string) {
	return await fetch(url).then((data) => data.json());
}
