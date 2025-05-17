import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../../utils/api';

export default function ChangePasswordModal({ show, onHide, force = false, onChanged }) {
  const [oldPw, setOld] = useState('');
  const [newPw, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/api/auth/change-password', {
        oldPassword: oldPw,
        newPassword: newPw,
        confirmPassword: confirm
      });
      localStorage.removeItem('token');
      if (onChanged) onChanged();
      else window.location.href = '/login';
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <Modal
      show={show}
      onHide={force ? undefined : onHide}
      backdrop={force ? 'static' : true}
      keyboard={!force}
    >
      <Modal.Header closeButton={!force}><Modal.Title>Change Password</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3"><Form.Label>Old Password</Form.Label>
            <Form.Control type="password" value={oldPw} onChange={e => setOld(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label>New Password</Form.Label>
            <Form.Control type="password" value={newPw} onChange={e => setNew(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label>Confirm New Password</Form.Label>
            <Form.Control type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </Form.Group>
          {msg && <p className="text-danger">{msg}</p>}
          <Button type="submit">Update Password</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
