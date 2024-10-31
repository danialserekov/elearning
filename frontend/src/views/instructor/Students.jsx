import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function Students() {
  const [student, setStudents] = useState([]);
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));

  const teacherId = user?.teacher_id

  useEffect(() => {
    useAxios()
      .get(`teacher/student-lists/${teacherId}/`)
      .then((res) => {
        setStudents(res.data);
      }).catch((error) => {
        console.error("Error fetching students:", error);
        // Optionally, you can display a user-friendly message in the UI
      });
  }, [teacherId]);
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
        {/* Card for Students Section */}
        <div className="card mb-4 shadow-sm border-light">
          {/* Card header */}
          <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
            <div>
              <h3 className="mb-0">Students</h3>
              <span className="text-muted">Meet people taking your course.</span>
            </div>
          </div>
        </div>
        {/* Student List */}
        <div className="row">
          {student.length > 0 ? (
            student.map((s, index) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={index}>
                <div className="card h-100 shadow-sm border-light">
                  <div className="card-body text-center">
                    <img
                      src={`http://127.0.0.1:8000${s.image}`}
                      className="rounded-circle avatar-xl mb-3"
                      alt="avatar"
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                      }}
                    />
                    <h4 className="mb-1">{s.full_name}</h4>
                    <p className="mb-0">
                      <i className="fas fa-map-pin me-1" /> {s.country}
                    </p>
                    <div className="d-flex justify-content-between py-2 mt-4 fs-6">
                      <span className="text-muted">Enrolled</span>
                      <span className="text-dark">
                        {moment(s.date).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-warning text-center" role="alert">
                No students enrolled yet.
              </div>
            </div>
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

export default Students;