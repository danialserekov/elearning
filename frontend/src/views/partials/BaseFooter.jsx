import React from "react";

function BaseFooter() {
  return (
    <footer className="text-center text-white mt-auto bg-dark">
      <div className="container pt-3">
        <section className="mb-3">
          <p className="d-flex justify-content-center align-items-center">
            <span className="me-3 fs-6">Made by Danial Serekov</span>
          </p>
        </section>
      </div>

      <div className="text-center p-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
        <small>© 2024 Kazakh-British Technical University. All rights reserved.</small>
      </div>
    </footer>
  );
}

export default BaseFooter;
