'use client';

import { SortableContext } from '@dnd-kit/sortable';
import CategoryCard from './CategoryCard';
import { useGetCategories } from '@/queries/categories.queries';

export default function Dashboard() {
	const { data: categories, isLoading, error } = useGetCategories();

	return (
		<>
			{error && <div>Error while fetching the categories</div>}

			{isLoading && <div>Loading...</div>}

			{categories && (
				<SortableContext
					items={categories.map(
						(category) => `container-${category.id}`
					)}
				>
					<section className='flex flex-wrap items-start justify-center gap-4'>
						{categories.map((category) => (
							<CategoryCard
								key={category.id}
								id={category.id}
								title={category.title}
								links={category.links}
							/>
						))}
					</section>
				</SortableContext>
			)}
		</>
	);
}
