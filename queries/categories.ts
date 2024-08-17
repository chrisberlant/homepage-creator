import { CategoryType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import fetchApiFromClient from '@/utils/fetchApiFromClient';

export const useGetCategories = () =>
	useQuery({
		queryKey: ['categories'],
		queryFn: async () =>
			(await fetchApiFromClient('/api/categories')) as CategoryType[],
	});
