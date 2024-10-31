import { useState, useEffect } from "react";
import moment from "moment";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import useAxios from "../../utils/useAxios";
import Toast from "../plugin/Toast";
import { useAuthStore } from "../../store/auth";

function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [createCoupon, setCreateCoupon] = useState({ code: "", discount: 0 });
  const [selectedCoupon, setSelectedCoupon] = useState([]);

  const [show, setShow] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const user = useAuthStore((state) => state.user); // Access user data from useAuthStore
  const teacherId = user?.teacher_id;
  //console.log("teacherId", teacherId)
  const handleClose = () => setShow(false);
  const handleShow = (coupon) => {
    setShow(true);
    setSelectedCoupon(coupon);
  };

  const handleAddCouponClose = () => setShowAddCoupon(false);
  const handleAddCouponShow = () => setShowAddCoupon(true);

  // const fetchCoupons = () => {
  //   useAxios()
  //     .get(`teacher/coupon-list/${teacherId}/`)
  //     .then((res) => {
  //       setCoupons(res.data);
  //     });
  // };
  const fetchCoupons = () => {
    const axiosInstance = useAxios();
    return axiosInstance
      .get(`teacher/coupon-list/${teacherId}/`)
      .then((res) => {
        setCoupons(res.data);
      })
      .catch((error) => {
        console.error('Error fetching coupons:', error);
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCouponChange = (event) => {
    setCreateCoupon({
      ...createCoupon,
      [event.target.name]: event.target.value,
    });
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();

    const formdata = new FormData();

    formdata.append("teacher", teacherId);
    formdata.append("code", createCoupon.code);
    formdata.append("discount", createCoupon.discount);

    useAxios()
      .post(`teacher/coupon-list/${teacherId}/`, formdata)
      .then((res) => {
        fetchCoupons();
        handleAddCouponClose();
        Toast().fire({
          icon: "success",
          title: "Coupon created successfully",
        });
      });
  };

  const handleDeleteCoupon = (couponId) => {
    useAxios()
      .delete(`teacher/coupon-detail/${teacherId}/${couponId}/`)
      .then((res) => {
        fetchCoupons();
        Toast().fire({
          icon: "success",
          title: "Coupon deleted successfully",
        });
      });
  };

  const handleCouponUpdateSubmit = (e) => {
    e.preventDefault();

    const formdata = new FormData();

    formdata.append("teacher", teacherId);
    formdata.append("code", createCoupon.code);
    formdata.append("discount", createCoupon.discount);

    useAxios()
      .patch(
        `teacher/coupon-detail/${teacherId}/${selectedCoupon.id}/`,
        formdata
      )
      .then((res) => {
        fetchCoupons();
        handleClose();
        Toast().fire({
          icon: "success",
          title: "Coupon updated successfully",
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
              {/* Card */}
              <div className="card mb-4">
                {/* Card header */}
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">Coupons</h3>
                    <span>Manage all your coupons from here</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddCouponShow}
                  >
                    Add Coupon
                  </button>
                </div>
                {/* Card body */}
                <div className="card-body">
                  {/* List group */}
                  {coupons.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {/* List group item */}
                      {coupons?.map((c, index) => (
                        <li
                          className="list-group-item p-4 shadow rounded-3 mb-3"
                          key={index}
                        >
                          <div className="d-flex">
                            <div className="ms-3 mt-2">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <h4 className="mb-0">{c.code}</h4>
                                  <span>{c.used_by} Student</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="mt-2">
                                  <span className="me-2 fw-bold">
                                    Discount:{" "}
                                    <span className="fw-light">
                                      {c.discount}% Discount
                                    </span>
                                  </span>
                                </p>
                                <p className="mt-1">
                                  <span className="me-2 fw-bold">
                                    Date Created:{" "}
                                    <span className="fw-light">
                                      {moment(c.date).format("DD MMM, YYYY")}
                                    </span>
                                  </span>
                                </p>
                                <p>
                                  <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => handleShow(c)}
                                  >
                                    Update Coupon
                                  </button>

                                  <button
                                    className="btn btn-danger ms-2"
                                    type="button"
                                    onClick={() => handleDeleteCoupon(c.id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      className="alert alert-warning text-center"
                      role="alert"
                    >
                      No coupons created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Update Coupon -{" "}
            <span className="fw-bold">{selectedCoupon.code}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCouponUpdateSubmit}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Code
              </label>
              <input
                type="text"
                placeholder="Code"
                defaultValue={selectedCoupon.code}
                className="form-control"
                name="code"
                onChange={handleCreateCouponChange}
              />
              <label htmlFor="exampleInputEmail1" className="form-label mt-3">
                Discount
              </label>
              <input
                type="text"
                placeholder="Discount"
                defaultValue={selectedCoupon.discount}
                className="form-control"
                name="discount"
                onChange={handleCreateCouponChange}
                id=""
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Update Coupon <i className="fas fa-check-circle"> </i>
            </button>

            <Button className="ms-2" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showAddCoupon} onHide={handleAddCouponClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCouponSubmit}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Code
              </label>
              <input
                type="text"
                placeholder="Code"
                value={createCoupon.code}
                className="form-control"
                name="code"
                onChange={handleCreateCouponChange}
              />
              <label htmlFor="exampleInputEmail1" className="form-label mt-3">
                Discount
              </label>
              <input
                type="text"
                placeholder="Discount"
                value={createCoupon.discount}
                className="form-control"
                name="discount"
                onChange={handleCreateCouponChange}
                id=""
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Coupon <i className="fas fa-plus"> </i>
            </button>

            <Button
              className="ms-2"
              variant="secondary"
              onClick={handleAddCouponClose}
            >
              Close
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <BaseFooter />
    </>
  );
}

export default Coupon;