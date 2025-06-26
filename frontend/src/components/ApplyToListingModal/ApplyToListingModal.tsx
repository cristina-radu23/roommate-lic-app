import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaUserFriends, FaCheck } from 'react-icons/fa';

interface User {
  userId: number;
  userFirstName: string;
  userLastName: string;
  profilePicture?: string;
}

interface ApplyToListingModalProps {
  show: boolean;
  onHide: () => void;
  listingTitle: string;
  listingId: number;
  currentUserId: number;
}

const ApplyToListingModal: React.FC<ApplyToListingModalProps> = ({
  show,
  onHide,
  listingTitle,
  listingId,
  currentUserId
}) => {
  const [matches, setMatches] = useState<User[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user's matches when modal opens
  useEffect(() => {
    if (show && currentUserId) {
      fetchUserMatches();
    }
  }, [show, currentUserId]);

  const fetchUserMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/matches/user/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter only confirmed matches
        const confirmedMatches = data.filter((match: any) => 
          match.isMatch && 
          ((match.userAId === currentUserId && match.userAConfirmed) ||
           (match.userBId === currentUserId && match.userBConfirmed))
        );
        
        // Get the other user from each match
        const matchUsers = confirmedMatches.map((match: any) => {
          const otherUserId = match.userAId === currentUserId ? match.userBId : match.userAId;
          return {
            userId: otherUserId,
            userFirstName: match.userAId === currentUserId ? match.UserB?.userFirstName : match.UserA?.userFirstName,
            userLastName: match.userAId === currentUserId ? match.UserB?.userLastName : match.UserA?.userLastName,
            profilePicture: match.userAId === currentUserId ? match.UserB?.profilePicture : match.UserA?.profilePicture
          };
        });
        
        setMatches(matchUsers);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleMatchToggle = (userId: number) => {
    setSelectedMatches(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      setError('You must be logged in to apply');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const applicantIds = [currentUserId, ...selectedMatches];

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          applicantIds,
          message: message.trim() || null
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onHide();
          setSuccess(false);
          setSelectedMatches([]);
          setMessage('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProfilePictureUrl = (profilePicture: string) => {
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `http://localhost:5000${profilePicture}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUserFriends className="me-2" />
          Apply to {listingTitle}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <FaCheck className="me-2" />
            Application submitted successfully!
          </Alert>
        )}

        <div className="mb-4">
          <h6>Apply with your matches (optional):</h6>
          <p className="text-muted small">
            Select any of your confirmed matches to apply together for this listing.
          </p>
          
          {matches.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <FaUserFriends size={24} className="mb-2" />
              <p>No confirmed matches found</p>
              <small>You can still apply individually</small>
            </div>
          ) : (
            <div className="row g-2">
              {matches.map((match) => (
                <div key={match.userId} className="col-md-6">
                  <div 
                    className={`border rounded p-3 cursor-pointer ${
                      selectedMatches.includes(match.userId) 
                        ? 'border-primary bg-light' 
                        : 'border-light'
                    }`}
                    onClick={() => handleMatchToggle(match.userId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {selectedMatches.includes(match.userId) && (
                          <FaCheck className="text-primary" />
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {match.profilePicture ? (
                          <img
                            src={getProfilePictureUrl(match.profilePicture)}
                            alt={`${match.userFirstName} ${match.userLastName}`}
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <span className="text-white">
                              {(match.userFirstName?.[0] || '?')}{(match.userLastName?.[0] || '')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ms-3">
                        <div className="fw-medium">
                          {match.userFirstName} {match.userLastName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Message to the owner (optional):</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Tell the owner why you're interested in this listing..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
          <Form.Text className="text-muted">
            {message.length}/500 characters
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Confirm Apply'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplyToListingModal; 