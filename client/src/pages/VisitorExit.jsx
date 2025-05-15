import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const VisitorExit = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    mobileNumber: '',
    entryCode: ''
  })

  useEffect(() => {
    const visitorInfo = JSON.parse(localStorage.getItem('visitorInfo') || '{}')
    if (visitorInfo.mobile && visitorInfo.entryCode) {
      setFormData({
        mobileNumber: visitorInfo.mobile,
        entryCode: visitorInfo.entryCode
      })
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.mobileNumber || !formData.entryCode) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      await axios.post('http://localhost:5000/api/visitors/exit', formData)
      
      localStorage.removeItem('visitorInfo')
      
      setSuccess(true)
      toast.success('Exit registered successfully!')
    } catch (error) {
      console.error('Error registering exit:', error)
      toast.error(error.response?.data?.message || 'Failed to register exit')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h2>Exit Registered Successfully!</h2>
        <p>Thank you for your visit.</p>
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
      <h2 className="form-title">Register Visitor Exit</h2>
      <form onSubmit={handleSubmit}>
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
        
        <div className="form-group">
          <label className="form-label">Entry Code *</label>
          <input
            type="text"
            name="entryCode"
            className="form-control"
            value={formData.entryCode}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn form-submit" 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Register Exit'}
        </button>
      </form>
    </div>
  )
}

export default VisitorExit