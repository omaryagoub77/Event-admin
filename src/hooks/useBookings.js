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

export function useBookings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      orderBy('createdAt', 'desc')
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
  }, []);

  const createBooking = async (bookingData) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      return docRef.id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateBooking = async (id, bookingData) => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, bookingData);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteBooking = async (id) => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      await deleteDoc(bookingRef);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking
  };
}