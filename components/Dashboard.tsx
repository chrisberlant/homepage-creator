'use client';

import { useContext } from 'react';
import CategoryCard from './CategoryCard';
import { CategoriesContext } from './contexts/CategoriesContextProvider';

export default function Dashboard() {
	const categories = useContext(CategoriesContext);

	return (
		<div className='flex flex-wrap justify-around items-start'>
			{categories.map((category) => (
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
