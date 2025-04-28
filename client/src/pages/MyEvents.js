"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import EventCard from "../components/EventCard"
import AuthContext from "../context/AuthContext"
import api from "../utils/api"
import "./MyEvents.css"

const MyEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useContext(AuthContext)

  // Fetch user's registered events
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await api.get(`/api/users/${user._id}/events`)
        setEvents(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch your events")
        setLoading(false)
      }
    }

    fetchUserEvents()
  }, [user._id])

  // Cancel registration
  const handleCancel = async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}/cancel/${user._id}`)
      setEvents(events.filter((event) => event._id !== eventId))
      alert("Registration cancelled successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel registration")
    }
  }

  if (loading) return <div className="loading">Loading your events...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="my-events-page">
      <div className="page-header">
        <h1>My Registered Events</h1>
        <Link to="/create-event" className="btn">
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>You haven't registered for any upcoming events yet.</p>
          <p>
            <Link to="/">Browse all events</Link> to find something interesting!
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} isRegistered={true} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEvents
