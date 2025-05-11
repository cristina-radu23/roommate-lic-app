import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

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
          <Button type="submit" className="w-100" variant="primary">
            Log in
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
