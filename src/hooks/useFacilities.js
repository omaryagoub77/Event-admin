import { useFirestoreCRUD } from './useFirestoreCRUD';

export function useFacilities() {
  return useFirestoreCRUD('facilities', 'order');
}