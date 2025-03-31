import React, { useState, useEffect } from 'react';
import { hospitalData } from '../data/hospitalData';

const HospitalDashboard = () => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUnits, setEditedUnits] = useState({});

  // Simulating hospital login - in real app, this would come from authentication
  useEffect(() => {
    // For demo, using first hospital
    setSelectedHospital(hospitalData[0]);
    setInventory(hospitalData[0].bloodInventory);
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Initialize edited units with current values
      const currentUnits = {};
      Object.keys(inventory || {}).forEach(type => {
        currentUnits[type] = inventory[type].units;
      });
      setEditedUnits(currentUnits);
    }
  };

  const handleUnitChange = (bloodType, value) => {
    setEditedUnits(prev => ({
      ...prev,
      [bloodType]: parseInt(value) || 0
    }));
  };

  const handleSave = () => {
    const updatedInventory = { ...inventory };
    Object.keys(editedUnits).forEach(type => {
      updatedInventory[type] = {
        units: editedUnits[type],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    });
    setInventory(updatedInventory);
    setIsEditing(false);
  };

  if (!selectedHospital) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black p-6 rounded-lg shadow-lg border border-red-600">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {selectedHospital.name} - Blood Inventory Management
          </h1>
          <button
            onClick={handleEditToggle}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            {isEditing ? 'Cancel' : 'Edit Inventory'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventory && Object.entries(inventory).map(([type, data]) => (
            <div
              key={type}
              className="bg-black p-4 rounded-lg border border-red-600"
            >
              <h3 className="text-xl font-bold text-red-600 mb-2">{type}</h3>
              {isEditing ? (
                <input
                  type="number"
                  value={editedUnits[type]}
                  onChange={(e) => handleUnitChange(type, e.target.value)}
                  className="w-full bg-black text-white border border-red-600 rounded p-2"
                  min="0"
                />
              ) : (
                <>
                  <p className="text-2xl font-bold text-white">{data.units} units</p>
                  <p className="text-sm text-gray-400">Last updated: {data.lastUpdated}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Hospital Information</h2>
          <div className="bg-black p-4 rounded-lg border border-red-600">
            <p className="text-white"><span className="text-red-600">Address:</span> {selectedHospital.address}</p>
            <p className="text-white"><span className="text-red-600">Contact:</span> {selectedHospital.contact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
