import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user); // Access user data from useAuthStore
    const teacherId = user?.teacher_id;

    useEffect(() => {
        useAxios().get(`teacher/quizzes/?teacher_id=${teacherId}`)
            .then((res) => {
                setQuizzes(res.data);
            });
    }, []);

    const handleDelete = (quizId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this quiz!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, keep it",
        }).then((result) => {
            if (result.isConfirmed) {
                useAxios().delete(`/teacher/quiz-detail/${quizId}/`)
                    .then(() => {
                        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
                        Swal.fire("Deleted!", "Your quiz has been deleted.", "success");
                    })
                    .catch((error) => {
                        Swal.fire("Error!", "There was an error deleting the quiz.", "error");
                    });
            }
        });
    };

    const handlePublish = (quizId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to publish this quiz?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, publish it!",
            cancelButtonText: "No, keep it as draft",
        }).then((result) => {
            if (result.isConfirmed) {
                useAxios().post(`/teacher/publish-quiz/${quizId}/`)
                    .then(() => {
                        Swal.fire("Published!", "Your quiz has been published.", "success")
                            .then(() => navigate("/instructor/courses/"));
                    })
                    .catch((error) => {
                        Swal.fire("Error!", "There was an error publishing the quiz.", "error");
                    });
            }
        });
    };

    return (
        <>
            <BaseHeader />
            <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
  <div className="container">
    {/* Header */}
    <Header />
    <div className="row mt-0 mt-md-4">
      {/* Sidebar */}
      <Sidebar />
      <div className="col-lg-9 col-md-8 col-12">
        {/* Quizzes Card */}
        <div className="card mb-4 shadow-sm border-light">
          {/* Card Header */}
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-0">Quizzes</h3>
              <span className="text-muted">
                Manage your quizzes from here, search, view, edit, or delete quizzes.
              </span>
            </div>
            <div>
              <Link to="/instructor/add-quiz" className="btn btn-success">
                <i className="fas fa-plus me-1"></i> Add Quiz
              </Link>
            </div>
          </div>
          {/* Table Container */}
          <div className="table-responsive overflow-hidden">
            {quizzes.length > 0 ? (
              <table className="table mb-0 text-nowrap table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Course</th>
                    <th>Quiz Title</th>
                    <th>Total Questions</th>
                    <th>Total Score</th>
                    <th>Date Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz, index) => (
                    <tr key={index}>
                      <td>{quiz.course_name}</td>
                      <td>{quiz.title}</td>
                      <td>{quiz.questions.length}</td>
                      <td>{quiz.questions.reduce((total, q) => total + q.score, 0)}</td>
                      <td>{moment(quiz.created_at).format("DD MMM, YYYY")}</td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <Link to={`/instructor/edit-quiz/${quiz.id}/`} className="btn btn-primary btn-sm me-1">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-danger btn-sm me-1"
                            onClick={() => handleDelete(quiz.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <Link to={`/instructor/quiz-detail/${quiz.id}/`} className="btn btn-secondary btn-sm me-1">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handlePublish(quiz.id)}
                          >
                            <i className="fas fa-upload"></i> Publish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-center">
                <div className="alert alert-warning" role="alert">
                  No quizzes yet
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

export default Quizzes;