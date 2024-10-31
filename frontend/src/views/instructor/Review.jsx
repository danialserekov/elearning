import { useState, useEffect } from "react";
import moment from "moment";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";


import Toast from "../plugin/Toast";

function Review() {
  const [reviews, setReviews] = useState([]);
  const [reply, setReply] = useState("");
  const [filteredReviews, setFilteredReview] = useState([]);
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));

  const teacherId = user?.teacher_id
  //console.log("teacherId", user, teacherId)
  const fetchReviewsData = () => {
    useAxios()
      .get(`teacher/review-lists/${teacherId}/`)
      .then((res) => {
        setReviews(res.data);
        setFilteredReview(res.data);
      });
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const handleSubmitReply = async (reviewId) => {
    try {
      await useAxios()
        .patch(`teacher/review-detail/${teacherId}/${reviewId}/`, {
          reply: reply,
        })
        .then((res) => {
          fetchReviewsData();
          Toast().fire({
            icon: "success",
            title: "Reply sent.",
          });
          setReply("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSortByDate = (e) => {
    const sortValue = e.target.value;
    let sortedReview = [...filteredReviews];
    if (sortValue === "Newest") {
      sortedReview.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      sortedReview.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredReview(sortedReview);
  };

  const handleSortByRatingChange = (e) => {
    const rating = parseInt(e.target.value);
    if (rating === 0) {
      fetchReviewsData();
    } else {
      const filtered = reviews.filter((review) => review.rating === rating);
      setFilteredReview(filtered);
    }
  };

  const handleFilterByCourse = (e) => {
    const query = e.target.value.toLowerCase();
    if (query === "") {
      fetchReviewsData();
    } else {
      const filtered = reviews.filter((review) => {
        return review.course.title.toLowerCase().includes(query);
      });
      setFilteredReview(filtered);
    }
  };
  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
  <div className="container">
    {/* Header Here */}
    <Header />
    <div className="row mt-0 mt-md-4">
      {/* Sidebar Here */}
      <Sidebar />
      <div className="col-lg-9 col-md-8 col-12">
        {/* Card */}
        <div className="card mb-4 shadow border-0">
          {/* Card header */}
          <div className="card-header d-flex align-items-center justify-content-between bg-light">
            <div>
              <h3 className="mb-0">Reviews</h3>
              <p className="mb-0 text-muted">
                You have full control to manage your own account settings.
              </p>
            </div>
          </div>
          {/* Card body */}
          <div className="card-body">
            {/* Search and Filter Form */}
            <form className="row mb-4 gx-2">
              <div className="col-xl-7 col-lg-6 col-md-4 col-12 mb-2 mb-lg-0">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search By Course"
                  onChange={handleFilterByCourse}
                />
              </div>
              <div className="col-xl-2 col-lg-2 col-md-4 col-12 mb-2 mb-lg-0">
                <select className="form-select" onChange={handleSortByRatingChange}>
                  <option value={0}>Rating</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-4 col-12 mb-2 mb-lg-0">
                <select className="form-select" onChange={handleSortByDate}>
                  <option value="">Sort by</option>
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                </select>
              </div>
            </form>
            {/* Reviews List */}
            <ul className="list-group list-group-flush">
              {filteredReviews?.length > 0 ? (
                filteredReviews.map((r, index) => (
                  <li className="list-group-item p-4 shadow-sm rounded-3 mb-4" key={index}>
                    <div className="d-flex">
                      <img
                        src={r.profile?.image}
                        alt="avatar"
                        className="rounded-circle avatar-lg"
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="ms-3 mt-2 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h4 className="mb-0">{r.profile?.full_name}</h4>
                            <small className="text-muted">
                              {moment(r.date).format("DD MMM, YYYY")}
                            </small>
                          </div>
                          <a
                            href="#"
                            data-bs-toggle="tooltip"
                            data-placement="top"
                            title="Report Abuse"
                            className="text-danger"
                          >
                            <i className="fe fe-flag" />
                          </a>
                        </div>
                        <div className="mt-2">
                          <Rater total={5} rating={r?.rating || 0} />
                          <span className="h5 mx-1">for {r.course?.title}</span>
                          <p className="mt-2">
                            <strong>Review: </strong>
                            {r.review}
                          </p>
                          <p>
                            <strong>Response: </strong>
                            {r.reply || "No Reply"}
                          </p>
                          <button
                            className="btn btn-outline-secondary mt-2"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${r.id}`}
                            aria-expanded="false"
                            aria-controls={`collapse${r.id}`}
                          >
                            Send Response
                          </button>
                          <div className="collapse mt-2" id={`collapse${r.id}`}>
                            <div className="card card-body">
                              <div className="mb-3">
                                <label htmlFor={`response${r.id}`} className="form-label">
                                  Write Response
                                </label>
                                <textarea
                                  id={`response${r.id}`}
                                  className="form-control"
                                  rows="4"
                                  value={reply}
                                  onChange={(e) => setReply(e.target.value)}
                                ></textarea>
                              </div>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                onClick={() => handleSubmitReply(r.id)}
                              >
                                Send Response <i className="fas fa-paper-plane"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="mt-4 p-3 text-center">
                  <div className="alert alert-warning" role="alert">
                    No reviews yet
                  </div>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      <BaseFooter />
    </>
  );
}

export default Review;