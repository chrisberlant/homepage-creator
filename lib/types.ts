export type CategoryType = {
	id: number;
	title: string;
	index: number;
	links: { id: number; title: string; url: string; index: number }[];
};
