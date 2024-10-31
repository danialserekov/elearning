import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Modal from "react-bootstrap/Modal";
import moment from "moment";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function QA() {
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const lastElementRef = useRef();
  const messageInputRef = useRef();
  const [createMessage, setCreateMessage] = useState({
    title: "",
    message: "",
  });

  const { user, loading } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
  }));
  // Access user data from useAuthStore
  const teacherId = user?.teacher_id;
  const userId = user?.user_id;

  const fetchQuestions = async () => {
    useAxios()
      .get(`teacher/question-answer-list/${teacherId}/`)
      .then((res) => {
        setQuestions(res.data);
      });
  };

  useEffect(() => {
    if (!loading && user) {
      fetchQuestions();
    }
  }, [loading, user]);

  const [ConversationShow, setConversationShow] = useState(false);
  const handleConversationClose = async () => {
    await fetchQuestions(); // Refetch questions to ensure the list is updated
    setConversationShow(false); // Close the modal
  };
  const handleConversationShow = (converation) => {
    setConversationShow(true);
    setSelectedConversation(converation);
  };

  const handleMessageChange = (event) => {
    setCreateMessage({
      ...createMessage,
      [event.target.name]: event.target.value,
    });
  };
  const sendNewMessage = async (e) => {
    e.preventDefault();

    // Clear the textarea using the ref
    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }
    const formdata = new FormData();
    formdata.append("course_id", selectedConversation.course);
    formdata.append("user_id", userId);
    formdata.append("message", createMessage.message);
    formdata.append("qa_id", selectedConversation?.qa_id);

    try {
      const res = await useAxios().post(
        `student/question-answer-message-create/`,
        formdata
      );
      setSelectedConversation(res.data.question); // Update the current conversation with the new data
      await fetchQuestions(); // Refetch questions to update the list
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchQuestions();
    } else {
      const filtered = questions?.filter((question) => {
        return question.title.toLowerCase().includes(query);
      });
      setQuestions(filtered);
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
              <h4 className="mb-0 mb-1">
                {" "}
                <i className="fas fa-envelope"></i> Question and Answer
              </h4>

              <div className="card">
                {/* Card header */}
                <div className="card-header border-bottom p-0 pb-3">
                  {/* Title */}
                  <h4 className="mb-3 p-3">Discussion</h4>
                  <form className="row g-4 p-3">
                    {/* Search */}
                    <div className="col-sm-12 col-lg-12">
                      <div className="position-relative">
                        <input
                          className="form-control pe-5 bg-transparent"
                          type="search"
                          placeholder="Search Questions"
                          aria-label="Search"
                          onChange={handleSearchQuestion}
                        />
                      </div>
                    </div>
                  </form>
                </div>
                {/* Card body */}
                <div className="card-body p-0 pt-3">
                  <div className="vstack gap-3 p-3">
                    {/* Question item START */}
                    {questions.length > 0 ? (
                      questions?.map((q, index) => (
                        <div className="shadow rounded-3 p-3" key={index}>
                          <div className="d-sm-flex justify-content-sm-between mb-3">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm flex-shrink-0">
                                <img
                                  src={q.profile.image}
                                  className="avatar-img rounded-circle"
                                  alt="avatar"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                              <div className="ms-2">
                                <h6 className="mb-0">
                                  <a
                                    href="#"
                                    className="text-decoration-none text-dark"
                                  >
                                    {q.profile.full_name}
                                  </a>
                                </h6>
                                <small>
                                  {moment(q.date).format(
                                    "DD MMM, YYYY [at] hh:mm A"
                                  )}
                                </small>
                              </div>
                            </div>
                          </div>
                          <h5>
                            {q.title} {""}
                            <span className="badge bg-success">
                              {q.messages?.length}
                            </span>
                          </h5>
                          <button
                            className="btn btn-primary btn-sm mb-3 mt-3"
                            onClick={() => handleConversationShow(q)}
                          >
                            Join Conversation{" "}
                            <i className="fas fa-arrow-right"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div
                        className="alert alert-warning text-center"
                        role="alert"
                      >
                        No Questions to respond.
                      </div>
                    )}

                    {/* {questions?.length < 1 && <p>No Questions</p>} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal show={ConversationShow} size="lg" onHide={handleConversationClose}>
        <Modal.Header closeButton>
          <Modal.Title>Lesson: {selectedConversation?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-2 p-sm-4 rounded-3">
            <ul
              className="list-unstyled mb-0"
              style={{ overflowY: "scroll", height: "500px" }}
            >
              {selectedConversation?.messages?.map((m, index) => (
                <li className="comment-item mb-3" key={index}>
                  <div className="d-flex">
                    <div className="avatar avatar-sm flex-shrink-0">
                      <a href="#">
                        <img
                          className="avatar-img rounded-circle"
                          src={
                            m.profile.image?.startsWith("http://127.0.0.1:8000")
                              ? m.profile.image
                              : `http://127.0.0.1:8000${m.profile.image}`
                          }
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          alt="womans image"
                        />
                      </a>
                    </div>
                    <div className="ms-2">
                      {/* Comment by */}
                      <div className="bg-light p-3 rounded w-100">
                        <div className="d-flex w-100 justify-content-center">
                          <div className="me-2 ">
                            <h6 className="mb-1 lead fw-bold">
                              <a
                                href="#!"
                                className="text-decoration-none text-dark"
                              >
                                {" "}
                                {m.profile.full_name}{" "}
                              </a>
                              <br />
                              <span style={{ fontSize: "12px", color: "gray" }}>
                                {moment(m.date).format("DD MMM, YYYY")}
                              </span>
                            </h6>
                            <p className="mb-0 mt-3  ">{m.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              <div ref={lastElementRef}></div>
            </ul>

            <form className="w-100 d-flex" onSubmit={sendNewMessage}>
              <textarea
                name="message"
                className="one form-control pe-4 bg-light w-75"
                id="autoheighttextarea"
                rows="2"
                onChange={handleMessageChange}
                ref={messageInputRef}
                placeholder="What's your question?"
              ></textarea>
              <button className="btn btn-primary ms-2 mb-0 w-25" type="submit">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      <BaseFooter />
    </>
  );
}

export default QA;