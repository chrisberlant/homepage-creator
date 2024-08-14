import CreateCategoryButton from '@/components/CreateCategoryButton';
import EditingModeButton from '@/components/EditingModeButton';
import Dashboard from '@/components/Dashboard';
import Test from '../../components/Test';

export default function Page() {
	return (
		<section>
			<EditingModeButton />
			<CreateCategoryButton />
			<Dashboard />
			{/* <Test /> */}
		</section>
	);
}
