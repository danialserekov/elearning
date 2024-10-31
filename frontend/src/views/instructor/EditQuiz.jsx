import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import { useAuthStore } from "../../store/auth";
import { useCourseStore } from "../../store/courseStore"; // Import courseStore
import Spinner from "./Partials/Spinner";

function EditQuiz() {
  const { quizId } = useParams(); // Get the quiz ID from the URL
  const { user } = useAuthStore((state) => state.user); // Access user data from useAuthStore
  const teacherId = user?.teacher_id;
  const axiosInstance = useAxios();
  const navigate = useNavigate();

  const courses = useCourseStore((state) => state.courses); // Access courses from courseStore
  const fetchCourses = useCourseStore((state) => state.fetchCourses); // Fetch method from store
  console.log("courses--", courses)
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (courses.length === 0 && teacherId) {
      // Fetch courses only if they are not already in the store
      fetchCourses(teacherId);
    }

    // Fetch quiz details
    axiosInstance
      .get(`/teacher/quiz-detail/${quizId}/`)
      .then((res) => setQuiz(res.data))
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Failed to fetch quiz details",
          text: "Please try again later.",
        });
      });
  }, [courses, teacherId, quizId, fetchCourses]);

  const handleQuizInputChange = (event) => {
    setQuiz({
      ...quiz,
      [event.target.name]: event.target.value,
    });
  };

  const handleCourseChange = (event) => {
    const selectedCourseId = event.target.value;
    const selectedCourseName = courses.find(
      (course) => course.id === selectedCourseId
    );
    setQuiz({
      ...quiz,
      courseName: selectedCourseName?.title,
      course: selectedCourseId,
    });
  };

  const handleQuestionChange = (index, event) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index][event.target.name] = event.target.value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleAnswerChange = (questionIndex, answerIndex, event) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].answers[answerIndex][event.target.name] =
      event.target.value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].answers.forEach((answer, index) => {
      newQuestions[questionIndex].answers[index].is_correct =
        index === answerIndex;
    });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          question_text: "",
          score: 1,
          explanation: "",
          answers: [{ answer_text: "", is_correct: false }],
        },
      ],
    });
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = quiz.questions.filter((_, qIndex) => qIndex !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleAddAnswer = (questionIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].answers.push({
      answer_text: "",
      is_correct: false,
    });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleDeleteAnswer = (questionIndex, answerIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].answers = newQuestions[
      questionIndex
    ].answers.filter((_, aIndex) => aIndex !== answerIndex);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/teacher/edit-quiz/${quizId}/`,
        quiz
      );
      Swal.fire({
        icon: "success",
        title: "Quiz Updated Successfully",
      });
      navigate("/instructor/quizzes/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update quiz",
        text: error.response?.data?.detail || "Something went wrong",
      });
    }
  };

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            {quiz ? (
              <form
                className="col-lg-9 col-md-8 col-12"
                onSubmit={handleSubmit}
              >
                <h1 className="text-center mb-4">Edit Quiz</h1>

                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={quiz.course}
                    onChange={handleCourseChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Quiz Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={quiz.title}
                    onChange={handleQuizInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={quiz.description}
                    onChange={handleQuizInputChange}
                  />
                </div>
                {quiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="card mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-grow-1">
                          <label className="form-label">Question</label>
                          <input
                            type="text"
                            className="form-control"
                            name="question_text"
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(qIndex, e)}
                            required
                          />
                        </div>
                        <div className="ms-3">
                          <label className="form-label">Score</label>
                          <input
                            type="number"
                            className="form-control"
                            name="score"
                            value={question.score}
                            onChange={(e) => handleQuestionChange(qIndex, e)}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-3 d-flex align-items-center justify-content-center"
                          onClick={() => handleDeleteQuestion(qIndex)}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>

                      {question.answers.map((answer, aIndex) => (
                        <div
                          key={aIndex}
                          className="d-flex align-items-center mb-2"
                        >
                          <div className="flex-grow-1">
                            <label className="form-label">
                              Answer {aIndex + 1}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="answer_text"
                              value={answer.answer_text}
                              onChange={(e) =>
                                handleAnswerChange(qIndex, aIndex, e)
                              }
                              required
                            />
                          </div>
                          <div className="ms-3">
                            <label className="form-check-label">Correct</label>
                            <input
                              type="checkbox"
                              className="form-check-input ms-2"
                              checked={answer.is_correct}
                              onChange={() =>
                                handleCorrectAnswerChange(qIndex, aIndex)
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm ms-3 d-flex align-items-center justify-content-center"
                            onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ))}
                      <div className="mb-3">
                        <label className="form-label">
                          Explanation (Optional)
                        </label>
                        <textarea
                          className="form-control"
                          name="explanation"
                          value={question.explanation}
                          onChange={(e) => handleQuestionChange(qIndex, e)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-3"
                        onClick={() => handleAddAnswer(qIndex)}
                      >
                        + Add Answer
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={handleAddQuestion}
                >
                  + Add Question
                </button>
                <div className="mt-4">
                  <button type="submit" className="btn btn-success">
                    Update Quiz
                  </button>
                </div>
              </form>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default EditQuiz;
