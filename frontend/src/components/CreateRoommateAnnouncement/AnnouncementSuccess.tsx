import React from 'react';
import { useNavigate } from 'react-router-dom';

const AnnouncementSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid" style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "100px" }}>
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm" style={{ 
            borderRadius: "15px", 
            backgroundColor: "white",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <div className="text-center">
              <h3 className="mb-4">
                Announcement Created Successfully!
              </h3>
              <p className="mb-4">
                Your roommate announcement has been successfully posted and is now visible to potential roommates.
              </p>
              <button 
                onClick={() => navigate("/")}
                style={{ 
                  borderRadius: "8px",
                  padding: "0.5rem 2rem",
                  backgroundColor: "#a1cca7",
                  borderColor: "#a1cca7",
                  color: "white",
                  width: "30%",
                  display: "flex !important",
                  justifyContent: "center !important",
                  alignItems: "center !important",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "1px solid",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <span style={{ width: "100%", textAlign: "center" }}>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementSuccess; 