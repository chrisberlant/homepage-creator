'use client';

import { useContext } from 'react';
import { Button } from './ui/button';
import { PenIcon, PenOffIcon } from 'lucide-react';
import { EditingModeContext } from './providers/EditingModeContextProvider';

export default function EditingModeButton() {
	const { editingMode, toggleEditingMode } = useContext(EditingModeContext);

	return (
		<div className='flex'>
			<Button onClick={toggleEditingMode} className='ml-auto'>
				{editingMode ? (
					<>
						<PenOffIcon className='mr-2' />
						Quit edit mode
					</>
				) : (
					<>
						<PenIcon className='mr-2' />
						Enable edit mode
					</>
				)}
			</Button>
		</div>
	);
}
