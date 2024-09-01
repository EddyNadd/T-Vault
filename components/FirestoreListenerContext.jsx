import React, { createContext, useRef, useContext } from 'react';

const FirestoreListenersContext = createContext();

/**
 * Provider component to manage Firestore listeners.
 * @param {*} children - The children of the component.
 */
export const FirestoreListenersProvider = ({ children }) => {
  const listenersRef = useRef([]);

  const unsubscribeAllListeners = () => {
    listenersRef.current.forEach((unsubscribe) => unsubscribe());
    listenersRef.current = [];
  };

  return (
    <FirestoreListenersContext.Provider value={{ listenersRef, unsubscribeAllListeners }}>
      {children}
    </FirestoreListenersContext.Provider>
  );
};

export const useFirestoreListeners = () => useContext(FirestoreListenersContext);
