import React, { useState, useEffect } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function ChangePassword() {
  const [password, setPassword] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const handlePasswordChange = (event) => {
    setPassword({
      ...password,
      [event.target.name]: event.target.value,
    });
  };

  const changePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password.confirm_new_password !== password.new_password) {
      Toast().fire({
        icon: "error",
        title: "Password does not match",
      });
    }

    const formdata = new FormData();
    formdata.append("user_id", UserData()?.user_id);
    formdata.append("old_password", password.old_password);
    formdata.append("new_password", password.new_passowrd);

    await useAxios()
      .post(`user/change-password/`, formdata)
      .then((res) => {
        Toast().fire({
          icon: res.data.icon,
          title: res.data.message,
        });
      });
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
              {/* Card */}
              <div className="card shadow-sm border-0">
                {/* Card header */}
                <div className="card-header bg-light">
                  <h3 className="mb-0">Change Password</h3>
                </div>
                {/* Card body */}
                <div className="card-body">
                  <form
                    className="row gx-3 needs-validation"
                    noValidate=""
                    onSubmit={changePasswordSubmit}
                  >
                    {/* Old Password */}
                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="oldPassword">
                        Old Password
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        className="form-control"
                        placeholder="Enter your old password"
                        required
                        name="old_password"
                        value={password.old_password}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    {/* New Password */}
                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="newPassword">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        className="form-control"
                        placeholder="Enter your new password"
                        required
                        name="new_password"
                        value={password.new_password} 
                        onChange={handlePasswordChange}
                      />
                    </div>
                    {/* Confirm New Password */}
                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="confirmNewPassword">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        className="form-control"
                        placeholder="Confirm your new password"
                        required
                        name="confirm_new_password"
                        value={password.confirm_new_password}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="col-12">
                      {/* Button */}
                      <button className="btn btn-primary w-100" type="submit">
                        Save New Password 
                        <i className="fas fa-check-circle ms-2"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS for improved styles */}
        <style jsx>{`
          .card {
            border-radius: 10px; /* Rounded corners for the card */
          }
          .form-label {
            font-weight: 600; /* Bolder labels */
          }
          .btn {
            font-weight: 500; /* Slightly bolder button text */
          }
        `}</style>
      </section>

      <BaseFooter />
    </>
  );
}

export default ChangePassword;
