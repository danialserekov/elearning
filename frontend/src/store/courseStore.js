import { create } from "zustand";

//Store for all the courses available
const useCourseStore = create((set) => ({
  courses: [],

  setCourses: (courses) => set({ courses }),

  addCourse: (course) => set((state) => ({
    courses: [...state.courses, course],
  })),
}));


// Store for purchased courses
const usePurchasedCoursesStore = create((set) => ({
  purchasedCourses: [],

  setPurchasedCourses: (courses) => set({ purchasedCourses: courses }),

  addPurchasedCourse: (course) => set((state) => ({
    purchasedCourses: [...state.purchasedCourses, course],
  })),
}));


export { usePurchasedCoursesStore, useCourseStore };