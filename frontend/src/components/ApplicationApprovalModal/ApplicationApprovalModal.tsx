import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaCheck, FaTimes, FaEnvelope, FaCalendar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Applicant {
  userId: number;
  userFirstName: string;
  userLastName: string;
  profilePicture?: string;
  email: string;
}

interface Application {
  applicationId: number;
  listingId: number;
  applicantIds: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
  applicants: Applicant[];
  listing?: {
    title?: string;
    user?: {
      userId: number;
      userFirstName: string;
      userLastName: string;
    };
  };
}

interface ApplicationApprovalModalProps {
  show: boolean;
  onHide: () => void;
  applicationId?: number;
}

const ApplicationApprovalModal: React.FC<ApplicationApprovalModalProps> = ({
  show,
  onHide,
  applicationId
}) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show && applicationId) {
      fetchApplication();
    }
  }, [show, applicationId]);

  const fetchApplication = async () => {
    if (!applicationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
      } else {
        setError('Failed to load application details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    
    setApproving(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${application.applicationId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Navigate to the new group chat
        navigate('/inbox', { state: { chatRoomId: data.chatRoomId } });
        onHide();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to approve application');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    
    setRejecting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${application.applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        onHide();
        // Optionally refresh the applications list
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reject application');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  const getProfilePictureUrl = (profilePicture: string) => {
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `http://localhost:5000${profilePicture}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading application details...</p>
        </Modal.Body>
      </Modal>
    );
  }

  if (!application) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <p>Application not found</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEnvelope className="me-2" />
          Application Review
          {getStatusBadge(application.status)}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-4">
          <h6>Application Details</h6>
          <div className="d-flex align-items-center text-muted mb-2">
            <FaCalendar className="me-2" />
            Applied on {formatDate(application.createdAt)}
          </div>
          
          {application.message && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title className="h6">Message from applicants:</Card.Title>
                <Card.Text>{application.message}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </div>

        <div className="mb-4">
          <h6>Applicants ({application.applicants.length})</h6>
          <div className="row g-3">
            {application.applicants.map((applicant) => (
              <div key={applicant.userId} className="col-md-6">
                <Card
                  onClick={() => navigate(`/account/${applicant.userId}`)}
                  style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  className="applicant-card-hover"
                >
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        {applicant.profilePicture ? (
                          <img
                            src={getProfilePictureUrl(applicant.profilePicture)}
                            alt={`${applicant.userFirstName} ${applicant.userLastName}`}
                            className="rounded-circle"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <FaUser className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1">
                          {applicant.userFirstName} {applicant.userLastName}
                        </h6>
                        <small className="text-muted">
                          {applicant.email}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={approving || rejecting}>
          Close
        </Button>
        
        {application.status === 'pending' && (
          <>
            <Button 
              variant="outline-danger" 
              onClick={handleReject}
              disabled={approving || rejecting}
            >
              {rejecting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <FaTimes className="me-2" />
                  Reject
                </>
              )}
            </Button>
            <Button 
              variant="success" 
              onClick={handleApprove}
              disabled={approving || rejecting}
            >
              {approving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Approving...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  Approve & Create Chat
                </>
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ApplicationApprovalModal; 