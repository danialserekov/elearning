import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function Courses() {
  const [courses, setCourses] = useState([]);
  const { user, loading } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
  }));  const teacherId = user?.teacher_id;

  //console.log('teacherId', user, teacherId)

  const fetchCourseData = () => {
    if (teacherId) {
      useAxios()
        .get(`teacher/course-lists/${teacherId}/`)
        .then((res) => {
          setCourses(res.data);
        });
    }
  };

  useEffect(() => {
    if (!loading && teacherId) {
      fetchCourseData();
    }
  }, [loading, teacherId]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchCourseData();
    } else {
      const filtered = courses.filter((c) => {
        return c.title.toLowerCase().includes(query);
      });
      setCourses(filtered);
    }
  };

  const handleDelete = (courseId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this course!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        useAxios()
          .delete(`/course/course-detail/${courseId}/`)
          .then((response) => {
            setCourses(
              courses.filter((course) => course.course_id !== courseId)
            );
            Swal.fire("Deleted!", "Your course has been deleted.", "success");
          })
          .catch((error) => {
            console.error("There was an error deleting the course:", error);
            Swal.fire(
              "Error!",
              "There was an error deleting the course.",
              "error"
            );
          });
      }
    });
  };

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
  <div className="container">
    <Header />
    <div className="row mt-0 mt-md-4">
      <Sidebar />
      <div className="col-lg-9 col-md-8 col-12">
        <div className="row mb-4">
          <h4 className="mb-0 mb-2 mt-4">
            <i className="bi bi-grid-fill"></i> Courses
          </h4>
        </div>
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-light">
            <h3 className="mb-0">Courses</h3>
            <span className="text-muted">
              Manage your courses from here: search, view, edit, or delete courses.
            </span>
          </div>
          <div className="card-body">
            <form className="row gx-3 mb-3">
              <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
                <input
                  type="search"
                  className="form-control form-control-lg"
                  placeholder="Search Your Courses"
                  onChange={handleSearch}
                />
              </div>
            </form>
          </div>
          <div className="table-responsive">
            {courses.length > 0 ? (
              <table className="table mb-0 text-nowrap table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Courses</th>
                    <th>Quiz Status</th>
                    <th>Enrolled</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={c.image}
                            alt="course"
                            className="rounded-circle img-thumbnail me-3"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <h4 className="mb-1 h6">
                              <a className="text-inherit text-decoration-none text-dark">
                                {c.title}
                              </a>
                            </h4>
                            <ul className="list-inline fs-6 mb-0">
                              <li className="list-inline-item">
                                <small>
                                  <i className="fas fa-user"></i>
                                  <span className="ms-1">{c.language}</span>
                                </small>
                              </li>
                              <li className="list-inline-item">
                                <small>
                                  <i className="bi bi-reception-4"></i>
                                  <span className="ms-1">{c.level}</span>
                                </small>
                              </li>
                              <li className="list-inline-item">
                                <small>
                                  <i className="fas fa-dollar-sign"></i>
                                  <span>{c.price}</span>
                                </small>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="mt-3">{c.quiz_status === "Published" ? "Published" : "No Quiz"}</p>
                      </td>
                      <td>
                        <p className="mt-3">{c.students?.length}</p>
                      </td>
                      <td>
                        <span className="badge bg-success">{c.level}</span>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">Published</span>
                      </td>
                      <td>
                        <p className="mt-3">{moment(c.date).format("DD MMM, YYYY")}</p>
                      </td>
                      <td>
                        <Link
                          to={`/instructor/edit-course/${c.course_id}/`}
                          className="btn btn-outline-primary btn-sm me-1"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="btn btn-outline-danger btn-sm me-1"
                          onClick={() => handleDelete(c.course_id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <Link
                          to={`/instructor/courses/${c.course_id}/`}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-center">
                <div className="alert alert-warning text-center" role="alert">
                  No courses yet
                </div>
              </div>
            )}
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

export default Courses;