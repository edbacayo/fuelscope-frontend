import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DisclaimerModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Disclaimer</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        This app is provided “as is” without any warranties. While reasonable efforts are made to protect your data—such as securing access to authenticated users—no guarantees are made against data loss or breaches. Various factors, including third-party storage issues, may affect data integrity or availability. Use this service at your own risk.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default DisclaimerModal;
