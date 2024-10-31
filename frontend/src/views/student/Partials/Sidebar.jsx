import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
    return (
<div className="col-lg-3 col-md-4 col-12">
  <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav" style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: 'none' }}>
    <div className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark p-3">
      Menu
    </div>
    <button
      className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light m-3"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#sidenav"
      aria-controls="sidenav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="bi bi-grid" />
    </button>
    <div className="collapse navbar-collapse p-3" id="sidenav">
      <div className="navbar-nav flex-column">
        <h6 className="fw-bold text-muted mb-2">Main Menu</h6>
        <ul className="list-unstyled ms-n2 mb-4">
          <li className="nav-item">
            <Link className="nav-link d-flex align-items-center" to={`/student/dashboard/`}>
              <i className="bi bi-grid-fill me-2"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link d-flex align-items-center" to={`/student/courses/`}>
              <i className="fas fa-shopping-cart me-2"></i> My Courses
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link d-flex align-items-center" to={`/student/wishlist/`}>
              <i className="fas fa-heart me-2"></i> Wishlist
            </Link>
          </li>
        </ul>

        {/* Navbar header */}
        <h6 className="fw-bold text-muted mb-2">Account Settings</h6>
        <ul className="list-unstyled ms-n2 mb-0">
          <li className="nav-item">
            <Link className="nav-link d-flex align-items-center" to={`/student/profile/`}>
              <i className="fas fa-edit me-2"></i> Edit Profile
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link d-flex align-items-center" to={`/student/change-password/`}>
              <i className="fas fa-lock me-2"></i> Change Password
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link d-flex align-items-center" to={`/logout/`}>
              <i className="fas fa-sign-out-alt me-2"></i> Sign Out
            </Link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</div>



    );
}

export default Sidebar;
