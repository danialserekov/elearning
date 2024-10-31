import React, { useContext, useEffect, useState } from "react";
//import { ProfileContext } from "../../plugin/Context";
import { useAuthStore } from "../../../store/auth";
import { useProfileStore } from "../../../store/useProfileStore"; // Access user data from useAuthStore

function Header() {
  
  //console.log("userId", userId);
  //const [loading, setLoading] = useState(true);
  const profile = useProfileStore((state) => state.profile);


  return (
    <div className="row align-items-center">
      <div className="col-xl-12 col-lg-12 col-md-12 col-12">
        <div className="card px-4 pt-4 pb-4 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff' }}>
          <div className="d-flex align-items-center">
            {/* Avatar Section */}
            <div className="position-relative me-3">
              <img
                src={profile?.image}
                className="avatar-xl rounded-circle border border-4 border-white shadow-sm"
                alt="avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>

            {/* Profile Details Section */}
            <div className="lh-1">
              <h2 className="mb-1" style={{ fontSize: '1.75rem', fontWeight: '600', color: '#333' }}>
                {profile?.full_name}
              </h2>
              <p className="mb-0 text-muted" style={{ fontSize: '1rem', fontWeight: '400' }}>
                {profile?.about}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;