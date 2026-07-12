
import useSWR from 'swr';
import apiClient from '../utils/api';

const fetcher = (url) => apiClient.get(url).then(res => res.data);

export function useReviews() {
  const { data: reviews, error, isLoading } = useSWR(
    '/api/reviews',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    reviews: Array.isArray(reviews) ? reviews : [],
    isLoading,
    error,
  };
}
