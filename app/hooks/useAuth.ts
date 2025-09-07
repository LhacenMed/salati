import { useState, useEffect } from "react";
// import { User, onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../firebase/config";

export function useAuth() {
  // const [user, setUser] = useState<User | null>(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setUser(user);
    //   setIsLoading(false);
    // });

    // return unsubscribe;
  }, []);

  return { user, isLoading };
}
