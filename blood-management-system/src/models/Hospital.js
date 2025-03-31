export class Hospital {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.address = data.address || '';
    this.contact = data.contact || '';
    this.location = data.location || {
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      city: '',
      state: '',
      pincode: ''
    };
    this.bloodInventory = data.bloodInventory || this.initializeBloodInventory();
    this.facilities = data.facilities || [];
    this.specializations = data.specializations || [];
    this.accreditations = data.accreditations || [];
    this.operatingHours = data.operatingHours || this.initializeOperatingHours();
    this.emergencyContact = data.emergencyContact || '';
    this.bloodBankLicense = data.bloodBankLicense || '';
    this.staff = data.staff || [];
    this.equipments = data.equipments || [];
    this.donationHistory = data.donationHistory || [];
    this.requestHistory = data.requestHistory || [];
    this.ratings = data.ratings || [];
    this.notifications = data.notifications || [];
  }

  initializeBloodInventory() {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const inventory = {};
    
    bloodTypes.forEach(type => {
      inventory[type] = {
        units: 0,
        lastUpdated: new Date().toISOString(),
        criticalLevel: 10,
        optimalLevel: 50,
        expiryDates: []
      };
    });

    return inventory;
  }

  initializeOperatingHours() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hours = {};

    days.forEach(day => {
      hours[day] = {
        open: '09:00',
        close: '18:00',
        isOpen: true
      };
    });

    return hours;
  }

  updateBloodInventory(bloodType, change, expiryDate = null) {
    if (!this.bloodInventory[bloodType]) return false;

    const newUnits = this.bloodInventory[bloodType].units + change;
    if (newUnits < 0) return false;

    this.bloodInventory[bloodType].units = newUnits;
    this.bloodInventory[bloodType].lastUpdated = new Date().toISOString();

    if (expiryDate && change > 0) {
      this.bloodInventory[bloodType].expiryDates.push({
        units: change,
        expiryDate: expiryDate
      });
    }

    // Check if inventory is below critical level
    if (newUnits <= this.bloodInventory[bloodType].criticalLevel) {
      this.addNotification({
        type: 'critical_inventory',
        bloodType: bloodType,
        units: newUnits,
        message: `Critical inventory level for ${bloodType}`
      });
    }

    return true;
  }

  addStaffMember(staff) {
    this.staff.push({
      ...staff,
      id: Date.now().toString(),
      joinDate: new Date().toISOString()
    });
  }

  addEquipment(equipment) {
    this.equipments.push({
      ...equipment,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
      lastMaintenance: new Date().toISOString()
    });
  }

  addDonationRecord(donation) {
    this.donationHistory.push({
      ...donation,
      recordedAt: new Date().toISOString()
    });
  }

  addRequestRecord(request) {
    this.requestHistory.push({
      ...request,
      recordedAt: new Date().toISOString()
    });
  }

  addRating(rating) {
    this.ratings.push({
      ...rating,
      timestamp: new Date().toISOString()
    });
  }

  getAverageRating() {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, curr) => acc + curr.score, 0);
    return sum / this.ratings.length;
  }

  addNotification(notification) {
    this.notifications.unshift({
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  checkInventoryStatus() {
    const status = {};
    Object.entries(this.bloodInventory).forEach(([type, info]) => {
      const { units, criticalLevel, optimalLevel } = info;
      status[type] = {
        status: units <= criticalLevel ? 'critical' : units <= optimalLevel ? 'warning' : 'good',
        units,
        deficit: units <= optimalLevel ? optimalLevel - units : 0
      };
    });
    return status;
  }

  getExpiringSoon(days = 7) {
    const expiring = {};
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    Object.entries(this.bloodInventory).forEach(([type, info]) => {
      const expiringUnits = info.expiryDates.filter(item => 
        new Date(item.expiryDate) <= targetDate
      );
      if (expiringUnits.length > 0) {
        expiring[type] = expiringUnits;
      }
    });

    return expiring;
  }
}
