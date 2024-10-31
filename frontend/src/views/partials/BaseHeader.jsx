/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import { SearchContext } from "../../utils/SearchContext";
import { CartContext } from "../plugin/Context";
import './partials.css'

function BaseHeader({ mostPopularCoursesRef }) {
  const [cartCount, setCartCount] = useContext(CartContext);
  const { user, loading, isLoggedIn } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
    isLoggedIn: state.isLoggedIn(),
  }));
  const [searchInput, setSearchInput] = useState("");
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const navigate = useNavigate();

  //console.log("useAuthStore", isLoggedIn, user);
  useEffect(() => {
    if (loading) {
      // You could show a loading spinner or similar
      console.log("Loading user data...");
    }
  }, [loading]);

  if (loading) {
    return <div>Loading...</div>; // Replace this with a better loading UI
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== "") {
      setSearchQuery(searchInput.toLowerCase());
      navigate("/");
    }
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleFocus = () => {
    if (mostPopularCoursesRef.current) {
      mostPopularCoursesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky-header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <div className="row w-100 align-items-center">
            {/* Brand - First Column */}
            <div className="col-4">
              <Link className="navbar-brand fw-bold" to="/">
                DevBook
              </Link>
            </div>
  
            {/* Search Bar - Second Column */}
            <div className="col-4 d-flex justify-content-center">
              <form
                onSubmit={handleSearch}
                className="d-flex position-relative"
                style={{ width: '300px' }} // Adjust width as needed
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  placeholder="Search courses..."
                  className="form-control rounded-pill border-0 bg-light shadow-sm"
                />
                {searchInput && (
                  <span
                    onClick={handleClearSearch}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#aaa",
                    }}
                  >
                    &times;
                  </span>
                )}
              </form>
            </div>
  
            {/* Menu, Login, Cart - Third Column */}
            <div className="col-4 d-flex justify-content-end">
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
  
              <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent" >
                <ul className="navbar-nav me-2 mb-2 mb-lg-0">
                  {isLoggedIn && (
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle fw-semibold text-white"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Menu
                      </a>
                      <ul className="dropdown-menu dropdown-menu-dark shadow-lg rounded">
                        {user?.teacher_id > 0 ? (
                          <>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/dashboard/`}>
                                Dashboard
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/courses/`}>
                                My Courses
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/create-course/`}>
                                Create Course
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/quizzes/`}>
                                Quizzes
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/create-quiz/`}>
                                Create Quiz
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/reviews/`}>
                                Reviews
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/question-answer/`}>
                                Q/A
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/students/`}>
                                Students
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/earning/`}>
                                Earning
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/instructor/profile/`}>
                                Profile
                              </Link>
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <Link className="dropdown-item" to={`/student/dashboard/`}>
                                Dashboard
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/student/courses/`}>
                                My Courses
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/student/wishlist/`}>
                                Wishlist
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/student/question-answer/`}>
                                Q/A
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to={`/student/profile/`}>
                                Profile
                              </Link>
                            </li>
                          </>
                        )}
                      </ul>
                    </li>
                  )}
                </ul>
  
                {/* Cart and Auth Buttons on the right */}
                <div className="d-flex">
                  {isLoggedIn && (
                    <Link className="btn btn-outline-warning ms-2" to="/cart/">
                      My Cart ({cartCount}) <i className="fas fa-shopping-cart" />
                    </Link>
                  )}
                  {isLoggedIn ? (
                    <Link to="/logout/" className="btn btn-outline-danger ms-2">
                      Logout
                    </Link>
                  ) : (
                    <>
                      <Link to="/login/" className="btn btn-outline-primary ms-2">
                        Login
                      </Link>
                      <Link to="/register/" className="btn btn-outline-success ms-2">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
  
  
  
}

export default BaseHeader;