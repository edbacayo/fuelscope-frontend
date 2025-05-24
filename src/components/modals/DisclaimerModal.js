import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DisclaimerModal = ({ show, onHide }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>Disclaimer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>This application is provided "as is" and "as available" without warranties of any kind, either express or implied. No guarantee is made regarding the accuracy, reliability, availability, or security of the service. While reasonable efforts are made to protect your data, such as restricting access to authenticated users, we do not guarantee that the app will be free from loss, corruption, attacks, viruses, interference, hacking, or other security issues. We disclaim any liability related to these risks.</p>

            <p>By using this application, you agree that you do so at your own risk. You are solely responsible for the data you enter into the system and for any decisions or actions based on information from the app. We are not liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your use of, or inability to use, the service, even if we have been advised of the possibility of such damages.</p>

            <p>Data may be stored using third-party services, and we do not guarantee the continued availability or integrity of that data. You are responsible for maintaining your own backups and safeguards.</p>

            <p>Your continued use of this app indicates your acceptance of this disclaimer.</p>

        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
);

export default DisclaimerModal;
