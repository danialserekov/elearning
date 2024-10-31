import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function Earning() {
  const [stats, setStats] = useState([]);
  const [earning, setEarning] = useState([]);
  const [bestSellingCourse, setBestSellingCourse] = useState([]);
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));
  const teacherId = user?.teacher_id;

  useEffect(() => {
    useAxios()
      .get(`teacher/summary/${teacherId}/`)
      .then((res) => {
        setStats(res.data[0]);
      });

    useAxios()
      .get(`teacher/all-months-earning/${teacherId}/?interval=month`)
      .then((res) => {
        setEarning(res.data);
      });

    useAxios()
      .get(`teacher/best-course-earning/${teacherId}/`)
      .then((res) => {
        setBestSellingCourse(res.data);
      });
  }, []);
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
        {/* Overview Card */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body text-center">
            <h3 className="mb-0">Earnings</h3>
            <p className="text-muted mb-0">
              You have full control to manage your own account settings.
            </p>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Earnings Overview</h4>
            <div className="dropdown dropstart">
              <a
                className="btn-icon btn btn-ghost btn-sm rounded-circle"
                href="#"
                role="button"
                id="paymentDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fe fe-more-vertical" />
              </a>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="paymentDropdown">
                <span className="dropdown-header">Settings</span>
                <a className="dropdown-item" href="#">
                  30 Days
                </a>
                <a className="dropdown-item" href="#">
                  2 Months
                </a>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                <div className="border p-4 rounded shadow-sm text-center bg-light-success">
                  <i className="fe fe-dollar-sign icon-shape icon-sm rounded-circle text-success mb-2" />
                  <h3 className="display-4 fw-bold mb-0">
                    ${stats.monthly_revenue?.toFixed(2)}
                  </h3>
                  <span className="text-muted">Monthly Earnings</span>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                <div className="border p-4 rounded shadow-sm text-center bg-light-success">
                  <i className="fe fe-dollar-sign icon-shape icon-sm rounded-circle text-success mb-2" />
                  <h3 className="display-4 fw-bold mb-0">
                    ${stats.total_revenue?.toFixed(2)}
                  </h3>
                  <span className="text-muted">Total Revenue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Courses Card */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header border-bottom-0">
            <h3 className="h4 mb-0">Best Selling Courses</h3>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 text-nowrap table-hover">
              <thead className="table-light">
                <tr>
                  <th>Courses</th>
                  <th>Sales</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {bestSellingCourse?.map((b, index) => (
                  <tr key={index}>
                    <td>
                      <a href="#" className="text-decoration-none text-dark">
                        <div className="d-flex align-items-center">
                          <img
                            src={"http://127.0.0.1:8000" + b.course_image}
                            alt={b.course_title}
                            style={{
                              width: "70px",
                              height: "70px",
                              borderRadius: "10%",
                              objectFit: "cover",
                            }}
                            className="me-2"
                          />
                          <h5 className="mb-0">{b.course_title}</h5>
                        </div>
                      </a>
                    </td>
                    <td>{b.sales}</td>
                    <td>${b.revenue}</td>
                    <td className="align-middle border-top-0">
                      <span className="dropdown dropstart">
                        <a
                          className="btn-icon btn btn-ghost btn-sm rounded-circle"
                          href="#"
                          role="button"
                          id="courseDropdown1"
                          data-bs-toggle="dropdown"
                          data-bs-offset="-20,20"
                          aria-expanded="false"
                        >
                          <i className="fe fe-more-vertical" />
                        </a>
                        <div className="dropdown-menu" aria-labelledby="courseDropdown1">
                          <span className="dropdown-header">Settings</span>
                          <a className="dropdown-item" href="#">
                            <i className="fe fe-edit dropdown-item-icon" />
                            Edit
                          </a>
                          <a className="dropdown-item" href="#">
                            <i className="fe fe-trash dropdown-item-icon" />
                            Remove
                          </a>
                        </div>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Earning History Card */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header border-bottom-0">
            <h3 className="h4 mb-3">Earning History</h3>
          </div>
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(earning.intervals) &&
                  earning.intervals.map((interval, index) => (
                    <tr key={index}>
                      <td>{moment(interval, "YYYY-MM").format("MMMM YYYY")}</td>
                      <td>${earning.earnings[index]?.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
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

export default Earning;
