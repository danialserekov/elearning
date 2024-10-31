import { useState, useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import { CartContext, ProfileContext } from "./views/plugin/Context";
import apiInstance from "./utils/axios";
import CartId from "./views/plugin/CartId";
import { AuthProvider } from "./utils/AuthContext";
import { SearchProvider } from "./utils/SearchContext";
import { useCourseStore } from "./store/courseStore";

import MainWrapper from "./layouts/MainWrapper";
import PrivateRoute from "./layouts/PrivateRoute";

import Register from "../src/views/auth/Register";
import Login from "../src/views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreateNewPassword from "./views/auth/CreateNewPassword";

import Index from "./views/base/Index";
import CourseDetail from "./views/base/CourseDetail";
import Cart from "./views/base/Cart";
import Checkout from "./views/base/Checkout";
import Success from "./views/base/Success";
import Search from "./views/base/Search";

import StudentDashboard from "./views/student/Dashboard";
import StudentCourses from "./views/student/Courses";
import StudentCourseDetail from "./views/student/CourseDetail";
import Wishlist from "./views/student/Wishlist";
import StudentProfile from "./views/student/Profile";
import StudentChangePassword from "./views/student/ChangePassword";
import Dashboard from "./views/instructor/Dashboard";
import Courses from "./views/instructor/Courses";
import Review from "./views/instructor/Review";
import Students from "./views/instructor/Students";
import Earning from "./views/instructor/Earning";
import Orders from "./views/instructor/Orders";
import Coupon from "./views/instructor/Coupon";
import TeacherNotification from "./views/instructor/TeacherNotification";
import QA from "./views/instructor/QA";
import ChangePassword from "./views/instructor/ChangePassword";
import Profile from "./views/instructor/Profile";
import CourseCreate from "./views/instructor/CourseCreate";
import CourseEdit from "./views/instructor/CourseEdit";
import InstructorCourseDetail from "./views/instructor/InstructorCourseDetail";
import EditQuiz from "./views/instructor/EditQuiz";

// Import the new Quiz components
import QuizCreate from "./views/instructor/QuizCreate";
import Quizzes from "./views/instructor/Quizzes";
import QuizDetail from "./views/instructor/QuizDetail";
import StudentQuiz from "./views/student/StudentQuiz";

// Import the Zustand store for profile
import { useProfileStore } from "./store/useProfileStore";
import { useAuthStore } from "./store/auth";

function App() {
  const [cartCount, setCartCount] = useState(0);
  const userId = useAuthStore((state) => state.user?.user_id); 
  const fetchProfile = useProfileStore((state) => state.fetchProfile); 
  const setCourses = useCourseStore((state) => state.setCourses);
  const courses = useCourseStore((state) => state.courses);
  
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await apiInstance.get(`course/cart-list/${CartId()}/`);
        setCartCount(response.data?.length);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();

    if (userId) {
      fetchProfile(userId);
    }

    if (courses.length === 0) { // Only fetch courses if they haven't been fetched yet
      const fetchCourses = async () => {
        try {
          const response = await apiInstance.get(`/course/course-list/`);
          setCourses(response.data);
        } catch (error) {
          console.error("Failed to fetch courses:", error);
        }
      };

      fetchCourses();
    }
  }, [userId, fetchProfile, courses.length, setCourses]);

  return (
    <BrowserRouter>
      <SearchProvider>
        <CartContext.Provider value={[cartCount, setCartCount]}>
          <MainWrapper>
            <Routes>
              <Route path="/register/" element={<Register />} />
              <Route path="/login/" element={<Login />} />
              <Route path="/logout/" element={<Logout />} />
              <Route path="/forgot-password/" element={<ForgotPassword />} />
              <Route
                path="/create-new-password/"
                element={<CreateNewPassword />}
              />

              {/* Base Routes */}
              <Route path="/" element={<Index />} />
              <Route
                path="/course-detail/:course_id/"
                element={<CourseDetail />}
              />
              <Route path="/cart/" element={<Cart />} />
              <Route path="/checkout/:order_oid/" element={<Checkout />} />
              <Route
                path="/payment-success/:order_oid/"
                element={<Success />}
              />
              <Route path="/search/" element={<Search />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard/"
                element={<StudentDashboard />}
              />
              <Route path="/student/courses/" element={<StudentCourses />} />
              <Route
                path="/student/courses/:enrollment_id/"
                element={<StudentCourseDetail />}
              />
              <Route path="/student/wishlist/" element={<Wishlist />} />
              <Route path="/student/profile/" element={<StudentProfile />} />
              <Route
                path="/student/change-password/"
                element={<StudentChangePassword />}
              />

              {/* Teacher Routes */}
              <Route path="/instructor/dashboard/" element={<Dashboard />} />
              <Route path="/instructor/courses/" element={<Courses />} />
              <Route path="/instructor/reviews/" element={<Review />} />
              <Route path="/instructor/students/" element={<Students />} />
              <Route path="/instructor/earning/" element={<Earning />} />
              <Route path="/instructor/orders/" element={<Orders />} />
              <Route path="/instructor/coupon/" element={<Coupon />} />
              <Route
                path="/instructor/notifications/"
                element={<TeacherNotification />}
              />
              <Route path="/instructor/question-answer/" element={<QA />} />
              <Route
                path="/instructor/change-password/"
                element={<ChangePassword />}
              />
              <Route path="/instructor/profile/" element={<Profile />} />
              <Route
                path="/instructor/create-course/"
                element={<CourseCreate />}
              />
              <Route
                path="/instructor/edit-course/:course_id/"
                element={<CourseEdit />}
              />
              <Route
                path="/instructor/courses/:course_id/"
                element={<InstructorCourseDetail />}
              />

              {/* New Quiz Routes */}
                <Route
                  path="/instructor/create-quiz/"
                  element={<QuizCreate />}
                />
              <Route path="/instructor/quizzes/" element={<Quizzes />} />
              <Route
                path="/instructor/quiz-detail/:quizId"
                element={<QuizDetail />}
              />
                <Route
                  path="/instructor/edit-quiz/:quizId/"
                  element={<EditQuiz />}
                />

              <Route
                path="/student/quiz/:quizId/"
                element={<StudentQuiz />}
              />
            </Routes>
          </MainWrapper>
        </CartContext.Provider>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;