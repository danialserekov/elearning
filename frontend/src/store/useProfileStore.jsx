// store/profileStore.js
import { create } from 'zustand';
import useAxios from '../utils/useAxios';

const useProfileStore = create((set, get) => ({
  profile: null, // Initial profile state
  loading: true, // Loading state

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const res = await useAxios().get(`user/profile/${userId}/`);
      set({ profile: res.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      set({ loading: false });
    }
  },
}));

export { useProfileStore };