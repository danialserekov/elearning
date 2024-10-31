import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import Toast from "../plugin/Toast";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import { CartContext } from "../plugin/Context";
import { useAuthStore } from "../../store/auth";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useContext(CartContext);
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));
  
  const userId = user?.user_id

  const fetchWishlist = () => {
    useAxios()
      .get(`student/wishlist/${userId}/`)
      .then((res) => {
        //console.log(res.data);
        setWishlist(res.data);
      });
  };
  const country = GetCurrentAddress()?.country;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const addToCart = async (courseId, userId, price, country, cartId) => {
    const formdata = new FormData();

    formdata.append("course_id", courseId);
    formdata.append("user_id", userId);
    formdata.append("price", price);
    formdata.append("country_name", country);
    formdata.append("cart_id", cartId);

    try {
      await useAxios()
        .post(`course/cart/`, formdata)
        .then((res) => {
          //console.log(res.data);
          Toast().fire({
            title: "Added To Cart",
            icon: "success",
          });

          // Set cart count after adding to cart
          useAxios()
            .get(`course/cart-list/${CartId()}/`)
            .then((res) => {
              setCartCount(res.data?.length);
            });
        });
    } catch (error) {
      console.log(error);
    }
  };

  const addToWishlist = (courseId) => {
    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("course_id", courseId);

    useAxios()
      .post(`student/wishlist/${userId}/`, formdata)
      .then((res) => {
        //console.log(res.data);
        fetchWishlist();
        Toast().fire({
          icon: "success",
          title: res.data.message,
        });
      });
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
              <h4 className="mb-4">
                <i className="fas fa-heart me-2"></i> Wishlist
              </h4>
              <div className="row">
                <div className="col-md-12">
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {wishlist?.length ? (
                      wishlist.map((w, index) => (
                        <div className="col" key={index}>
                          {/* Card */}
                          <div className="card shadow-sm border-1 rounded">
                            <Link to={`/course-detail/${w.course.slug}/`}>
                              <img
                                src={w.course.image}
                                alt={w.course.title}
                                className="card-img-top"
                                style={{
                                  height: "200px",
                                  objectFit: "cover",
                                }}
                              />
                            </Link>
                            {/* Card Body */}
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                  <span className="badge bg-info">{w.course.level}</span>
                                  <span className="badge bg-success ms-2">{w.course.language}</span>
                                </div>
                                <button
                                  onClick={() => addToWishlist(w.course?.id)}
                                  className="border-0 bg-transparent fs-5 text-danger"
                                >
                                  <i className="fas fa-heart" />
                                </button>
                              </div>
                              <h5 className="mb-2 text-truncate">
                                <Link
                                  to={`/course-detail/${w.course.slug}/`}
                                  className="text-dark text-decoration-none"
                                >
                                  {w.course.title}
                                </Link>
                              </h5>
                              <small>By: {w.course?.teacher?.full_name}</small>
                              <br />
                              <small>
                                {w.course.students?.length} Student
                                {w.course.students?.length > 1 && "s"}
                              </small>
                              <div className="lh-1 mt-3 d-flex align-items-center">
                                <span className="fs-6 me-2">
                                  <Rater total={5} rating={w.course.average_rating || 0} />
                                </span>
                                <span className="text-warning">{w.course.average_rating || 0}</span>
                                <span className="fs-6 ms-2">
                                  ({w.course.reviews?.length} Reviews)
                                </span>
                              </div>
                            </div>
                            {/* Card Footer */}
                            <div className="card-footer bg-white border-0">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">${w.course.price}</h5>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addToCart(
                                        w.course.id,
                                        userId,
                                        w.course.price,
                                        country,
                                        CartId()
                                      )
                                    }
                                    className="btn btn-outline-primary me-2"
                                  >
                                    <i className="fas fa-shopping-cart text-primary" />
                                  </button>
                                  <Link
                                    to={`/course-detail/${w.course.slug}/`}
                                    className="btn btn-primary"
                                  >
                                    Enroll Now{" "}
                                    <i className="fas fa-arrow-right text-white" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="mt-4 p-3 text-center">No items in your wishlist.</p>
                    )}
                  </div>
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

export default Wishlist;