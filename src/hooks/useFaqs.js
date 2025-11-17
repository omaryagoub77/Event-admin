import { useFirestoreCRUD } from './useFirestoreCRUD';

export function useFaqs() {
  return useFirestoreCRUD('faqs', 'order');
}