
import useSWR from 'swr';
import apiClient from '../utils/api';

const fetcher = (url) => apiClient.get(url).then(res => res.data);

export function useCategories() {
  const { data: categories, error, isLoading } = useSWR(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    categories: Array.isArray(categories) ? categories : [],
    isLoading,
    error,
  };
}
