import { useFirestoreCRUD } from './useFirestoreCRUD';

export function usePackages() {
  return useFirestoreCRUD('packages', 'order');
}