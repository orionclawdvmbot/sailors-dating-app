import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    age: '',
    location: '',
    sailingLevel: '',
    boatType: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        firstName: response.data.first_name || '',
        lastName: response.data.last_name || '',
        bio: response.data.bio || '',
        age: response.data.age || '',
        location: response.data.location || '',
        sailingLevel: response.data.sailing_level || '',
        boatType: response.data.boat_type || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await axios.put('/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('photo', file);

    try {
      setUploading(true);
      setError('');
      const response = await axios.post('/api/profile/upload-photo', formDataObj, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile({ ...profile, photos: response.data.photos });
      setSuccess('Photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card card">
        <h1>My Profile ⛵</h1>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {profile && (
          <>
            <div className="photo-section">
              <h3>Photos</h3>
              <div className="photos-grid">
                {profile.photos && profile.photos.map((photo, idx) => (
                  <div key={idx} className="photo-item">
                    <img src={photo} alt={`Profile ${idx + 1}`} />
                  </div>
                ))}
                <label className="photo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  <span>{uploading ? 'Uploading...' : '+ Add Photo'}</span>
                </label>
              </div>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Caribbean, Mediterranean"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sailing Level</label>
                    <select
                      name="sailingLevel"
                      value={formData.sailingLevel}
                      onChange={handleInputChange}
                    >
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Boat Type</label>
                    <input
                      type="text"
                      name="boatType"
                      value={formData.boatType}
                      onChange={handleInputChange}
                      placeholder="e.g., Sailboat, Catamaran"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="button-group">
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-view">
                <div className="profile-header">
                  <h2>{profile.first_name || profile.username}</h2>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="info-grid">
                  {profile.age && <p><strong>Age:</strong> {profile.age}</p>}
                  {profile.location && <p><strong>Location:</strong> {profile.location}</p>}
                  {profile.sailing_level && <p><strong>Sailing Level:</strong> {profile.sailing_level}</p>}
                  {profile.boat_type && <p><strong>Boat Type:</strong> {profile.boat_type}</p>}
                </div>

                {profile.bio && (
                  <div className="bio-section">
                    <h3>About</h3>
                    <p>{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
