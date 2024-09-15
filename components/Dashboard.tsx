'use client';

import { SortableContext } from '@dnd-kit/sortable';
import { useGetCategories } from '@/queries/categories.queries';
import Column from './Column';

export default function Dashboard() {
	const { data: categories, isLoading, error } = useGetCategories();
	const firstColumnCategories = categories?.filter(
		(category) => category.column === 0
	);
	console.log(categories);
	console.log(firstColumnCategories);
	const secondColumnCategories = categories?.filter(
		(category) => category.column === 1
	);
	const thirdColumnCategories = categories?.filter(
		(category) => category.column === 2
	);
	const fourthColumnCategories = categories?.filter(
		(category) => category.column === 3
	);

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
				<SortableContext
					items={categories.map(
						(category) => `container-${category.id}`
					)}
				>
					<section className='flex justify-around gap-1'>
						<Column id={0} categories={firstColumnCategories} />
						<Column id={1} categories={secondColumnCategories} />
						<Column id={2} categories={thirdColumnCategories} />
						<Column id={3} categories={fourthColumnCategories} />
					</section>
				</SortableContext>
			)}
		</>
	);
}
