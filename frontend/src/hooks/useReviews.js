import useSWR from 'swr';
import apiClient from '../utils/api';

const fetcher = (url) => apiClient.get(url).then((res) => res.data);

export function useReviews() {
  const { data: reviews, error, isLoading, mutate } = useSWR('/api/reviews', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10_000,
  });

  return {
    reviews: Array.isArray(reviews) ? reviews : [],
    isLoading,
    error,
    mutate,
  };
}
