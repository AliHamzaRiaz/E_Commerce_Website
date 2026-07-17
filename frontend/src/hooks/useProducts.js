
import useSWR from 'swr';
import apiClient from '../utils/api';

const fetcher = (url) => apiClient.get(url).then(res => res.data);

export function useProducts() {
  const { data: products, error, isLoading } = useSWR(
    '/api/products',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      onError: (fetchError) => {
        console.error('Failed to load products from /api/products:', fetchError);
      },
    }
  );

  return {
    products: Array.isArray(products) ? products : [],
    isLoading,
    error,
  };
}
