import { useFirestoreCRUD } from './useFirestoreCRUD';

export function useTestimonials() {
  return useFirestoreCRUD('testimonials', 'createdAt');
}