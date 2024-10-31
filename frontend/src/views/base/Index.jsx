import { useEffect, useState, useContext, useRef, useMemo } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link, useNavigate } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import useAxios from "../../utils/useAxios";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import Toast from "../plugin/Toast";
import { CartContext } from "../plugin/Context";
import { SearchContext } from "../../utils/SearchContext";
import apiInstance from "../../utils/axios";
import imagePath from "../../assets/Landing.avif";
import { useAuthStore } from "../../store/auth";
import { useCourseStore } from "../../store/courseStore";

function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [cartCount, setCartCount] = useContext(CartContext);
  //console.log("cartCount", cartCount)
  const navigate = useNavigate();

  const { searchQuery } = useContext(SearchContext);
  const courses = useCourseStore((state) => state.courses); // Get courses from Zustand
  const setCourses = useCourseStore((state) => state.setCourses); // Set courses in Zustand
  const courseListRef = useRef(null);
  const mostPopularCoursesRef = useRef(null);

  const country = GetCurrentAddress().country;
  const cartId = CartId();
  const user = useAuthStore((state) => state.user); // Access user data from useAuthStore
  const userId = user?.user_id;
  const fullName = user?.full_name;

  // Fetch courses only if they are not already set
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiInstance.get(`/course/course-list/`);
        setCourses(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setIsLoading(false);
      }
    };

    if (courses.length === 0) {
      fetchCourses();
    } else {
      setIsLoading(false);
    }
  }, [courses.length, setCourses]);

  // Fetch cart count when component mounts
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
  }, [setCartCount]);


  // Define featuredCourses based on the courses fetched from Zustand
  const featuredCourses = useMemo(() => {
    return courses.filter((course) => course.featured);
  }, [courses]);

  const memoizedFilteredCourses = useMemo(() => {
    if (searchQuery) {
      return courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return courses;
  }, [courses, searchQuery]);

  useEffect(() => {
    if (searchQuery && mostPopularCoursesRef.current) {
      mostPopularCoursesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchQuery]);

  useEffect(() => {
    console.log("Search Query:", searchQuery);
    console.log("Filtered Courses:", memoizedFilteredCourses);
    setFilteredCourses(memoizedFilteredCourses);
  }, [memoizedFilteredCourses, searchQuery]);

  const addToCart = async (courseId, userId, price, country, cartId) => {
    if (!userId) {
      Toast().fire({
        title: "Please log in to add items to your cart",
        icon: "warning",
      });
      return navigate("/login"); // Redirect to login if not logged in
    }

    const formdata = new FormData();

    formdata.append("course_id", courseId);
    formdata.append("user_id", userId);
    formdata.append("price", price);
    formdata.append("country_name", country);
    formdata.append("cart_id", cartId);

    try {
      await useAxios().post(`course/cart/`, formdata);
      Toast().fire({
        title: "Added To Cart",
        icon: "success",
      });

      // Set cart count after adding to cart
      const res = await apiInstance.get(`course/cart-list/${CartId()}/`);
      setCartCount(res.data?.length);
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination for Featured Courses
  const featuredItemsPerPage = 4; // 4 items per page for featured courses
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);
  const featuredIndexOfLastItem = featuredCurrentPage * featuredItemsPerPage;
  const featuredIndexOfFirstItem =
    featuredIndexOfLastItem - featuredItemsPerPage;
  const currentFeaturedItems = featuredCourses.slice(
    featuredIndexOfFirstItem,
    featuredIndexOfLastItem
  );
  const totalFeaturedPages = Math.ceil(
    featuredCourses.length / featuredItemsPerPage
  );

  const featuredPageNumbers = Array.from(
    { length: totalFeaturedPages },
    (_, index) => index + 1
  );

  // Pagination for All Courses
  const itemsPerPage = 4; // 4 items per page for all courses
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const addToWishlist = (courseId) => {
    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("course_id", courseId);

    useAxios()
      .post(`student/wishlist/${userId}/`, formdata)
      .then((res) => {
        Toast().fire({
          icon: "success",
          title: res.data.message,
        });
      });
  };

  return (
    <>
      <BaseHeader mostPopularCoursesRef={mostPopularCoursesRef} />

      <section className="mb-5">
        <div className="container mb-lg-8">
          <div className="row mb-3 mt-3">
            <div className="col-12 text-center">
              <h2 className="mb-4 h1 font-weight-bold text-dark">
                {searchQuery ? "Results" : "Our Courses"}
              </h2>
              <p className="text-muted mb-5">
                Explore our curated list of courses designed to enhance your skills.
              </p>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {currentItems?.map((c, index) => (
                  <div className="col" key={index}>
                    <Link to={`/course-detail/${c.course_id}/`} style={{ textDecoration: "none" }}>
                      <div className="card card-hover shadow-lg rounded-3 transition-transform" style={{ border: 'none', background: 'rgba(255, 255, 255, 0.95)' }}>
                        <img
                          src={c.image}
                          alt="course"
                          className="card-img-top rounded-top-3"
                          style={{ width: "100%", height: "200px", objectFit: "cover" }}
                        />
                        <div className="card-body">
                          <h5 className="card-title text-truncate">{c.title}</h5>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <span className="badge bg-dark">{c.level}</span>
                              <span className="badge bg-warning text-dark ms-2">{c.language}</span>
                            </div>
                            <button onClick={() => addToWishlist(c.id)} className="btn btn-link fs-5 text-danger">
                              <i className="fas fa-heart" />
                            </button>
                          </div>
                          <small className="text-muted">By: {c.teacher.full_name}</small>
                          <br />
                          <small className="text-muted">
                            {c.students?.length} Student{c.students?.length > 1 ? 's' : ''}
                          </small>
                          <br />
                          <div className="lh-1 mt-3 d-flex align-items-center">
                            <span className="align-text-top">
                              <span className="fs-6">
                                <Rater total={5} rating={c.average_rating || 0} />
                              </span>
                            </span>
                            <span className="text-warning ms-2">{c.average_rating || 0}</span>
                            <span className="fs-6 ms-2">({c.reviews?.length} Reviews)</span>
                          </div>
                        </div>
                        <div className="card-footer d-flex justify-content-between align-items-center" style={{ background: 'transparent', borderTop: 'none' }}>
                          <div className="d-flex align-items-center">
                            <h5 className="mb-0 text-primary" style={{ fontSize: "1.5rem", fontWeight: "600" }}>${c.price}</h5>
                            {c.discounted_price && (
                              <span className="ms-2 text-danger text-decoration-line-through" style={{ fontSize: "1.2rem" }}>${c.discounted_price}</span>
                            )}
                          </div>
                          <button className="btn btn-outline-primary rounded-pill px-3" style={{ fontSize: "0.9rem" }}>
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {/* Pagination Section */}
              <nav className="d-flex justify-content-center mt-5">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button 
                      className="page-link rounded-pill shadow-sm" 
                      onClick={() => setCurrentPage(currentPage - 1)} 
                      disabled={currentPage === 1}
                      style={{
                        backgroundColor: currentPage === 1 ? "#f0f0f0" : "transparent",
                        color: currentPage === 1 ? "#b0b0b0" : "#333",
                        transition: "background-color 0.3s ease, color 0.3s ease",
                        border: 'none'
                      }}
                    >
                      <i className="ci-arrow-left me-2" />
                      Previous
                    </button>
                  </li>

                  {pageNumbers.map((number) => (
                    <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                      <button 
                        className="page-link rounded-pill shadow-sm" 
                        onClick={() => setCurrentPage(number)} 
                        style={{
                          backgroundColor: currentPage === number ? "#007aff" : "transparent",
                          color: currentPage === number ? "white" : "#007aff",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          border: 'none'
                        }}
                      >
                        {number}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button 
                      className="page-link rounded-pill shadow-sm" 
                      onClick={() => setCurrentPage(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      style={{
                        backgroundColor: currentPage === totalPages ? "#f0f0f0" : "transparent",
                        color: currentPage === totalPages ? "#b0b0b0" : "#333",
                        transition: "background-color 0.3s ease, color 0.3s ease",
                        border: 'none'
                      }}
                    >
                      Next
                      <i className="ci-arrow-right ms-2" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>




      <BaseFooter />
    </>
  );
}

export default Index;
