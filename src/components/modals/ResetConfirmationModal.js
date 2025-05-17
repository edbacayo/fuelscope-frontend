import { Modal, Button, Form } from 'react-bootstrap';

export default function ResetConfirmationModal({ show, onHide, tempPassword }) {
  const copyToClipboard = () => navigator.clipboard.writeText(tempPassword);
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Password Reset Successful</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Temporary Password:</p>
        <Form.Control type="text" readOnly value={tempPassword} />
        <Button variant="secondary" onClick={copyToClipboard}>Copy to Clipboard</Button>
        <p className="mt-2 text-warning">
          This password will not be shown again—make sure to copy it now.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
