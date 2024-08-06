import { getSession } from '@/server-actions/auth';
import { redirect } from 'next/navigation';
import Draggable from '@/components/Draggable';
import CreateCategoryButton from '@/components/CreateCategoryButton';
import fetchApi from '@/lib/fetchApi';
import Droppable from '@/components/Droppable';

type CategoryType = {
	id: number;
	title: string;
	index: number;
	links: { id: number; title: number; url: string; index: number }[];
};

export default async function Page() {
	const session = await getSession();
	if (!session) redirect('/');
	const categories: CategoryType[] = await fetchApi('/categories');

	return (
		<section>
			{/* {/* <Draggable>Element</Draggable> */}
			<CreateCategoryButton />
			<div className='flex flex-wrap justify-around'>
				{categories.map((category) => (
					<Droppable
						key={category.id}
						id={category.id}
						title={category.title}
					>
						<div className='flex flex-col gap-2'>
							{category.links.map((link) => (
								<Draggable key={link.id}>
									{link.title}
								</Draggable>
							))}
						</div>
					</Droppable>
				))}
			</div>
			{/* <Droppable>Zone</Droppable> */}
		</section>
	);
}
