import { getSession } from '@/server-actions/auth';
import { redirect } from 'next/navigation';
import Draggable from '@/components/Draggable';
import Droppable from '../../components/Droppable';
import { PlusIcon } from 'lucide-react';
import CreateCategoryButton from '../../components/CreateCategoryButton';

export default async function Page() {
	const session = await getSession();
	if (!session) redirect('/');

	return (
		<div>
			<Draggable>Element</Draggable>
			<Droppable>Zone</Droppable>
			<CreateCategoryButton />
		</div>
	);
}
