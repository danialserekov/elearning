import React, { useState, useEffect } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

function StudentQuiz() {
  const { quizId } = useParams(); // Get quizId from the URL
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false); // Track if the quiz has been submitted
  const [submittedAnswers, setSubmittedAnswers] = useState([]); // Store submitted answers
  const [score, setScore] = useState(null); // Store score
  const [totalScore, setTotalScore] = useState(null); // Store total score
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user); // Access user data from useAuthStore
  const studentId = user?.user_id;

  useEffect(() => {
    // Fetch the quiz details when the component mounts
    axiosInstance
      .get(`/student/quiz-detail/${quizId}/`)
      .then((res) => {
        setQuiz(res.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz details:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load quiz details.",
        });
      });
  }, [quizId]);

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers({
      ...answers,
      [questionId]: answerId,
    });
  };

  const validateQuiz = () => {
    for (const question of quiz.questions) {
      if (!answers[question.id]) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please answer all questions before submitting.",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateQuiz()) {
      return; // If validation fails, do not submit the quiz
    }

    const payload = {
      quiz_id: quizId,
      answers: Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId, 10),
        answer_id: answerId,
      })),
    };

    try {
      const response = await axiosInstance.post(`/student/submit-quiz/${studentId}/`, payload);
      setScore(response.data.score);
      setTotalScore(response.data.total_score);
      setSubmitted(true);
      setSubmittedAnswers(payload.answers);
      Swal.fire({
        icon: "success",
        title: "Quiz Submitted Successfully",
        text: `You scored ${response.data.score}/${response.data.total_score}.`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to submit quiz",
        text: error.response?.data?.detail || "Something went wrong",
      });
    }
  };

  if (!quiz) {
    return <div>Loading quiz...</div>;
  }

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card shadow rounded-3 p-4">
                <h3 className="text-center mb-4">{quiz.title}</h3>
                <p className="lead text-center">{quiz.description}</p>

                {submitted ? (
                  // Display the results
                  <div>
                    <h4>Your Results</h4>
                    <p className="text-primary fw-bold">
                      Your Score: {score}/{totalScore}
                    </p>
                    {quiz.questions.map((question, qIndex) => {
                      const studentAnswer = submittedAnswers.find(
                        (ans) => ans.question_id === question.id
                      )?.answer_id;
                      return (
                        <div key={qIndex} className="mb-4">
                          <h5 className="mb-3">
                            <strong>Question {qIndex + 1}:</strong> {question.question_text}
                          </h5>
                          <ul className="list-group">
                            {question.answers.map((answer, aIndex) => {
                              const isCorrect = answer.is_correct;
                              const isSelected = studentAnswer === answer.id;
                              return (
                                <li
                                  key={aIndex}
                                  className={`list-group-item d-flex justify-content-between align-items-center ${
                                    isCorrect
                                      ? "bg-light text-success"
                                      : isSelected
                                      ? "bg-light text-danger"
                                      : ""
                                  }`}
                                  style={{
                                    border: isSelected ? "2px solid" : "none",
                                    borderColor: isSelected
                                      ? isCorrect
                                        ? "#28a745"
                                        : "#dc3545"
                                      : "transparent",
                                  }}
                                >
                                  {answer.answer_text}
                                  {isCorrect ? (
                                    <i className="bi bi-check-circle-fill ms-2"></i>
                                  ) : (
                                    isSelected && (
                                      <i className="bi bi-x-circle-fill ms-2"></i>
                                    )
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                          <p className="mt-2">
                            <strong>Explanation:</strong> {question.explanation || "N/A"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Display the quiz form
                  <form onSubmit={handleSubmit}>
                    {quiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="mb-4">
                        <h5 className="mb-3">
                          <strong>Question {qIndex + 1}:</strong> {question.question_text}
                        </h5>
                        <ul className="list-group">
                          {question.answers.map((answer, aIndex) => (
                            <li key={aIndex} className="list-group-item">
                              <label className="d-flex align-items-center">
                                <input
                                  type="radio"
                                  name={`question_${question.id}`}
                                  value={answer.id}
                                  onChange={() => handleAnswerChange(question.id, answer.id)}
                                  className="me-2"
                                  checked={answers[question.id] === answer.id}
                                  required
                                />
                                {answer.answer_text}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <button type="submit" className="btn btn-success w-100">
                      Submit Quiz
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default StudentQuiz;