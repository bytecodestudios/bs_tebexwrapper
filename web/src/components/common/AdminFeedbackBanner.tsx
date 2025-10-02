import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { AdminFeedback } from '../../utils/types';

export const AdminFeedbackBanner: React.FC<{ feedback: AdminFeedback | null; onDismiss: () => void; }> = ({ feedback, onDismiss }) => {
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(onDismiss, 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback, onDismiss]);

    if (!feedback) return null;

    return (
        <div className={`admin-feedback-banner ${feedback.type}`}>
            {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{feedback.message}</span>
            <button className="dismiss-btn" onClick={onDismiss}><FaTimes /></button>
        </div>
    );
};