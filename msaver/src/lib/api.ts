import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const api = {
  // Users
  getUser: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  },
  
  createUser: async (uid: string, data: any) => {
    try {
      const docRef = doc(db, 'users', uid);
      await addDoc(collection(db, 'users'), { ...data, uid, createdAt: Timestamp.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  },

  // Generic helpers for user-specific collections
  listByUser: async (colName: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    try {
      const q = query(collection(db, colName), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colName);
    }
  },

  addForUser: async (colName: string, data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    try {
      return await addDoc(collection(db, colName), { ...data, userId, createdAt: Timestamp.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colName);
    }
  },

  updateForUser: async (colName: string, id: string, data: any) => {
    try {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${colName}/${id}`);
    }
  },

  deleteForUser: async (colName: string, id: string) => {
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colName}/${id}`);
    }
  },

  subscribeToUserCollection: (colName: string, callback: (data: any[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};
    const q = query(collection(db, colName), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, colName);
    });
  }
};
