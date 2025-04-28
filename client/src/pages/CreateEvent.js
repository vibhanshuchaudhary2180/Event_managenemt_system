"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import "./CreateEvent.css"

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const { title, description, date } = formData

  // Set minimum date to today
  const today = new Date()
  const minDate = today.toISOString().split("T")[0]

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!title || !description || !date) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      await api.post("/api/events", formData)
      setLoading(false)
      navigate("/")
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Failed to create event")
    }
  }

  return (
    <div className="create-event-container">
      <h1 className="page-title">Create New Event</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="event-form-card">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              className="form-control"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Event Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              className="form-control"
              placeholder="Enter event description"
              rows="5"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="date">Event Date and Time</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={date}
              onChange={onChange}
              className="form-control"
              min={minDate}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
