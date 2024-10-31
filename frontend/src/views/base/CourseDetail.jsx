/* eslint-disable react/jsx-key */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchasedCoursesStore } from "../../store/courseStore"; // Import the Zustand store

import { Link } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import Toast from "../plugin/Toast";
import { CartContext } from "../plugin/Context";
import apiInstance from "../../utils/axios";
import { useAuthStore } from "../../store/auth";

function CourseDetail() {
  const navigate = useNavigate();
  const [course, setCourse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartBtn, setAddToCartBtn] = useState("Add To Cart");
  const [cartCount, setCartCount] = useContext(CartContext);
  const [selectedVideo, setSelectedVideo] = useState(null);
  //const country = GetCurrentAddress()
  // const [profile, setProfile] = useContext(ProfileContext);
  const { course_id } = useParams();

  const country = GetCurrentAddress().country;
  const { user } = useAuthStore((state) => ({ user: state.user })); // Access user data from useAuthStore
  const userId = user?.user_id;

  const purchasedCourses = usePurchasedCoursesStore(
    (state) => state.purchasedCourses
  );
  console.log("purchasedCourses", purchasedCourses);
  const setPurchasedCourses = usePurchasedCoursesStore(
    (state) => state.setPurchasedCourses
  );

  console.log("user", user);
  useEffect(() => {
    fetchCourse();
    if (userId) {
      fetchPurchasedCourses();
    }
  }, [course_id, userId]);

  const fetchPurchasedCourses = async () => {
    try {
      const response = await useAxios().get(`student/course-list/${userId}/`);
      setPurchasedCourses(response.data);
    } catch (error) {
      console.log("Failed to fetch purchased courses:", error);
    }
  };

  const isCoursePurchased = () => {
    return purchasedCourses.some(
      (purchasedCourse) => purchasedCourse.course_id === course.id
    );
  };

  const enrollNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("course_id", course.id);
    formData.append("user_id", userId);
    formData.append("price", course.price);
    formData.append("country_name", country);
    formData.append("cart_id", CartId());

    try {
      const response = await useAxios().post(`course/cart/`, formData);
      // Set cart count after adding to cart
      apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
        setCartCount(res.data?.length);
        //setAddToCartBtn("Added To Cart");
      });
      navigate("/cart/");
    } catch (error) {
      console.log(error);
      setAddToCartBtn("Add To Cart");
    }
  };

  const fetchCourse = async () => {
    try {
      const response = user
        ? await useAxios().get(`/course/course-detail/${course_id}/`)
        : await apiInstance.get(`/course/course-detail/${course_id}/`);
      setCourse(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("course_id", course.id);
    formData.append("user_id", userId);
    formData.append("price", course.price);
    formData.append("country_name", country);
    formData.append("cart_id", CartId());

    try {
      const response = await useAxios().post(`course/cart/`, formData);
      Toast().fire({
        title: "Added To Cart",
        icon: "success",
      });

      // Set cart count after adding to cart
      apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
        setCartCount(res.data?.length);
        setAddToCartBtn("Added To Cart");
      });
    } catch (error) {
      console.log(error);
      setAddToCartBtn("Add To Cart");
    }
  };

  const handlePlayClick = (videoUrl) => {
    //console.log("videoUrl", videoUrl)
    setSelectedVideo(videoUrl);
  };

  return (
    <>
      <BaseHeader />

      <>
        {isLoading === true ? (
          <p>
            Loading <i className="fas fa-spinner fa-spin"></i>
          </p>
        ) : (
          <>
            <section className="pb-0 py-lg-5">
              <div className="container">
                <div className="row">
                  <div className="col-lg-8">
                    <h1 className="mb-3">{course.title}</h1>
                    <p className="mb-3" dangerouslySetInnerHTML={{__html: `${course?.description?.slice()}`,}}></p>
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                        <i className="fas fa-star text-warning me-2" />{course.average_rating}/5
                      </li>
                      <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                        <i className="fas fa-user-graduate text-orange me-2" />{course.students?.length} Enrolled
                      </li>
                      <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                        <i className="fas fa-signal text-success me-2" />{course.level}
                      </li>
                      <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                        <i className="bi bi-patch-exclamation-fill text-danger me-2" />{moment(course.date).format("DD MMM, YYYY")}
                      </li>
                      <li className="list-inline-item h6 mb-0">
                        <i className="fas fa-globe text-info me-2" />{course.language}
                      </li>
                    </ul>

                    <br/>

                    
                    <div className="card shadow-sm rounded-3 overflow-hidden border-0">
  <div className="card-header border-bottom-0 bg-light">
    <ul className="nav nav-pills nav-tabs-line justify-content-center py-2" id="course-pills-tab" role="tablist">
      <li className="nav-item me-4" role="presentation">
        <button className="nav-link fw-semibold" id="course-pills-tab-2" data-bs-toggle="pill" data-bs-target="#course-pills-2" type="button" role="tab" aria-controls="course-pills-2" aria-selected="false">Curriculum</button>
      </li>
      <li className="nav-item me-4" role="presentation">
        <button className="nav-link fw-semibold" id="course-pills-tab-3" data-bs-toggle="pill" data-bs-target="#course-pills-3" type="button" role="tab" aria-controls="course-pills-3" aria-selected="false">Instructor</button>
      </li>
      <li className="nav-item me-4" role="presentation">
        <button className="nav-link fw-semibold" id="course-pills-tab-4" data-bs-toggle="pill" data-bs-target="#course-pills-4" type="button" role="tab" aria-controls="course-pills-4" aria-selected="false">Reviews</button>
      </li>
    </ul>
  </div>
  <div className="card-body p-4">
    <div className="tab-content pt-3" id="course-pills-tabContent">
      {/* Curriculum Tab */}
      <div className="tab-pane fade" id="course-pills-2" role="tabpanel" aria-labelledby="course-pills-tab-2">
        <div className="accordion" id="accordionExample2">
          {course?.curriculum?.map((c) => (
            <div className="accordion-item mb-3" key={c.id}>
              <h6 className="accordion-header" id={`heading-${c.id}`}>
                <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${c.variant_id}`} aria-expanded="true" aria-controls={`collapse-${c.variant_id}`}>
                  {c.title}
                </button>
              </h6>
              <div id={`collapse-${c.variant_id}`} className="accordion-collapse collapse" aria-labelledby={`heading-${c.id}`} data-bs-parent="#accordionExample2">
                <div className="accordion-body mt-2">
                  {c.variant_items?.map((l) => (
                    <div className="d-flex justify-content-between align-items-center" key={l.id}>
                      <div className="d-flex align-items-center">
                        <button
                          className={`btn btn-${l.preview ? "primary" : "secondary"} btn-icon mb-0`}
                          onClick={() => { if (l.preview) handlePlayClick(l.file); }}
                          disabled={!l.preview}
                        >
                          <i className={`fas fa-${l.preview ? "play" : "lock"}`} />
                        </button>
                        <span className="ms-3 text-truncate h6">{l.title}</span>
                      </div>
                      <span className="text-muted">{c.content_duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructor Tab */}
      <div className="tab-pane fade" id="course-pills-3" role="tabpanel" aria-labelledby="course-pills-tab-3">
        <div className="card shadow-sm mb-4">
          <div className="row g-0 align-items-center">
            <div className="col-md-3 text-center">
              <img
                src={course.teacher?.image}
                className="img-fluid rounded-circle border border-light shadow-sm"
                alt="Instructor"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src="http://127.0.0.1:8000/media/user_folder/66972e567f990_download_5gVFg07.jpg"; 
                }}
              />
            </div>
            <div className="col-md-9">
              <div className="card-body">
                <h3 className="card-title mb-0">{course.teacher?.full_name}</h3>
                <p className="text-muted">{course.teacher?.bio}</p>
                <div className="mt-3">
                  <h6>Connect with the Instructor:</h6>
                  <ul className="list-inline mb-3">
                                      <li className="list-inline-item me-3">
                                        <a
                                          href={course.teacher?.twitter}
                                          className="fs-5 text-twitter"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <i className="fab fa-twitter-square" />
                                        </a>
                                      </li>
                                      <li className="list-inline-item me-3">
                                        <a
                                          href={course.teacher?.facebook}
                                          className="fs-5 text-facebook"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <i className="fab fa-facebook-square" />
                                        </a>
                                      </li>
                                      <li className="list-inline-item me-3">
                                        <a
                                          href={course.teacher?.linkedin}
                                          className="fs-5 text-linkedin"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <i className="fab fa-linkedin" />
                                        </a>
                                      </li>
                                    </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h5 className="mb-3">About Instructor</h5>
        <p className="text-muted">{course.teacher?.about}</p>
      </div>

      {/* Reviews Tab */}
      <div className="tab-pane fade" id="course-pills-4" role="tabpanel" aria-labelledby="course-pills-tab-4">
        <h5 className="mb-4">Student Reviews</h5>
        {/* Display reviews dynamically here */}
        <div className="mt-2">
          <h5 className="mb-4">Leave a Review</h5>
          <form className="row g-3">
            <div className="col-12">
              <select id="inputState2" className="form-select">
                <option selected="">★★★★★ (5/5)</option>
                <option>★★★★☆ (4/5)</option>
                <option>★★★☆☆ (3/5)</option>
                <option>★★☆☆☆ (2/5)</option>
                <option>★☆☆☆☆ (1/5)</option>
              </select>
            </div>
            <div className="col-12">
              <textarea className="form-control" id="exampleFormControlTextarea1" placeholder="Your review" rows={3} defaultValue={""} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary mb-0">Post Review</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

                  </div>
                  {/* Modal for video playback */}
                  {selectedVideo && (
                    <div
                      className="modal fade show"
                      tabIndex="-1"
                      style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Curriculum Video</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setSelectedVideo(null)}
                            />
                          </div>
                          <div className="modal-body">
                            <video width="100%" controls>
                              <source src={selectedVideo} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setSelectedVideo(null)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Main content END */}
                  {/* Right sidebar START */}
                  <div className="col-lg-4 pt-5 pt-lg-0">
                    <div className="row mb-5 mb-lg-0">
                      <div className="col-md-6 col-lg-12">
                        {/* Video START */}
                        <div className="card shadow-lg mb-4 rounded-4 overflow-hidden" style={{ border: 'none', backgroundColor: '#ffffff' }}>
                          {/* Course Image and Video Button */}
                          <div className="position-relative">
                            <img
                              src={course.image}
                              className="card-img-top"
                              alt="course image"
                              style={{ height: 'auto', objectFit: 'cover' }}
                            />
                            <div
                              className="position-absolute top-50 start-50 translate-middle text-center rounded-3 p-3"
                              style={{ backgroundColor: "rgba(237, 237, 237, 0.8)" }}
                            >
                              <a
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                className="btn btn-lg text-danger btn-round shadow-sm mb-0"
                                data-glightbox=""
                                data-gallery="course-video"
                                style={{ borderRadius: '50%', padding: '0.5rem 1.25rem' }}
                              >
                                <i className="fas fa-play" />
                              </a>
                              <span className="fw-bold d-block mt-2">Course Introduction Video</span>
                            </div>
                          </div>

                          {/* Modal for Course Video */}
                          <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h1 className="modal-title fs-5" id="exampleModalLabel">Introduction Videos</h1>
                                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                </div>
                                <div className="modal-body">
                                  <video width="100%" controls>
                                    <source src={course.file} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                                <div className="modal-footer">
                                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="card-body px-4 py-3">
                            {/* Price and Share Button */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h3 className="fw-bold mb-0">${course.price}</h3>
                              <div className="dropdown">
                                <a
                                  href="#"
                                  className="btn btn-sm btn-outline-primary rounded-circle p-2 shadow-sm"
                                  role="button"
                                  id="dropdownShare"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  title="Share"
                                >
                                  <i className="fas fa-fw fa-share-alt" />
                                </a>
                                <ul className="dropdown-menu bg-light dropdown-menu-end shadow-lg rounded border-0 mt-2">
                                  {['Twitter', 'Facebook', 'LinkedIn', 'Copy link'].map((platform) => (
                                    <li key={platform}>
                                      <a
                                        className="dropdown-item d-flex align-items-center"
                                        href="#"
                                        onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
                                        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
                                      >
                                        <i className={`fab fa-${platform.toLowerCase()}-square me-2 text-primary`} />
                                        {platform}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-between">
                              {isCoursePurchased() ? (
                                <button type="button" className="btn btn-secondary w-100 me-2" disabled>
                                  <i className="fas fa-check-circle"></i> Already Purchased
                                </button>
                              ) : (
                                <>
                                  {addToCartBtn === "Add To Cart" && (
                                    <button
                                      type="button"
                                      className="btn btn-primary w-100 me-2"
                                      onClick={() => addToCart(course?.id, userId, course.price, country, CartId())}
                                    >
                                      <i className="fas fa-shopping-cart"></i> Add To Cart
                                    </button>
                                  )}
                                  {addToCartBtn === "Added To Cart" && (
                                    <button disabled type="button" className="btn btn-primary w-100 me-2">
                                      <i className="fas fa-shopping-cart"></i> Added To Cart
                                    </button>
                                  )}
                                  <button
                                    onClick={enrollNow}
                                    className="btn btn-success w-100"
                                  >
                                    Enroll Now <i className="fas fa-arrow-right"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Video END */}
                        {/* Course info START */}
                        <div className="card card-body shadow-lg p-4 mb-4 rounded-3" style={{ backgroundColor: '#f9f9f9' }}>
                          {/* Title */}
                          <h4 className="mb-4 text-center" style={{ fontWeight: '600', fontSize: '1.5rem', color: '#333' }}>
                            This Course Includes
                          </h4>
                          <ul className="list-group">
                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                              <span className="h6 fw-normal mb-0" style={{ color: '#555' }}>
                                <i className="fas fa-fw fa-book-open text-primary me-2" />
                                Lectures
                              </span>
                              <span className="text-muted" style={{ fontWeight: '500' }}>
                                {
                                  course?.curriculum?.reduce((total, c) => {
                                    return total + (c.variant_items?.length || 0);
                                  }, 0)
                                }
                              </span>
                            </li>
                            <li className="list-group-item d-none d-flex justify-content-between align-items-center py-3">
                              <span className="h6 fw-normal mb-0" style={{ color: '#555' }}>
                                <i className="fas fa-fw fa-clock text-primary me-2" />
                                Duration
                              </span>
                              <span className="text-muted" style={{ fontWeight: '500' }}>4h 50m</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                              <span className="h6 fw-normal mb-0" style={{ color: '#555' }}>
                                <i className="fas fa-fw fa-signal text-primary me-2" />
                                Skills
                              </span>
                              <span className="text-muted" style={{ fontWeight: '500' }}>Beginner</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                              <span className="h6 fw-normal mb-0" style={{ color: '#555' }}>
                                <i className="fas fa-fw fa-globe text-primary me-2" />
                                Language
                              </span>
                              <span className="text-muted" style={{ fontWeight: '500' }}>English</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                              <span className="h6 fw-normal mb-0" style={{ color: '#555' }}>
                                <i className="fas fa-fw fa-user-clock text-primary me-2" />
                                Published
                              </span>
                              <span className="text-muted" style={{ fontWeight: '500' }}>
                                {moment(course.date).format("DD MMM, YYYY")}
                              </span>
                            </li>
                          </ul>
                        </div>


                        {/* Course info END */}
                      </div>
                    </div>
                    {/* Row End */}
                  </div>
                  {/* Right sidebar END */}
                </div>
                {/* Row END */}
              </div>
            </section>
          </>
        )}
      </>

      <BaseFooter />
    </>
  );
}

export default CourseDetail;