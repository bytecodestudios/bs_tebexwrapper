import React from 'react';
import { DeleteTarget } from '../../utils/types';

export const ConfirmationModal: React.FC<{ target: DeleteTarget | null; onConfirm: () => void; onCancel: () => void; }> = ({ target, onConfirm, onCancel }) => {
    if (!target) return null;
    const isCategory = target.type === 'category';
    const warningText = isCategory ? 'This will also delete all items within this category.' : '';
    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content">
                <h3>Confirm Deletion</h3>
                <p>
                    Are you sure you want to delete the {target.type} <strong>"{target.name}"</strong>?
                    {warningText && <><br /><br /><strong>{warningText}</strong></>}
                    <br /><br />This action cannot be undone.
                </p>
                <div className="confirmation-modal-buttons">
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="confirm-btn" onClick={onConfirm}>Confirm & Delete</button>
                </div>
            </div>
        </div>
    );
};