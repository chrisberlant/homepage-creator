'use client';

import { useGetCategories } from '@/queries/categories.queries';
import Column from './Column';
import { useContext } from 'react';
import { FaviconsContext } from './providers/FaviconsContextProvider';

export default function Dashboard() {
	const { data: categories, isLoading, error } = useGetCategories();
	const firstColumnCategories = categories?.filter(
		(category) => category.column === 0
	);
	const secondColumnCategories = categories?.filter(
		(category) => category.column === 1
	);
	const thirdColumnCategories = categories?.filter(
		(category) => category.column === 2
	);
	const fourthColumnCategories = categories?.filter(
		(category) => category.column === 3
	);
	const favicons = useContext(FaviconsContext);
	console.log('dashboard favicons', favicons);

	const allData =
		categories &&
		firstColumnCategories &&
		secondColumnCategories &&
		thirdColumnCategories &&
		fourthColumnCategories;

	return (
		<>
			{error && <div>Error while fetching the categories</div>}

			{isLoading && <div>Loading...</div>}

			{allData && (
				<section className='flex justify-around gap-1'>
					<Column id={0} categories={firstColumnCategories} />
					<Column id={1} categories={secondColumnCategories} />
					<Column id={2} categories={thirdColumnCategories} />
					<Column id={3} categories={fourthColumnCategories} />
				</section>
			)}
		</>
	);
}
