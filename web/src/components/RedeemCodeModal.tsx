import React, { useState, useEffect } from 'react';
import { AdminFeedback } from '../utils/types';

const ModalFeedback: React.FC<{ feedback: AdminFeedback | null }> = ({ feedback }) => {
    if (!feedback) return null;
    return <div className={`modal-feedback ${feedback.type}`}>{feedback.message}</div>;
};

export const RedeemCodeModal: React.FC<{ isOpen: boolean; onClose: () => void; onRedeem: (code: string) => Promise<void>; feedback: AdminFeedback | null; }> = ({ isOpen, onClose, onRedeem, feedback }) => {
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { if (feedback) setIsSubmitting(false); }, [feedback]);
    useEffect(() => { if (isOpen) { setCode(''); setIsSubmitting(false); } }, [isOpen]);
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || !code.trim()) return;
        setIsSubmitting(true);
        onRedeem(code);
    };

    return (
        <div className="redeem-modal-overlay" onClick={onClose}>
            <div className="redeem-modal-content" onClick={e => e.stopPropagation()}>
                <div className="redeem-modal-header">
                    <h3>Redeem a Code</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="redeem-modal-body">
                        <p>Enter your purchased code below to claim your rewards.</p>
                        <ModalFeedback feedback={feedback} />
                        <div className="redeem-form-group">
                            <input type="text" placeholder="YOUR-CODE-HERE" value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
                        </div>
                        <div className="redeem-modal-buttons">
                           <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                           <button type="submit" className="redeem-btn" disabled={!code.trim() || isSubmitting}>{isSubmitting ? 'Redeeming...' : 'Redeem'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};