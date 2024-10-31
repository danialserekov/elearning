import { useState, useEffect } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiInstance.get(`user/password-reset/${email}/`).then((res) => {
        setIsLoading(false);
        alert("Password Reset Email Sent");
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BaseHeader />

      <section className="container d-flex flex-column vh-100" style={{ marginTop: "100px" }}>
  <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
    <div className="col-lg-4 col-md-6 py-8 py-xl-0">
      <div className="card shadow-lg border-0 rounded-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="card-body p-5">
          <div className="mb-4 text-center">
            <h1 className="mb-1 fw-bold text-dark" style={{ fontSize: "2.5rem" }}>Forgot Password</h1>
            <p className="text-muted" style={{ fontSize: "1.1rem" }}>
              Let's help you get back into your account.
            </p>
          </div>
          <form className="needs-validation" noValidate onSubmit={handleEmailSubmit}>
            {/* Email Address */}
            <div className="mb-4">
              <label htmlFor="email" className="form-label" style={{ fontWeight: '600' }}>Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control shadow-sm border-0 rounded-pill"
                name="email"
                placeholder="johndoe@gmail.com"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="invalid-feedback">Please enter a valid email.</div>
            </div>

            {/* Submit Button */}
            <div>
              <div className="d-grid">
                {isLoading ? (
                  <button disabled type="submit" className="btn btn-primary rounded-pill" style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    Processing <i className="fas fa-spinner fa-spin"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary rounded-pill" style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    Reset Password <i className="fas fa-arrow-right"></i>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>


      <BaseFooter />
    </>
  );
}

export default ForgotPassword;
