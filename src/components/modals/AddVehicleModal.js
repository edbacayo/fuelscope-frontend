import React, { useState } from 'react';

const AddVehicleModal = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [odometer, setOdometer] = useState('');

  const handleSubmit = () => {
    onAdd(name, odometer);
    setName('');
    setOdometer('');
  };

  return (
    <div className="modal fade" id="addVehicleModal" tabIndex="-1" aria-labelledby="addVehicleModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="addVehicleModalLabel">Add Vehicle</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Odometer</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                className="form-control"
                value={odometer}
                onChange={e => setOdometer(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              disabled={!name || odometer === ''}
              onClick={handleSubmit}
            >Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
