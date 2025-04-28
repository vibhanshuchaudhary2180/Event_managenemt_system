"use client"

import { useContext } from "react"
import AuthContext from "../context/AuthContext"
import "./EventCard.css"

const EventCard = ({ event, isRegistered, onRegister, onCancel }) => {
  const { isAuthenticated, user } = useContext(AuthContext)

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Check if user is the creator of the event
  const isCreator = user && event.creator && user._id === event.creator._id

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        {isCreator && <span className="creator-badge">Created by you</span>}
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-details">
        <p className="event-date">
          <span className="label">Date:</span> {formatDate(event.date)}
        </p>
        {event.creator && (
          <p className="event-creator">
            <span className="label">Organizer:</span> {event.creator.name}
          </p>
        )}
      </div>
      {isAuthenticated && !isCreator && (
        <div className="event-actions">
          {isRegistered ? (
            <button className="btn btn-danger" onClick={() => onCancel(event._id)}>
              Cancel Registration
            </button>
          ) : (
            <button className="btn" onClick={() => onRegister(event._id)}>
              Register
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCard
