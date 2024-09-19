import { CategoryWithLinksType } from '@/lib/types';
import CategoryCard from './CategoryCard';
import CreateCategoryButton from './CreateCategoryButton';
import { SortableContext, useSortable } from '@dnd-kit/sortable';

export default function Column({
	categories,
	id,
}: {
	categories: CategoryWithLinksType[];
	id: number;
}) {
	const { setNodeRef } = useSortable({
		id: `column-${id}`,
		data: {
			type: 'column',
		},
	});

	return (
		<SortableContext
			items={categories.map((category) => `category-${category.id}`)}
		>
			<div
				ref={setNodeRef}
				className='flex-1 flex flex-col gap-4 p-2 border-2'
			>
				{categories.map((category) => (
					<CategoryCard
						key={category.id}
						id={category.id}
						title={category.title}
						columnId={id}
						links={category.links}
					/>
				))}
				<CreateCategoryButton columnId={id} />
			</div>
		</SortableContext>
	);
}
