import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Droplet, MapPin, Phone, Clock } from 'lucide-react';

const UserDashboard = () => {
  // Mock hospital data directly inside the component
  const mockHospitalData = [
    {
      id: 1,
      name: "City General Hospital",
      address: "123 Main Street, Mumbai, Maharashtra",
      contact: "+91 9876543210",
      bloodInventory: {
        "A+": { units: 15, lastUpdated: "2 hours ago" },
        "A-": { units: 8, lastUpdated: "1 day ago" },
        "B+": { units: 12, lastUpdated: "5 hours ago" },
        "B-": { units: 5, lastUpdated: "3 days ago" },
        "AB+": { units: 7, lastUpdated: "12 hours ago" },
        "AB-": { units: 3, lastUpdated: "2 days ago" },
        "O+": { units: 20, lastUpdated: "1 hour ago" },
        "O-": { units: 10, lastUpdated: "6 hours ago" }
      }
    },
    {
      id: 2,
      name: "Life Care Medical Center",
      address: "456 Hospital Road, Delhi, Delhi",
      contact: "+91 8765432109",
      bloodInventory: {
        "A+": { units: 10, lastUpdated: "3 hours ago" },
        "A-": { units: 4, lastUpdated: "2 days ago" },
        "B+": { units: 18, lastUpdated: "1 hour ago" },
        "B-": { units: 6, lastUpdated: "1 day ago" },
        "AB+": { units: 5, lastUpdated: "8 hours ago" },
        "AB-": { units: 2, lastUpdated: "3 days ago" },
        "O+": { units: 25, lastUpdated: "4 hours ago" },
        "O-": { units: 8, lastUpdated: "12 hours ago" }
      }
    },
    {
      id: 3,
      name: "Sunshine Hospital",
      address: "789 Health Avenue, Bangalore, Karnataka",
      contact: "+91 7654321098",
      bloodInventory: {
        "A+": { units: 8, lastUpdated: "6 hours ago" },
        "A-": { units: 3, lastUpdated: "2 days ago" },
        "B+": { units: 14, lastUpdated: "3 hours ago" },
        "B-": { units: 4, lastUpdated: "1 day ago" },
        "AB+": { units: 6, lastUpdated: "10 hours ago" },
        "AB-": { units: 1, lastUpdated: "4 days ago" },
        "O+": { units: 16, lastUpdated: "2 hours ago" },
        "O-": { units: 5, lastUpdated: "1 day ago" }
      }
    },
    {
      id: 4,
      name: "Red Cross Blood Bank",
      address: "101 Donor Street, Chennai, Tamil Nadu",
      contact: "+91 6543210987",
      bloodInventory: {
        "A+": { units: 22, lastUpdated: "1 hour ago" },
        "A-": { units: 9, lastUpdated: "12 hours ago" },
        "B+": { units: 20, lastUpdated: "2 hours ago" },
        "B-": { units: 7, lastUpdated: "1 day ago" },
        "AB+": { units: 8, lastUpdated: "5 hours ago" },
        "AB-": { units: 4, lastUpdated: "2 days ago" },
        "O+": { units: 30, lastUpdated: "30 minutes ago" },
        "O-": { units: 12, lastUpdated: "3 hours ago" }
      }
    }
  ];

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
  const [isSearchVisible, setIsSearchVisible] = useState(true);

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
      // Fallback states in case API fails
      setStates([
        "Andhra Pradesh", "Delhi", "Karnataka", 
        "Maharashtra", "Tamil Nadu", "Telangana", "West Bengal"
      ]);
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
      // Fallback cities based on selected state
      const fallbackCities = {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        "Andhra Pradesh": ["Hyderabad", "Visakhapatnam", "Vijayawada"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
        "West Bengal": ["Kolkata", "Howrah", "Durgapur"]
      };
      setCities(fallbackCities[state] || []);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setIsSearchVisible(false);
    
    try {
      // Simulate API delay for animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter the local hospital data
      const results = mockHospitalData.filter(hospital => {
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

  const toggleSearchPanel = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const bloodTypeColors = {
    'A+': '#ef4444', // red-500
    'A-': '#dc2626', // red-600
    'B+': '#b91c1c', // red-700
    'B-': '#991b1b', // red-800
    'AB+': '#7e22ce', // purple-700
    'AB-': '#6b21a8', // purple-800
    'O+': '#ea580c', // orange-600
    'O-': '#c2410c', // orange-700
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#111827', // bg-gray-900
      color: 'white',
      padding: '16px',
    },
    innerContainer: {
      maxWidth: '1280px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#ef4444', // text-red-500
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    subtitle: {
      color: '#9ca3af', // text-gray-400
    },
    searchPanelWrapper: {
      transition: 'all 0.5s ease-in-out',
      overflow: 'hidden',
      maxHeight: isSearchVisible ? '24rem' : '4rem',
      opacity: isSearchVisible ? 1 : 0.9,
    },
    searchPanel: {
      backgroundColor: '#1f2937', // bg-gray-800
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #dc2626', // border-red-600
      marginBottom: '32px',
      overflow: 'hidden',
    },
    searchHeader: {
      padding: '16px',
      backgroundColor: '#374151', // bg-gray-700
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    searchHeaderTitle: {
      display: 'flex', 
      alignItems: 'center',
    },
    searchHeaderText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    searchHeaderIcon: {
      color: '#ef4444', // text-red-500
      marginRight: '8px',
    },
    chevronDown: {
      color: 'white',
      transition: 'transform 0.3s',
      transform: isSearchVisible ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    searchBody: {
      padding: '24px',
    },
    searchGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      marginBottom: '24px',
      '@media (min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr',
      },
      '@media (min-width: 1024px)': {
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      }
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      color: '#9ca3af', // text-gray-400
      marginBottom: '8px',
      transition: 'color 0.3s',
      ':hover': {
        color: '#f87171', // text-red-400
      }
    },
    inputWrapper: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      color: '#9ca3af', // text-gray-400
    },
    select: {
      width: '100%',
      padding: '8px 16px 8px 40px',
      borderRadius: '0.5rem',
      backgroundColor: '#374151', // bg-gray-700
      border: '1px solid #4b5563', // border-gray-600
      transition: 'all 0.3s',
      ':focus': {
        borderColor: '#ef4444', // border-red-500
        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.5)', // ring-2 ring-red-500
      }
    },
    button: {
      width: '100%',
      backgroundColor: '#dc2626', // bg-red-600
      color: 'white',
      fontWeight: 'bold',
      padding: '12px 16px',
      borderRadius: '0.5rem',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      ':hover': {
        backgroundColor: '#b91c1c', // bg-red-700
        transform: 'scale(1.05)',
      },
      ':active': {
        transform: 'scale(0.95)',
      }
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      height: '16px',
      width: '16px',
      borderTop: '2px solid white',
      borderBottom: '2px solid white',
      borderRadius: '50%',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      margin: '48px 0',
    },
    loadingAnimation: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    loadingIcon: {
      color: '#ef4444', // text-red-500
      animation: 'bounce 1s infinite',
    },
    loadingText: {
      marginTop: '16px',
      fontSize: '1.125rem',
    },
    resultsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    hospitalCard: (index) => ({
      backgroundColor: '#1f2937', // bg-gray-800
      padding: '24px',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #dc2626', // border-red-600
      transition: 'all 0.5s',
      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
      ':hover': {
        boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.3), 0 10px 10px -5px rgba(220, 38, 38, 0.2)',
      }
    }),
    hospitalHeader: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
      }
    },
    hospitalName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ef4444', // text-red-500
      marginBottom: '8px',
    },
    hospitalInfo: {
      marginBottom: '16px',
    },
    addressLine: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '8px',
    },
    contactLine: {
      display: 'flex',
      alignItems: 'center',
    },
    infoIcon: {
      color: '#9ca3af', // text-gray-400
      marginRight: '8px',
      marginTop: '4px',
    },
    infoText: {
      color: '#d1d5db', // text-gray-300
    },
    bloodTypeBox: {
      marginTop: '16px',
      '@media (min-width: 768px)': {
        marginTop: '0',
      },
      backgroundColor: '#374151', // bg-gray-700
      padding: '16px',
      borderRadius: '0.5rem',
      textAlign: 'center',
    },
    bloodUnitsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
    },
    bloodUnitsText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    lastUpdatedContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      color: '#9ca3af', // text-gray-400
    },
    clockIcon: {
      marginRight: '4px',
    },
    inventoryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '24px',
      '@media (min-width: 640px)': {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
      '@media (min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      }
    },
    bloodTypeItem: (type) => ({
      textAlign: 'center',
      padding: '12px',
      borderRadius: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s',
      backgroundColor: bloodTypeColors[type] || '#374151', // fallback to bg-gray-700
      ':hover': {
        transform: 'scale(1.05)',
      }
    }),
    bloodTypeName: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      marginBottom: '4px',
    },
    bloodTypeUnits: {
      color: '#e5e7eb', // text-gray-200
    },
    noResults: {
      textAlign: 'center',
      padding: '48px 0',
      animation: 'fadeIn 0.5s ease-out',
    },
    noResultsIcon: {
      margin: '0 auto 16px auto',
      color: '#4b5563', // text-gray-600
    },
    noResultsTitle: {
      fontSize: '1.25rem',
      color: '#d1d5db', // text-gray-300
      marginBottom: '8px',
    },
    noResultsText: {
      color: '#6b7280', // text-gray-500
    },
    '@keyframes fadeIn': {
      'from': { 
        opacity: 0, 
        transform: 'translateY(20px)' 
      },
      'to': { 
        opacity: 1, 
        transform: 'translateY(0)' 
      }
    },
    '@keyframes pulse': {
      '0%, 100%': { 
        opacity: 1 
      },
      '50%': { 
        opacity: .5 
      }
    },
    '@keyframes spin': {
      'from': { 
        transform: 'rotate(0deg)' 
      },
      'to': { 
        transform: 'rotate(360deg)' 
      }
    },
    '@keyframes bounce': {
      '0%, 100%': { 
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
      },
      '50%': { 
        transform: 'translateY(0)',
        animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* Header with pulse animation */}
        <div style={styles.header}>
          <h1 style={styles.title}>Blood Bank Finder</h1>
          <p style={styles.subtitle}>Find blood availability in hospitals near you</p>
        </div>

        {/* Search Panel with slide animation */}
        <div style={styles.searchPanelWrapper}>
          <div style={styles.searchPanel}>
            <div 
              style={styles.searchHeader}
              onClick={toggleSearchPanel}
            >
              <div style={styles.searchHeaderTitle}>
                <Search style={styles.searchHeaderIcon} />
                <h2 style={styles.searchHeaderText}>Search Blood Availability</h2>
              </div>
              <ChevronDown style={styles.chevronDown} />
            </div>
            
            <div style={styles.searchBody}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth >= 1024 ? 'repeat(4, 1fr)' : 
                                    window.innerWidth >= 768 ? 'repeat(2, 1fr)' : '1fr',
                gap: '24px',
                marginBottom: '24px',
              }}>
                <div>
                  <label style={styles.label}>Blood Type</label>
                  <div style={styles.inputWrapper}>
                    <Droplet style={styles.inputIcon} size={18} />
                    <select
                      name="bloodType"
                      value={searchParams.bloodType}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 16px 8px 40px',
                        borderRadius: '0.5rem',
                        backgroundColor: '#374151',
                        border: '1px solid #4b5563',
                        color: 'white',
                      }}
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
                </div>

                <div>
                  <label style={styles.label}>State</label>
                  <div style={styles.inputWrapper}>
                    <MapPin style={styles.inputIcon} size={18} />
                    <select
                      name="state"
                      value={searchParams.state}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 16px 8px 40px',
                        borderRadius: '0.5rem',
                        backgroundColor: '#374151',
                        border: '1px solid #4b5563',
                        color: 'white',
                      }}
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>City</label>
                  <div style={styles.inputWrapper}>
                    <MapPin style={styles.inputIcon} size={18} />
                    <select
                      name="city"
                      value={searchParams.city}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 16px 8px 40px',
                        borderRadius: '0.5rem',
                        backgroundColor: '#374151',
                        border: '1px solid #4b5563',
                        color: 'white',
                        opacity: !searchParams.state ? 0.5 : 1,
                      }}
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
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={handleSearch}
                    style={{
                      width: '100%',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '12px 16px',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          animation: 'spin 1s linear infinite',
                          height: '16px',
                          width: '16px',
                          borderTop: '2px solid white',
                          borderBottom: '2px solid white',
                          borderRadius: '50%',
                        }}></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingAnimation}>
              <Droplet size={48} style={styles.loadingIcon} />
              <p style={styles.loadingText}>Searching for blood availability...</p>
            </div>
          </div>
        )}

        {/* Search Results with fade-in animation */}
        <div style={styles.resultsContainer}>
          {searchResults.map((hospital, index) => (
            <div
              key={hospital.id}
              style={{
                backgroundColor: '#1f2937', // bg-gray-800
                padding: '24px',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #dc2626', // border-red-600
                transition: 'all 0.5s',
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div>
                  <h3 style={styles.hospitalName}>{hospital.name}</h3>
                  <div style={styles.addressLine}>
                    <MapPin style={styles.infoIcon} size={16} />
                    <p style={styles.infoText}>{hospital.address}</p>
                  </div>
                  <div style={styles.contactLine}>
                    <Phone style={styles.infoIcon} size={16} />
                    <p style={styles.infoText}>{hospital.contact}</p>
                  </div>
                </div>
                
                {searchParams.bloodType && (
                  <div style={{
                    marginTop: window.innerWidth >= 768 ? '0' : '16px',
                    backgroundColor: '#374151',
                    padding: '16px',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                  }}>
                    <div style={styles.bloodUnitsContainer}>
                      <Droplet style={{
                        marginRight: '8px',
                        color: hospital.bloodInventory[searchParams.bloodType].units > 5 ? '#10b981' : '#ef4444',
                      }} />
                      <p style={styles.bloodUnitsText}>
                        {hospital.bloodInventory[searchParams.bloodType].units} units
                      </p>
                    </div>
                    <div style={styles.lastUpdatedContainer}>
                      <Clock size={14} style={styles.clockIcon} />
                      <p>Updated: {hospital.bloodInventory[searchParams.bloodType].lastUpdated}</p>
                    </div>
                  </div>
                )}
              </div>

              {!searchParams.bloodType && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(4, 1fr)' : 
                                      window.innerWidth >= 640 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                  gap: '12px',
                  marginTop: '24px',
                }}>
                  {Object.entries(hospital.bloodInventory).map(([type, data]) => (
                    <div 
                      key={type} 
                      style={{
                        textAlign: 'center',
                        padding: '12px',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: bloodTypeColors[type] || '#374151',
                      }}
                    >
                      <p style={styles.bloodTypeName}>{type}</p>
                      <p style={styles.bloodTypeUnits}>{data.units} units</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {searchResults.length === 0 && !loading && searchParams.state && (
            <div style={styles.noResults}>
              <Droplet size={48} style={styles.noResultsIcon} />
              <p style={styles.noResultsTitle}>No hospitals found matching your criteria.</p>
              <p style={styles.noResultsText}>Try adjusting your search parameters or selecting a different location.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;