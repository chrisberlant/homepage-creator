import { CategoryWithLinksType } from '@/lib/types';
import CategoryCard from './CategoryCard';
import CreateCategoryButton from './CreateCategoryButton';

export default function Column({
	categories,
	id,
}: {
	categories: CategoryWithLinksType[];
	id: number;
}) {
	return (
		<div className='flex-1 flex flex-col gap-4 p-2'>
			{categories.map((category) => (
				<CategoryCard
					key={category.id}
					id={category.id}
					title={category.title}
					links={category.links}
				/>
			))}
			<CreateCategoryButton columnId={id} />
		</div>
	);
}
