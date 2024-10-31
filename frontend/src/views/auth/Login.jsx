import { useState, useEffect } from "react";

import apiInstance from "../../utils/axios";
import { login, setAuthUser } from "../../utils/auth";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   const { access, error, refresh } = await login(email, password);
  //  // console.log("token", access)
  //   if (error) {
  //     setIsLoading(false);
  //     alert(error);
  //   } else {
  //     if (rememberMe) {
  //       // Save email and password to localStorage
  //       localStorage.setItem("rememberedEmail", email);
  //       localStorage.setItem("rememberedPassword", password);
  //     } else {
  //       // Clear any remembered login details
  //       localStorage.removeItem("rememberedEmail");
  //       localStorage.removeItem("rememberedPassword");
  //     }

  //     setAuthUser(access, refresh);
  //     navigate("/");
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const { access, error, refresh } = (await login(email, password)) || {}; // Safeguard against undefined response
  
      if (error) {
        setIsLoading(false);
        alert(error);
      } else if (access) {
        if (rememberMe) {
          // Save email and password to localStorage
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          // Clear any remembered login details
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }        
        setAuthUser(access, refresh);
        navigate("/");
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      alert("An unexpected error occurred");
    }
  };
  

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
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
            <h1 className="mb-1 fw-bold text-dark" style={{ fontSize: "2.5rem" }}>Welcome Back!</h1>
            <p className="text-muted" style={{ fontSize: "1.1rem" }}>
              Don’t have an account?
              <Link to="/register/" className="ms-1 text-primary fw-bold" style={{ textDecoration: 'underline' }}>Sign up</Link>
            </p>
          </div>
          {/* Form */}
          <form className="needs-validation" noValidate onSubmit={handleSubmit}>
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
              <div className="invalid-feedback">Please enter a valid email.</div>
            </div>
            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label" style={{ fontWeight: '600' }}>Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-control shadow-sm border-0 rounded-pill"
                  name="password"
                  placeholder="**************"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="input-group-text bg-light border-0 rounded-end"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                  data-testid="password-visibility-toggle"
                >
                  {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </span>
                <div className="invalid-feedback">Please enter a valid password.</div>
              </div>
            </div>
            {/* Checkbox and Forgot Password */}
            <div className="d-lg-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberme"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <label className="form-check-label" htmlFor="rememberme">Remember me</label>
              </div>
              <div>
                <Link to="/forgot-password/" className="text-primary" style={{ textDecoration: 'underline' }}>Forgot your password?</Link>
              </div>
            </div>
            {/* Submit Button */}
            <div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary rounded-pill" style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  {isLoading ? "Processing..." : "Sign In"}
                </button>
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

export default Login;