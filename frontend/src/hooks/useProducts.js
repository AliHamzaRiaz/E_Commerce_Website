import useSWR from 'swr';
import apiClient from '../utils/api';

const fetcher = (url) =>
  apiClient.get(url, { timeout: 8000 }).then((res) => res.data);

export function useProducts() {
  const { data: products, error, isLoading, mutate } = useSWR(
    '/api/products',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 15_000,
      errorRetryCount: 2,
      onError: (fetchError) => {
        console.error('Failed to load products from /api/products:', fetchError);
      },
    }
  );

  return {
    products: Array.isArray(products) ? products : [],
    isLoading,
    error,
    mutate,
  };
}
