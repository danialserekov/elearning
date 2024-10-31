import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

// Utility to fetch user data (can be from API or localStorage)
const fetchUserData = async () => {
  // Simulate fetching from localStorage or an API
  const user = JSON.parse(localStorage.getItem("user")) || null;
  console.log('user-loaclStorage', user)
  return user;
};
//console.log(user)
const useAuthStore = create((set, get) => ({
  user: null, // Store the user data directly
  loading: true, // Start with loading true until we fetch user data

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },
  
  setLoading: (loading) => set({ loading }),
  
  
  isLoggedIn: () => get().user !== null && get().user !== undefined,

  initializeUser: () => {
    set({ loading: true });
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      set({ user, loading: false });
    } else {
      set({ loading: false });
    }
  },
}));

// Initialize user data when the store is first used
useAuthStore.getState().initializeUser();

if (import.meta.env.DEV) {
  //console.log("useAuthStore==", useAuthStore)
  mountStoreDevtool("AuthStore", useAuthStore);
}

export { useAuthStore };