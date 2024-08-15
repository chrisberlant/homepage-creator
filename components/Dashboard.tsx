'use client';

import CategoryCard from './CategoryCard';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/server-actions/categories';

export default function Dashboard() {
	const { data: categories, error } = useQuery({
		queryKey: ['categories'],
		queryFn: getCategories,
	});

	if (error) return <div>Error while fetching the categories</div>;

	if (categories)
		return (
			<div className='flex flex-wrap justify-around items-start'>
				{categories?.map((category) => (
					<CategoryCard
						key={category.id}
						id={category.id}
						title={category.title}
						index={category.index}
						links={category.links}
					/>
				))}
			</div>
		);
}
