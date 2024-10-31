import React, { useState, useEffect } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { FaTrashAlt } from "react-icons/fa"; // Importing the trash icon

function QuizCreate() {
  const [courses, setCourses] = useState([]);
  const { user } = useAuthStore((state) => ({
    user: state.user,
  })); // Access user data from useAuthStore
  const teacherId = user?.teacher_id;

  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    courseName: "",
    title: "",
    description: "",
    course: "", // Course ID the quiz is associated with
    questions: [
      {
        question_text: "",
        score: 1, // Default score for each question
        explanation: "", // Explanation for the correct answer
        answers: [{ answer_text: "", is_correct: false }],
      },
    ],
  });

  useEffect(() => {
    // Ensure teacherId is defined before making the request
    if (teacherId) {
      // Fetch the list of courses for the instructor
      axiosInstance
        .get(`/teacher/course-lists/${teacherId}/`)
        .then((res) => {
          setCourses(res.data);
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
          Swal.fire({
            icon: "error",
            title: "Failed to fetch courses",
            text: "Please try again later.",
          });
        });
    } else {
      console.warn("Teacher ID is undefined.");
    }
  }, [teacherId]);

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
      course: event.target.value,
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
          score: 1, // Default score for new question
          explanation: "", // Explanation for the correct answer
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
    newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(
      (_, aIndex) => aIndex !== answerIndex
    );
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const validateQuiz = () => {
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const correctAnswers = question.answers.filter(answer => answer.is_correct);
      if (correctAnswers.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `Question ${i + 1} must have at least one correct answer.`,
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teacherId) {
      Swal.fire({
        icon: "error",
        title: "Teacher ID is missing!",
        text: "Please ensure you are logged in as an instructor.",
      });
      return;
    }
    
    if (!validateQuiz()) {
      return; // If validation fails, do not submit the form
    }

    try {
      const response = await axiosInstance.post(`/teacher/create-quiz/`, quiz);
      Swal.fire({
        icon: "success",
        title: "Quiz Created Successfully",
      });
      navigate("/instructor/quizzes/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to create quiz",
        text: error.response?.data?.detail || "Something went wrong",
      });
    }
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
      <form className="col-lg-9 col-md-8 col-12 border border-0" style={{ backgroundColor: '#ffffff' }} onSubmit={handleSubmit}>
        <h1 className="text-center mb-4">Create Quiz</h1>

        {/* Course Selection */}
        <div className="mb-4">
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

        {/* Quiz Title Input */}
        <div className="mb-4">
          <label className="form-label">Quiz Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={quiz.title}
            onChange={handleQuizInputChange}
            required
            placeholder="Enter quiz title"
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-control"
            name="description"
            value={quiz.description}
            onChange={handleQuizInputChange}
            placeholder="Add a brief description"
          />
        </div>

        {/* Questions Section */}
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="card mb-4 shadow-sm border-0">
            <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
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
                    placeholder="Enter question text"
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
                    placeholder="Score"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm ms-3"
                  onClick={() => handleDeleteQuestion(qIndex)}
                >
                  <FaTrashAlt />
                </button>
              </div>

              {/* Answers Section */}
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex} className="d-flex align-items-center mb-2">
                  <div className="flex-grow-1">
                    <label className="form-label">Answer {aIndex + 1}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="answer_text"
                      value={answer.answer_text}
                      onChange={(e) => handleAnswerChange(qIndex, aIndex, e)}
                      required
                      placeholder="Enter answer text"
                    />
                  </div>
                  <div className="form-check ms-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={answer.is_correct}
                      onChange={() => handleCorrectAnswerChange(qIndex, aIndex)}
                    />
                    <label className="form-check-label">Correct</label>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm ms-3"
                    onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}

              {/* Explanation Input */}
              <div className="mb-4">
                <label className="form-label">Explanation (Optional)</label>
                <textarea
                  className="form-control"
                  name="explanation"
                  value={question.explanation}
                  onChange={(e) => handleQuestionChange(qIndex, e)}
                  placeholder="Add an explanation"
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

        {/* Submit Button */}
        <div className="mt-4 text-center">
          <button type="submit" className="btn btn-success btn-lg">
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  </div>
</section>

      <BaseFooter />
    </>
  );
}

export default QuizCreate;