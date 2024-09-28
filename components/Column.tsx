import { CategoryWithLinksType } from '@/lib/types';
import CategoryCard from './CategoryCard';
import CreateCategoryButton from './CreateCategoryButton';
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
			strategy={verticalListSortingStrategy}
		>
			<div ref={setNodeRef} className='flex-1 flex flex-col gap-4 p-2'>
				{categories.map((category) => (
					<CategoryCard
						key={category.id}
						id={category.id}
						title={category.title}
						column={id}
						links={category.links}
					/>
				))}
				<CreateCategoryButton column={id} />
			</div>
		</SortableContext>
	);
}
