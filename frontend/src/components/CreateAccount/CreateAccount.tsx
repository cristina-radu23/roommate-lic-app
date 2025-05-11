import { useState } from "react";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    userFirstName: "",
    userLastName: "",
    dateOfBirth: "",
    gender: "not specified",
    occupation: "not specified",
    email: "",
    password: "",
    phoneNumber: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        alert("Account created successfully!");
        // optionally clear form or redirect
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="container d-flex justify-content-center vh-100" style={{ marginTop: "80px" }}>
      <div className="w-50">
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
              />
            </div>
            <div className="col-8 mb-3 d-flex align-items-center">
              <label className="col-4 me-2">Password</label>
              <input
                type="password"
                className="col-4 form-control"
                name="password"
                value={formData.password}
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
            <div className="col-12 mb-3">
              <button type="submit" className="btn btn-primary col-11">
                Create Account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
