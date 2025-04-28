"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import EventCard from "../components/EventCard"
import AuthContext from "../context/AuthContext"
import api from "../utils/api"
import "./Home.css"

const Home = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [registeredEventIds, setRegisteredEventIds] = useState([])

  const { isAuthenticated, user } = useContext(AuthContext)

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/api/events")
        setEvents(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch events")
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fetch user's registered events if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUserEvents = async () => {
        try {
          const response = await api.get(`/api/users/${user._id}/events`)
          const eventIds = response.data.map((event) => event._id)
          setRegisteredEventIds(eventIds)
        } catch (err) {
          console.error("Failed to fetch user events", err)
        }
      }

      fetchUserEvents()
    }
  }, [isAuthenticated, user])

  // Register for an event
  const handleRegister = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/register`)
      setRegisteredEventIds([...registeredEventIds, eventId])
      alert("Successfully registered for the event!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register for the event")
    }
  }

  // Cancel registration
  const handleCancel = async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}/cancel/${user._id}`)
      setRegisteredEventIds(registeredEventIds.filter((id) => id !== eventId))
      alert("Registration cancelled successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel registration")
    }
  }

  if (loading) return <div className="loading">Loading events...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Upcoming Events</h1>
        {isAuthenticated && (
          <Link to="/create-event" className="btn">
            Create New Event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>No upcoming events found.</p>
          {isAuthenticated && (
            <p>
              <Link to="/create-event">Create an event</Link> to get started!
            </p>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isRegistered={registeredEventIds.includes(event._id)}
              onRegister={handleRegister}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {!isAuthenticated && (
        <div className="auth-prompt">
          <p>
            <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to create events and register for
            events.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
