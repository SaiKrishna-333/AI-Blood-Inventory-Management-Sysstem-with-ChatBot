import React, { useState, useEffect } from 'react';
import { hospitalData } from '../data/hospitalData';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useState({
    bloodType: '',
    location: '',
    state: '',
    city: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch states from API
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch('https://api.minecode.in/api/v1/india/states');
      const data = await response.json();
      setStates(data.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch cities when state changes
  useEffect(() => {
    if (searchParams.state) {
      fetchCities(searchParams.state);
    }
  }, [searchParams.state]);

  const fetchCities = async (state) => {
    try {
      const response = await fetch(`https://api.minecode.in/api/v1/india/cities/${state}`);
      const data = await response.json();
      setCities(data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we'll filter the local hospital data
      const results = hospitalData.filter(hospital => {
        const locationMatch = 
          hospital.address.toLowerCase().includes(searchParams.city.toLowerCase()) ||
          hospital.address.toLowerCase().includes(searchParams.state.toLowerCase());
        
        if (!locationMatch) return false;
        
        if (searchParams.bloodType) {
          const bloodInfo = hospital.bloodInventory[searchParams.bloodType];
          return bloodInfo && bloodInfo.units > 0;
        }
        
        return true;
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-black p-6 rounded-lg shadow-lg border border-red-600 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Search Blood Availability</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-white mb-2">Blood Type</label>
            <select
              name="bloodType"
              value={searchParams.bloodType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg"
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
            <label className="block text-white mb-2">State</label>
            <select
              name="state"
              value={searchParams.state}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg"
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">City</label>
            <select
              name="city"
              value={searchParams.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg"
              disabled={!searchParams.state}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {searchResults.map(hospital => (
          <div
            key={hospital.id}
            className="bg-black p-6 rounded-lg shadow-lg border border-red-600"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-red-600">{hospital.name}</h3>
                <p className="text-white">{hospital.address}</p>
                <p className="text-white">Contact: {hospital.contact}</p>
              </div>
              {searchParams.bloodType && (
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {hospital.bloodInventory[searchParams.bloodType].units} units
                  </p>
                  <p className="text-sm text-gray-400">
                    Last updated: {hospital.bloodInventory[searchParams.bloodType].lastUpdated}
                  </p>
                </div>
              )}
            </div>

            {!searchParams.bloodType && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {Object.entries(hospital.bloodInventory).map(([type, data]) => (
                  <div key={type} className="text-center p-2 border border-red-600 rounded">
                    <p className="text-red-600 font-bold">{type}</p>
                    <p className="text-white">{data.units} units</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {searchResults.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-white text-lg">No hospitals found matching your criteria.</p>
            <p className="text-gray-400">Try adjusting your search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
