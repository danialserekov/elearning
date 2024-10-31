import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState([]);
  const [fetching, setFetching] = useState(true);
  const { user } = useAuthStore((state) => ({ user: state.user })); // Access user data from useAuthStore
  const studentId = user?.user_id;

  const fetchData = () => {
    setFetching(true);

    useAxios()
      .get(`student/course-list/${studentId}/`)
      .then((res) => {
        setCourses(res.data);
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchData();
    } else {
      const filtered = courses.filter((c) => {
        return c.course.title.toLowerCase().includes(query);
      });
      setCourses(filtered);
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
        <h4 className="mb-4">
          <i className="fas fa-shopping-cart"></i> My Courses
        </h4>

        {fetching === true && <p className="mt-3 p-3">Loading...</p>}

        {fetching === false && (
          <div className="card mb-4 shadow-sm border-0">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h3 className="mb-0">List of Courses</h3>
            </div>
            <div className="card-body">
              <form className="row gx-3">
                <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search Your Course"
                    onChange={handleSearch}
                  />
                </div>
              </form>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 table-hover text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>Courses</th>
                    <th>Date Enrolled</th>
                    <th>Lectures</th>
                    <th>Completed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses?.map((c, index) => (
                    <tr key={index} className="align-middle">
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={c.course.image}
                            alt="course"
                            className="rounded img-4by3-lg me-3"
                            style={{
                              width: "100px",
                              height: "70px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <h5 className="mb-1 text-truncate">
                              <a
                                href="#"
                                className="text-inherit text-decoration-none text-dark"
                              >
                                {c.course.title}
                              </a>
                            </h5>
                            <ul className="list-inline fs-6 mb-0">
                              <li className="list-inline-item">
                                <i className="fas fa-user"></i>
                                <span className="ms-1">{c.course.language}</span>
                              </li>
                              <li className="list-inline-item">
                                <i className="bi bi-reception-4"></i>
                                <span className="ms-1">{c.course.level}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="mt-3">
                          {moment(c.date).format("D MMM, YYYY")}
                        </p>
                      </td>
                      <td>
                        <p className="mt-3">{c.lectures?.length}</p>
                      </td>
                      <td>
                        <p className="mt-3">{c.completed_lesson?.length}</p>
                      </td>
                      <td>
                        {c.completed_lesson?.length < 1 ? (
                          <Link
                            to={`/student/courses/${c.enrollment_id}/`}
                            className="btn btn-success btn-sm mt-3"
                          >
                            Start Course
                            <i className="fas fa-arrow-right ms-2"></i>
                          </Link>
                        ) : (
                          <Link
                            to={`/student/courses/${c.enrollment_id}/`}
                            className="btn btn-primary btn-sm mt-3"
                          >
                            Continue Course
                            <i className="fas fa-arrow-right ms-2"></i>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}

                  {courses?.length < 1 && (
                    <tr>
                      <td colSpan="5" className="text-center mt-4 p-4">
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* CSS for hover effect on table rows */}
  <style jsx>{`
    .table-hover tbody tr:hover {
      background-color: #f1f1f1; /* Light grey background on hover */
      transition: background-color 0.3s ease; /* Smooth transition */
    }
  `}</style>
</section>


      <BaseFooter />
    </>
  );
}

export default Courses;