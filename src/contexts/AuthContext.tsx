import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  UserCredential 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  getCurrentUserTeamId: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            setCurrentUser({
              uid: firebaseUser.uid,
              ...userDoc.data() as Omit<User, 'uid'>
            });
          } else {
            // User might be just authenticated without profile in Firestore yet
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    setCurrentUser(null);
    return firebaseSignOut(auth);
  }

  async function getCurrentUserTeamId() {
    if (!currentUser) return null;
    
    try {
      // Find team where user is a member
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      for (const teamDoc of teamsSnapshot.docs) {
        const userRef = doc(db, `teams/${teamDoc.id}/users/${currentUser.uid}`);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          return teamDoc.id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting team ID:', error);
      return null;
    }
  }

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUserTeamId
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}