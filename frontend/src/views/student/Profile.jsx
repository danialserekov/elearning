import React, { useState, useEffect } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import Toast from "../plugin/Toast";
import { useAuthStore } from "../../store/auth";
import { useProfileStore } from "../../store/useProfileStore";

const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CD", name: "Congo, Democratic Republic of the" },
  { code: "CG", name: "Congo, Republic of the" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "CI", name: "Ivory Coast" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

function Profile() {
  const { profile, loading, fetchProfile, setProfile } = useProfileStore(
    (state) => ({
      profile: state.profile,
      loading: state.loading,
      fetchProfile: state.fetchProfile,
      setProfile: state.setProfile,
    })
  );

  const [profileData, setProfileData] = useState({
    image: "",
    full_name: "",
    about: "",
    country: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));
  const userId = user?.user_id;

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
      setImagePreview(profile.image);
    }
  }, [profile]);

  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size > 4000 * 4000) {
      setImageError("Image size exceeds the limit of 4000KB.");
      return;
    }
    setImageError("");
    setProfileData({
      ...profileData,
      [event.target.name]: selectedFile,
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();
    if (profileData.image && profileData.image !== profile.image) {
      formdata.append("image", profileData.image);
    }

    formdata.append("full_name", profileData.full_name);
    formdata.append("about", profileData.about);
    formdata.append("country", profileData.country);

    try {
      const res = await useAxios().patch(`user/profile/${userId}/`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("resss", res.data);
      setProfile(res.data);
      Toast().fire({
        title: "Profile updated successfully",
        icon: "success",
      });
    } catch (err) {
      Toast().fire({
        title: "Failed to update profile",
        icon: "error",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
  <div className="container">
    <Header />
    <div className="row mt-0 mt-md-4">
      <Sidebar />
      <div className="col-lg-9 col-md-8 col-12">
        <div className="card border-0 shadow-lg rounded-3">
          <div className="card-header bg-light border-bottom text-center">
            <h3 className="mb-0">Profile Details</h3>
            <p className="text-muted mb-0">Manage your account settings</p>
          </div>
          <form className="card-body" onSubmit={handleFormSubmit}>
          <div className="d-lg-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center mb-4 mb-lg-0">
        <div className="position-relative">
          <img
            src={imagePreview}
            className="avatar-xl rounded-circle border border-3"
            alt=""
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
            }}
          />
          {!imagePreview && ( // Only show the label if there's no image preview
            <div
              className="position-absolute top-0 start-0 d-flex align-items-center justify-content-center"
              style={{
                width: "100px", // Match the size of the image
                height: "100px", // Match the size of the image
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.8)", // Light background for contrast
                border: "2px dashed #007bff", // Dashed border for styling
                zIndex: 1, // Bring in front of the image
                opacity: 0.8, // Slightly transparent for a layered effect
                cursor: "pointer", // Show pointer cursor to indicate it's clickable
              }}
              onClick={() => document.getElementById("file-upload").click()} // Trigger file input click
            >
              <span
                className="text-center text-primary" // Centered text with primary color
                style={{
                  fontSize: "16px", // Font size for the text
                  fontWeight: "bold", // Bold text
                }}
              >
                + Add Photo
              </span>
            </div>
          )}

          {/* Invisible file input */}
          <input
            type="file"
            accept="image/*" // Accept image files only
            className="form-control position-absolute top-0 start-0"
            name="image"
            onChange={handleFileChange}
            id="file-upload" // ID for triggering the input click
            style={{ opacity: 0, height: "100%", width: "100%", cursor: "pointer" }} // Hide the input
          />
        </div>

        <div className="ms-3">
          <h4 className="mb-0">Your Profile Image</h4>
          {imageError && <p className="text-danger mt-2">{imageError}</p>} {/* Use Bootstrap text-danger class */}
        </div>
      </div>
    </div>





            <hr className="my-4" />
            <div>
              {/* Form */}
              <div className="row gx-3">
                {/* Full Name */}
                <div className="mb-3 col-12">
                  <label className="form-label" htmlFor="fname">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fname"
                    className="form-control border-2"
                    placeholder="Enter your full name"
                    required=""
                    value={profileData.full_name}
                    onChange={handleProfileChange}
                    name="full_name"
                  />
                  <div className="invalid-feedback">
                    Please enter your full name.
                  </div>
                </div>
                {/* About Me */}
                <div className="mb-3 col-12">
                  <label className="form-label" htmlFor="aboutMe">
                    About Me
                  </label>
                  <textarea
                    onChange={handleProfileChange}
                    name="about"
                    id="aboutMe"
                    cols="30"
                    rows="5"
                    className="form-control border-2"
                    value={profileData.about}
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>

                {/* Country */}
                <div className="mb-3 col-12">
                  <label className="form-label" htmlFor="country">
                    Country
                  </label>
                  <select
                    id="country"
                    className="form-select border-2"
                    required=""
                    value={profileData.country}
                    onChange={handleProfileChange}
                    name="country"
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    Please choose a country.
                  </div>
                </div>
                <div className="col-12 text-center">
                  {/* Button */}
                  <button className="btn btn-primary" type="submit">
                    Update Profile <i className="fas fa-check-circle"></i>
                  </button>
                </div>
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

export default Profile;
