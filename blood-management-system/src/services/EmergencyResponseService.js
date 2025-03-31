export class EmergencyResponseService {
  constructor(notificationService) {
    this.emergencyRequests = new Map();
    this.activeResponders = new Map();
    this.notificationService = notificationService;
    this.priorityLevels = {
      CRITICAL: 1,    // Immediate life-threatening situation
      URGENT: 2,      // Serious but not immediately life-threatening
      HIGH: 3,        // Needs quick attention
      MODERATE: 4,    // Can wait for short period
      ROUTINE: 5      // Standard request
    };
  }

  async createEmergencyRequest(request) {
    const emergencyId = Date.now().toString();
    const emergencyRequest = {
      id: emergencyId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      respondersAssigned: [],
      timeline: [],
      ...request
    };

    this.emergencyRequests.set(emergencyId, emergencyRequest);
    await this.addTimelineEvent(emergencyId, 'REQUEST_CREATED', 'Emergency request initiated');
    
    // Start the emergency response process
    await this.initiateEmergencyResponse(emergencyId);
    
    return emergencyRequest;
  }

  async initiateEmergencyResponse(emergencyId) {
    const request = this.emergencyRequests.get(emergencyId);
    if (!request) throw new Error('Emergency request not found');

    // Calculate response priority
    const priority = this.calculatePriority(request);
    request.priority = priority;

    // Find nearest available blood units
    const bloodSources = await this.findBloodSources(request);
    request.bloodSources = bloodSources;

    // Notify relevant stakeholders
    await this.notifyStakeholders(request);

    // Assign emergency responders
    await this.assignResponders(request);

    // Update request status
    await this.updateRequestStatus(emergencyId, 'IN_PROGRESS');

    return request;
  }

  calculatePriority(request) {
    let score = 0;

    // Patient condition
    switch (request.patientCondition) {
      case 'CRITICAL':
        score += 100;
        break;
      case 'SEVERE':
        score += 75;
        break;
      case 'SERIOUS':
        score += 50;
        break;
      case 'STABLE':
        score += 25;
        break;
    }

    // Blood loss volume
    if (request.bloodLossVolume) {
      if (request.bloodLossVolume > 2000) score += 50;
      else if (request.bloodLossVolume > 1000) score += 30;
      else if (request.bloodLossVolume > 500) score += 15;
    }

    // Time sensitivity
    if (request.requiredWithinHours) {
      if (request.requiredWithinHours <= 1) score += 50;
      else if (request.requiredWithinHours <= 3) score += 30;
      else if (request.requiredWithinHours <= 6) score += 15;
    }

    // Special conditions
    if (request.isTrauma) score += 25;
    if (request.isChildBirth) score += 20;
    if (request.isOrgan) score += 20;

    // Convert score to priority level
    if (score >= 150) return this.priorityLevels.CRITICAL;
    if (score >= 100) return this.priorityLevels.URGENT;
    if (score >= 75) return this.priorityLevels.HIGH;
    if (score >= 50) return this.priorityLevels.MODERATE;
    return this.priorityLevels.ROUTINE;
  }

  async findBloodSources(request) {
    const sources = [];
    const { bloodType, unitsNeeded, location } = request;

    // Get compatible blood types
    const compatibleTypes = this.getCompatibleBloodTypes(bloodType);

    // Find hospitals with available blood
    for (const hospital of this.getHospitalsInRange(location, 50)) { // 50km radius
      let availableUnits = 0;
      const inventory = {};

      for (const type of compatibleTypes) {
        const units = await this.checkHospitalInventory(hospital.id, type);
        if (units > 0) {
          inventory[type] = units;
          availableUnits += units;
        }
      }

      if (availableUnits > 0) {
        sources.push({
          hospitalId: hospital.id,
          name: hospital.name,
          distance: this.calculateDistance(location, hospital.location),
          inventory,
          totalUnits: availableUnits
        });
      }
    }

    // Sort by distance and available units
    return sources.sort((a, b) => {
      if (a.totalUnits >= unitsNeeded && b.totalUnits < unitsNeeded) return -1;
      if (b.totalUnits >= unitsNeeded && a.totalUnits < unitsNeeded) return 1;
      return a.distance - b.distance;
    });
  }

  getCompatibleBloodTypes(bloodType) {
    const compatibility = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };

    return compatibility[bloodType] || [];
  }

  async assignResponders(request) {
    const responders = [];
    const neededRoles = this.determineNeededRoles(request);

    for (const role of neededRoles) {
      const availableResponders = Array.from(this.activeResponders.values())
        .filter(r => r.role === role && r.status === 'AVAILABLE')
        .sort((a, b) => {
          const distanceA = this.calculateDistance(request.location, a.location);
          const distanceB = this.calculateDistance(request.location, b.location);
          return distanceA - distanceB;
        });

      if (availableResponders.length > 0) {
        const responder = availableResponders[0];
        responder.status = 'ASSIGNED';
        responders.push(responder);
      }
    }

    request.respondersAssigned = responders;
    await this.notifyResponders(request, responders);
  }

  determineNeededRoles(request) {
    const roles = ['BLOOD_TRANSPORT'];
    
    if (request.priority <= this.priorityLevels.URGENT) {
      roles.push('MEDICAL_ESCORT');
    }
    
    if (request.priority === this.priorityLevels.CRITICAL) {
      roles.push('EMERGENCY_MEDICAL_OFFICER');
    }

    return roles;
  }

  async notifyStakeholders(request) {
    // Notify requesting hospital
    await this.notificationService.notify({
      type: 'EMERGENCY_REQUEST_INITIATED',
      priority: request.priority,
      hospitalId: request.requestingHospitalId,
      emergencyId: request.id,
      message: `Emergency blood request initiated for ${request.bloodType}`
    });

    // Notify source hospitals
    for (const source of request.bloodSources) {
      await this.notificationService.notify({
        type: 'BLOOD_UNITS_NEEDED',
        priority: request.priority,
        hospitalId: source.hospitalId,
        emergencyId: request.id,
        message: `Emergency request for ${request.bloodType} blood units`
      });
    }

    // Notify emergency coordinators
    await this.notificationService.notify({
      type: 'EMERGENCY_COORDINATION_NEEDED',
      priority: request.priority,
      emergencyId: request.id,
      message: 'Emergency blood transport coordination required'
    });
  }

  async updateRequestStatus(emergencyId, status, notes = '') {
    const request = this.emergencyRequests.get(emergencyId);
    if (!request) throw new Error('Emergency request not found');

    request.status = status;
    request.updatedAt = new Date().toISOString();
    await this.addTimelineEvent(emergencyId, status, notes);

    // Notify stakeholders of status change
    await this.notificationService.notify({
      type: 'EMERGENCY_STATUS_UPDATE',
      priority: request.priority,
      emergencyId: request.id,
      status,
      message: `Emergency request status updated to ${status}`
    });
  }

  async addTimelineEvent(emergencyId, eventType, description) {
    const request = this.emergencyRequests.get(emergencyId);
    if (!request) throw new Error('Emergency request not found');

    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      description
    };

    request.timeline.push(event);
    return event;
  }

  getEmergencyDetails(emergencyId) {
    const request = this.emergencyRequests.get(emergencyId);
    if (!request) throw new Error('Emergency request not found');
    return request;
  }

  getActiveEmergencies() {
    return Array.from(this.emergencyRequests.values())
      .filter(request => request.status !== 'COMPLETED' && request.status !== 'CANCELLED')
      .sort((a, b) => a.priority - b.priority);
  }

  calculateDistance(point1, point2) {
    // Implementation of distance calculation between two points
    // Using Haversine formula for real coordinates
    return 0; // Placeholder
  }

  async checkHospitalInventory(hospitalId, bloodType) {
    // Implementation to check hospital's blood inventory
    return 0; // Placeholder
  }

  getHospitalsInRange(location, radius) {
    // Implementation to get hospitals within specified radius
    return []; // Placeholder
  }
}
