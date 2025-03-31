import React, { useState } from 'react';

const RequestBlood = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodType: '',
    units: '',
    hospital: '',
    urgency: 'normal',
    contact: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Blood request submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-red-600 mb-8">Request Blood</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Blood Type</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Units Required</label>
            <input
              type="number"
              name="units"
              value={formData.units}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Hospital Name</label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Contact Number</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Reason for Request</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500"
            required
          ></textarea>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestBlood;
