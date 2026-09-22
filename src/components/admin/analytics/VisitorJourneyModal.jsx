import React, { useEffect, useState } from 'react';
import { getVisitorJourney } from '../../../services/analytics';
import { X } from 'lucide-react';
import AnalyticsSkeleton from './AnalyticsSkeleton';

const VisitorJourneyModal = ({ sessionKey, onClose }) => {
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisitorJourney(sessionKey)
      .then(setTrail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionKey]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content journey-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Visitor Trail</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {loading ? <AnalyticsSkeleton type="chart" /> : (
            <div className="timeline-container">
              {trail?.map(event => (
                <div key={event.id} className="timeline-event">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="event-time">{new Date(event.created_at).toLocaleTimeString()}</span>
                    <strong>{event.event_type}</strong>
                    {event.event_name && <span className="event-name"> - {event.event_name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VisitorJourneyModal;