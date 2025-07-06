import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: (email: string, password: string) => void;
}

const LoginModal: React.FC<Props> = ({ show, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Clear inputs whenever the modal is opened
  useEffect(() => {
    if (show) {
      setEmail("");
      setPassword("");
    }
  }, [show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Log in</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="submit" 
              variant="primary"
              style={{ 
                minWidth: '120px',
                padding: '8px 24px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              Log in
            </Button>
          </div>
          <div className="text-center mt-3">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/createaccount" onClick={onClose} style={{ color: '#0d6efd', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
