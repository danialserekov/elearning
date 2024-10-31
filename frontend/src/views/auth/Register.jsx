import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../utils/auth";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const minPasswordLength = 8;
    const maxPasswordLength = 20;

    if (!fullName.trim()) {
      errors.fullName = "Full Name is required.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Email must be a valid @gmail.com address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < minPasswordLength) {
      errors.password = `Password must be at least ${minPasswordLength} characters.`;
    } else if (password.length > maxPasswordLength) {
      errors.password = `Password cannot be more than ${maxPasswordLength} characters.`;
    }

    if (password !== password2) {
      errors.password2 = "Passwords do not match.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validate()) {
      setIsLoading(false);
      return;
    }

    const { res, error } = await register(fullName, email, password, password2);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      navigate("/login");
      alert("Registration Successful! You can now log in.");
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
            <h1 className="mb-1 fw-bold text-dark" style={{ fontSize: "2.5rem" }}>Sign Up</h1>
            <p className="text-muted" style={{ fontSize: "1.1rem" }}>
              Already have an account? 
              <Link to="/login/" className="text-primary fw-bold ms-1">Sign In</Link>
            </p>
          </div>

          {/* Display error messages */}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          <form className="needs-validation" noValidate onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="full_name" className="form-label" style={{ fontWeight: '600' }}>Full Name</label>
              <input
                type="text"
                id="full_name"
                className="form-control shadow-sm border-0 rounded-pill"
                name="full_name"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {formErrors.fullName && (
                <div className="text-danger">{formErrors.fullName}</div>
              )}
            </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {formErrors.email && (
                <div className="text-danger">{formErrors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label" style={{ fontWeight: '600' }}>Password</label>
              <input
                type="password"
                id="password"
                className="form-control shadow-sm border-0 rounded-pill"
                name="password"
                placeholder="**************"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {formErrors.password && (
                <div className="text-danger">{formErrors.password}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="password2" className="form-label" style={{ fontWeight: '600' }}>Confirm Password</label>
              <input
                type="password"
                id="password2"
                className="form-control shadow-sm border-0 rounded-pill"
                name="password2"
                placeholder="**************"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
              {formErrors.password2 && (
                <div className="text-danger">{formErrors.password2}</div>
              )}
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
                    Sign Up <i className="fas fa-user-plus"></i>
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

export default Register;
