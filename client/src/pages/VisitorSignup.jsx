import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const VisitorSignup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [entryCode, setEntryCode] = useState('')
  const [formData, setFormData] = useState({
    visitorName: '',
    mobileNumber: '',
    apartmentNumber: '',
    vehicleType: 'None',
    vehicleNumber: '',
    purpose: '',
    duration: '1 hour',
    timeOfVisit: new Date().toISOString().slice(0, 16)
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.visitorName || !formData.mobileNumber || !formData.apartmentNumber || !formData.purpose) {
      toast.error('Please fill all required fields')
      return
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    if (formData.vehicleType !== 'None' && !formData.vehicleNumber) {
      toast.error('Please enter vehicle number')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('http://localhost:5000/api/visitors', formData)
      setEntryCode(response.data.entryCode)
      setSuccess(true)
      toast.success('Visitor entry registered successfully!')
      
      sessionStorage.setItem('visitorInfo', JSON.stringify({
        name: formData.visitorName,
        mobile: formData.mobileNumber,
        entryCode: response.data.entryCode
      }))
      
    } catch (error) {
      console.error('Error registering visitor:', error)
      toast.error(error.response?.data?.message || 'Failed to register visitor')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h2>Registration Successful!</h2>
        <p>Your entry has been registered successfully.</p>
        <h3>Your Entry Code:</h3>
        <div className="entry-code">{entryCode}</div>
        <p>Please keep this code for reference during your visit.</p>
        <button 
          className="btn mt-3" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Visitor Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Visitor Name *</label>
            <input
              type="text"
              name="visitorName"
              className="form-control"
              value={formData.visitorName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input
              type="text"
              name="mobileNumber"
              className="form-control"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="10-digit number"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Apartment Number *</label>
            <input
              type="text"
              name="apartmentNumber"
              className="form-control"
              value={formData.apartmentNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Type</label>
            <select
              name="vehicleType"
              className="form-control"
              value={formData.vehicleType}
              onChange={handleChange}
            >
              <option value="None">None</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {formData.vehicleType !== 'None' && (
          <div className="form-group">
            <label className="form-label">Vehicle Number</label>
            <input
              type="text"
              name="vehicleNumber"
              className="form-control"
              value={formData.vehicleNumber}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Purpose of Visit *</label>
            <input
              type="text"
              name="purpose"
              className="form-control"
              value={formData.purpose}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Duration of Visit</label>
            <select
              name="duration"
              className="form-control"
              value={formData.duration}
              onChange={handleChange}
            >
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="Half day">Half day</option>
              <option value="Full day">Full day</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Time of Visit</label>
          <input
            type="datetime-local"
            name="timeOfVisit"
            className="form-control"
            value={formData.timeOfVisit}
            onChange={handleChange}
          />
        </div>

        <button 
          type="submit" 
          className="btn form-submit" 
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Entry'}
        </button>
      </form>
    </div>
  )
}

export default VisitorSignup