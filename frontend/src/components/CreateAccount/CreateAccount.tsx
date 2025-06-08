import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const CreateAccount = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [formData, setFormData] = useState({
    userFirstName: "",
    userLastName: "",
    dateOfBirth: "",
    gender: "not specified",
    occupation: "not specified",
    email: "",
    password: "",
    phoneNumber: "",
    confirmPassword: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name === "new-password" ? "password" : name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate age (must be at least 18 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      alert("You must be at least 18 years old to create an account.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passwordHash: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);
      } else {
        alert(data.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Something went wrong.");
    }
  };

  if (showSuccess) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100%", 
        backgroundColor: "#f8f9fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "40px", 
          borderRadius: "8px", 
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center",
          width: "600px"
        }}>
          <h2 style={{ color: "#097C87", marginBottom: "20px" }}>Account created successfully!</h2>
          <p style={{ marginBottom: "30px" }}>Your account has been created. You can now log in to your account.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button 
              onClick={() => navigate("/")} 
              className="btn" 
              style={{ 
                backgroundColor: "white", 
                borderColor: "#097C87", 
                color: "#097C87",
                width: "40%",
                borderRadius: "8px",
                whiteSpace: "nowrap"
              }}
            >
              Go to Homepage
            </button>
            <button 
              onClick={() => navigate("/login")} 
              className="btn" 
              style={{ 
                backgroundColor: "#a1cca7", 
                borderColor: "#a1cca7", 
                color: "white",
                width: "40%",
                borderRadius: "8px",
                whiteSpace: "nowrap"
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f8f9fa", 
      height: "100%",
      width: "100%",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <div style={{ 
        height: "100%",
        overflowY: "auto"
      }}>
        <div className="container d-flex justify-content-center" style={{ marginTop: "80px" }}>
          <div className="card shadow-sm" style={{ 
            width: "650px", 
            height: "650px",
            borderRadius: "15px", 
            backgroundColor: "white",
            padding: "2rem"
          }}>
            <h1 className="mb-4">Create Account</h1>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">First name</label>
                  <input
                    type="text"
                    className="col-4 form-control"
                    name="userFirstName"
                    value={formData.userFirstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Last name</label>
                  <input
                    type="text"
                    className="col-4 form-control"
                    name="userLastName"
                    value={formData.userLastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Date of birth</label>
                  <input
                    type="date"
                    className="col-4 form-control"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Gender</label>
                  <select
                    className="col-4 form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="not specified">Select your gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Occupation</label>
                  <select
                    className="col-4 form-select"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                  >
                    <option value="not specified">Select your occupation</option>
                    <option value="student">Student</option>
                    <option value="employeed">Employed</option>
                  </select>
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Email</label>
                  <input
                    type="email"
                    className="col-4 form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="new-email"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Password</label>
                  <input
                    type="password"
                    className="col-4 form-control"
                    name="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Confirm Password</label>
                  <input
                    type="password"
                    className="col-4 form-control"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-8 mb-3 d-flex align-items-center">
                  <label className="col-4 me-2">Phone number</label>
                  <input
                    type="text"
                    className="col-4 form-control"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12 mb-3 d-flex justify-content-center" style={{ paddingBottom: "20px" }}>
                  <button type="submit" className="btn" style={{ 
                    width: "25%",
                    backgroundColor: "#a1cca7",
                    borderColor: "#a1cca7",
                    color: "white",
                    borderRadius: "8px",
                    padding: "0.375rem 1rem"
                  }}>
                    Create Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
