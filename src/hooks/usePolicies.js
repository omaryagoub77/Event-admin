import { useFirestoreCRUD } from './useFirestoreCRUD';

export function usePolicies() {
  return useFirestoreCRUD('policies', 'order');
}