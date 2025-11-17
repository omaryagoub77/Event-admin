import { useFirestoreCRUD } from './useFirestoreCRUD';

export function useGallery() {
  return useFirestoreCRUD('gallery', 'uploadedAt');
}