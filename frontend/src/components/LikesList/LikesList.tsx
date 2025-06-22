import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

interface User {
  userId: number;
  userFirstName: string;
  userLastName: string;
  profilePicture?: string;
}

interface Match {
  matchId: number;
  userAId: number;
  userBId: number;
  listingId: number;
  isMatch: boolean;
  userAConfirmed: boolean;
  userBConfirmed: boolean;
}

interface LikesListProps {
  show: boolean;
  onHide: () => void;
  users: User[];
  listingId: number;
  listingOwnerId?: number;
}

const LikesList: React.FC<LikesListProps> = ({ show, onHide, users, listingId, listingOwnerId }) => {
  const currentUserId = Number(localStorage.getItem('userId'));
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<number | null>(null); // userId being matched/unmatched
  const [pendingMatchUserId, setPendingMatchUserId] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Check if current user is the listing owner
  const isListingOwner = listingOwnerId && currentUserId === listingOwnerId;

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/match/user/${currentUserId}`)
      .then(res => res.json())
      .then(data => setMatches(data.filter((m: Match) => m.listingId === listingId)))
      .finally(() => setLoading(false));
  }, [show, listingId, currentUserId]);

  const isMatched = (userId: number) => {
    return matches.some(
      m => (m.userAId === currentUserId && m.userBId === userId || m.userAId === userId && m.userBId === currentUserId) && (m.userAConfirmed || m.userBConfirmed)
    );
  };

  const handleMatch = async (userId: number) => {
    setPending(userId);
    setPendingMatchUserId(userId);
    await fetch('http://localhost:5000/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAId: currentUserId,
        userBId: userId,
        listingId,
        actingUserId: currentUserId
      })
    });
    // Refresh matches
    const res = await fetch(`http://localhost:5000/api/match/user/${currentUserId}`);
    const data = await res.json();
    setMatches(data.filter((m: Match) => m.listingId === listingId));
    setPending(null);
  };

  const handleUnmatch = async (userId: number) => {
    setPending(userId);
    setPendingMatchUserId(null);
    await fetch('http://localhost:5000/api/match', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAId: currentUserId,
        userBId: userId,
        listingId
      })
    });
    // Refresh matches
    const res = await fetch(`http://localhost:5000/api/match/user/${currentUserId}`);
    const data = await res.json();
    setMatches(data.filter((m: Match) => m.listingId === listingId));
    setPending(null);
  };

  // Helper to get match object for a user
  const getMatch = (userId: number) =>
    matches.find(
      m => (m.userAId === currentUserId && m.userBId === userId || m.userAId === userId && m.userBId === currentUserId)
    );

  // Clear pendingMatchUserId if the match becomes mutual
  useEffect(() => {
    if (pendingMatchUserId !== null) {
      const match = getMatch(pendingMatchUserId);
      if (match && match.isMatch) {
        setPendingMatchUserId(null);
      }
    }
  }, [matches, pendingMatchUserId]);

  // Handle image load errors
  const handleImageError = (userId: number) => {
    setFailedImages(prev => new Set(prev).add(userId));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>People who liked this listing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {users.length === 0 ? (
          <p className="text-muted text-center">No likes yet</p>
        ) : (
          <div className="list-group">
            {users.map((user) => {
              if (user.userId === currentUserId) {
                return (
                  <div key={user.userId} className="list-group-item d-flex align-items-center gap-3 justify-content-between">
                    <Link
                      to={`/account/${user.userId}`}
                      className="d-flex align-items-center gap-3 flex-grow-1"
                      onClick={onHide}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {user.profilePicture && !failedImages.has(user.userId) ? (
                        <img
                          src={
                            user.profilePicture.startsWith('http')
                              ? user.profilePicture
                              : `http://localhost:5000${user.profilePicture}`
                          }
                          alt={`${user.userFirstName} ${user.userLastName}`}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={() => handleImageError(user.userId)}
                        />
                      ) : (
                        <FaUserCircle 
                          size={50} 
                          color="#bbb" 
                          style={{ background: '#eee', borderRadius: '50%' }} 
                        />
                      )}
                      <div>
                        <h6 className="mb-0">{user.userFirstName} {user.userLastName}</h6>
                      </div>
                    </Link>
                  </div>
                );
              }
              const match = getMatch(user.userId);
              const isPending = pending === user.userId || loading;
              let currentConfirmed = false;
              let otherConfirmed = false;
              if (match) {
                currentConfirmed =
                  (match.userAId === currentUserId && match.userAConfirmed) ||
                  (match.userBId === currentUserId && match.userBConfirmed);
                otherConfirmed =
                  (match.userAId !== currentUserId && match.userAConfirmed) ||
                  (match.userBId !== currentUserId && match.userBConfirmed);
              }
              // If both users confirmed, show 'Send message'
              if (match && match.isMatch) {
                return (
                  <div key={user.userId} className="list-group-item d-flex align-items-center gap-3 justify-content-between">
                    <Link
                      to={`/account/${user.userId}`}
                      className="d-flex align-items-center gap-3 flex-grow-1"
                      onClick={onHide}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {user.profilePicture && !failedImages.has(user.userId) ? (
                        <img
                          src={
                            user.profilePicture.startsWith('http')
                              ? user.profilePicture
                              : `http://localhost:5000${user.profilePicture}`
                          }
                          alt={`${user.userFirstName} ${user.userLastName}`}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={() => handleImageError(user.userId)}
                        />
                      ) : (
                        <FaUserCircle 
                          size={50} 
                          color="#bbb" 
                          style={{ background: '#eee', borderRadius: '50%' }} 
                        />
                      )}
                      <div>
                        <h6 className="mb-0">{user.userFirstName} {user.userLastName}</h6>
                      </div>
                    </Link>
                    {!isListingOwner && (
                      <button
                        className="btn btn-primary ms-auto"
                        style={{ minWidth: 120 }}
                        onClick={() => {
                          onHide();
                          navigate('/inbox', {
                            state: {
                              receiverId: user.userId,
                              receiverName: `${user.userFirstName} ${user.userLastName}`,
                              listingId: listingId
                            }
                          });
                        }}
                      >
                        Send message
                      </button>
                    )}
                  </div>
                );
              }
              // Optimistically show Cancel if just clicked Match (unless isMatch is true)
              if ((pendingMatchUserId === user.userId && !(match && match.isMatch)) || (match && currentConfirmed && !otherConfirmed && !match.isMatch)) {
                return (
                  <div key={user.userId} className="list-group-item d-flex align-items-center gap-3 justify-content-between">
                    <Link
                      to={`/account/${user.userId}`}
                      className="d-flex align-items-center gap-3 flex-grow-1"
                      onClick={onHide}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {user.profilePicture && !failedImages.has(user.userId) ? (
                        <img
                          src={
                            user.profilePicture.startsWith('http')
                              ? user.profilePicture
                              : `http://localhost:5000${user.profilePicture}`
                          }
                          alt={`${user.userFirstName} ${user.userLastName}`}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={() => handleImageError(user.userId)}
                        />
                      ) : (
                        <FaUserCircle 
                          size={50} 
                          color="#bbb" 
                          style={{ background: '#eee', borderRadius: '50%' }} 
                        />
                      )}
                      <div>
                        <h6 className="mb-0">{user.userFirstName} {user.userLastName}</h6>
                      </div>
                    </Link>
                    {!isListingOwner && (
                      <button
                        className="btn btn-outline-danger ms-auto"
                        style={{ minWidth: 80 }}
                        onClick={() => handleUnmatch(user.userId)}
                        disabled={isPending}
                      >
                        {isPending ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                );
              }
              // Otherwise, show 'Match' button
              return (
                <div key={user.userId} className="list-group-item d-flex align-items-center gap-3 justify-content-between">
                  <Link
                    to={`/account/${user.userId}`}
                    className="d-flex align-items-center gap-3 flex-grow-1"
                    onClick={onHide}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {user.profilePicture && !failedImages.has(user.userId) ? (
                      <img
                        src={
                          user.profilePicture.startsWith('http')
                            ? user.profilePicture
                            : `http://localhost:5000${user.profilePicture}`
                        }
                        alt={`${user.userFirstName} ${user.userLastName}`}
                        className="rounded-circle"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={() => handleImageError(user.userId)}
                      />
                    ) : (
                      <FaUserCircle 
                        size={50} 
                        color="#bbb" 
                        style={{ background: '#eee', borderRadius: '50%' }} 
                      />
                    )}
                    <div>
                      <h6 className="mb-0">{user.userFirstName} {user.userLastName}</h6>
                    </div>
                  </Link>
                  {!isListingOwner && (
                    <button
                      className="btn btn-outline-success ms-auto"
                      style={{ minWidth: 80 }}
                      onClick={() => handleMatch(user.userId)}
                      disabled={isPending}
                    >
                      {isPending ? '...' : 'Match'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LikesList; 