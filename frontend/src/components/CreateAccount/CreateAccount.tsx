import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
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
    setError("");
    
    // Validate age (must be at least 18 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      setError("You must be at least 18 years old to create an account.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
        setError(data.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setError("Something went wrong.");
    }
  };

  if (showSuccess) {
    // Redirect to homepage and open login modal after a short delay
    setTimeout(() => {
      navigate("/");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-login-modal'));
      }, 100); // slight delay to ensure navigation
    }, 1200); // show success for 1.2s
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
            height: "750px",
            borderRadius: "15px", 
            backgroundColor: "white",
            padding: "2rem",
            marginBottom: "20px"
          }}>
            <h1 className="mb-4">Create Account</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {showSuccess && <div className="alert alert-success">Account created successfully!</div>}
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
                  <div className="col-4">
                    <PhoneInput 
                      country={'ro'}
                      value={formData.phoneNumber}
                      onChange={phone => setFormData(prev => ({ ...prev, phoneNumber: phone }))}
                      inputClass="form-control"
                      containerClass="w-100"
                      inputProps={{
                        name: 'phoneNumber',
                        required: true,
                        autoFocus: false
                      }}
                    />
                  </div>
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
