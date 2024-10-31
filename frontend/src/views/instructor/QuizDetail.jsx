import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import moment from "moment";

function QuizDetail() {
  const { quizId } = useParams(); // Get the quiz ID from the URL
  const [quiz, setQuiz] = useState(null);
  const axiosInstance = useAxios();

  useEffect(() => {
    axiosInstance
      .get(`/teacher/quiz-detail/${quizId}/`)
      .then((res) => {
        setQuiz(res.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz details:", error);
      });
  }, [quizId]);

  if (!quiz) {
    return <div>Loading...</div>;
  }

  // Calculate the total score of the quiz
  const totalScore = quiz.questions.reduce((total, question) => total + question.score, 0);

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card mb-4">
                <div className="card-header">
                  <h3 className="mb-0">Quiz Details</h3>
                  <span>{quiz.title}</span>
                </div>
                <div className="card-body">
                  <p>
                    <strong>Course:</strong> {quiz.course_name}
                  </p>
                  <p>
                    <strong>Description:</strong> {quiz.description || "N/A"}
                  </p>
                  <p>
                    <strong>Date Created:</strong>{" "}
                    {moment(quiz.created_at).format("DD MMM, YYYY")}
                  </p>
                  <p>
                    <strong>Total Score:</strong> {totalScore}
                  </p>

                  <h4>Questions:</h4>
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="mb-3">
                      <p>
                        <strong>Q{index + 1}:</strong> {question.question_text}{" "}
                        (Score: {question.score})
                      </p>
                      <ul>
                        {question.answers.map((answer, idx) => (
                          <li
                            key={idx}
                            style={{
                              color: answer.is_correct ? "green" : "red",
                            }}
                          >
                            {answer.answer_text}{" "}
                            {answer.is_correct && "(Correct)"}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2">
                        <strong>Explaination:</strong> {question.explanation || "N/A"}
                      </p>
                    </div>
                  ))}
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

export default QuizDetail;
