import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestoreCRUD(collectionName, orderByField = 'order') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, collectionName),
      orderBy(orderByField)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, orderByField]);

  const createItem = async (itemData) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), itemData);
      return docRef.id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, itemData);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await deleteDoc(itemRef);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem
  };
}