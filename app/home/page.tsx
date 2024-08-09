import { getSession } from '@/server-actions/auth';
import { redirect } from 'next/navigation';
import LinkCard from '@/components/LinkCard';
import CreateCategoryButton from '@/components/CreateCategoryButton';
import fetchApi from '@/lib/fetchApi';
import CategoryCard from '@/components/CategoryCard';
import EditingModeButton from '../../components/EditingModeButton';

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
			<EditingModeButton />
			<CreateCategoryButton />
			<div className='flex flex-wrap justify-around items-start'>
				{categories.map((category) => (
					<CategoryCard
						key={category.id}
						id={category.id}
						title={category.title}
					>
						<ul className='flex flex-col gap-2'>
							{category.links.map((link) => (
								<LinkCard key={link.id} id={link.id}>
									{link.title}
								</LinkCard>
							))}
						</ul>
					</CategoryCard>
				))}
			</div>
		</section>
	);
}
