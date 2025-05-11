import {useState} from "react";

  const Login= () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //const[credidentials, setCredidentials]=useState({username:'', password:''});

   // const handleChange = (e) => {
     //   const { name, value } = e.target;
     //   setCredentials({ ...credentials, [name]: value });
    //  };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      
        try {
          const res = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
      
          const data = await res.json();
      
          if (res.ok) {
            alert("Login successful!");
            localStorage.setItem("token", data.token);

            // Store token or redirect if needed
          } else {
            alert("Error: " + data.error);
          }
        } catch (error) {
          console.error("Login error:", error);
          alert("Something went wrong.");
        }
      };
      
    

    return(
        <>
            <h1 className="mb-4">Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="input-group has-validation">
                    <div className="col-12 mb-3">
                        <label>
                        Email
                        <input type="text" className="form-control" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </label>
                    </div>
                    <div className="col-12 mb-3">
                        <label>
                        Password
                        <input type="password" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </label>
                    </div>
                    <div className="col-12 mb-3">
                        <button type="submit">Login</button>
                        <div className="invalid-feedback"> Please choose a username. </div>
                    </div>
                    </div>
                </div>
            </form>
        </>
    );

    
};

export default Login;