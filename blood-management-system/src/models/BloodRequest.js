export class BloodRequest {
  constructor(data = {}) {
    this.id = data.id || '';
    this.patientId = data.patientId || '';
    this.requesterId = data.requesterId || '';
    this.hospitalId = data.hospitalId || '';
    this.bloodType = data.bloodType || '';
    this.unitsNeeded = data.unitsNeeded || 1;
    this.urgency = data.urgency || 'normal'; // normal, urgent, emergency
    this.status = data.status || 'pending'; // pending, approved, fulfilled, cancelled
    this.createdAt = data.createdAt || new Date().toISOString();
    this.requiredBy = data.requiredBy || '';
    this.diagnosis = data.diagnosis || '';
    this.patientCondition = data.patientCondition || '';
    this.medicalDocuments = data.medicalDocuments || [];
    this.prescribingDoctor = data.prescribingDoctor || '';
    this.contactPerson = data.contactPerson || {
      name: '',
      relation: '',
      phone: '',
      email: ''
    };
    this.location = data.location || {
      hospital: '',
      ward: '',
      room: ''
    };
    this.fulfillmentDetails = data.fulfillmentDetails || [];
    this.notes = data.notes || [];
  }

  calculatePriority() {
    let score = 0;

    // Urgency level
    switch (this.urgency) {
      case 'emergency':
        score += 100;
        break;
      case 'urgent':
        score += 50;
        break;
      case 'normal':
        score += 10;
        break;
    }

    // Time sensitivity
    if (this.requiredBy) {
      const hoursUntilNeeded = (new Date(this.requiredBy) - new Date()) / (1000 * 60 * 60);
      if (hoursUntilNeeded <= 6) score += 50;
      else if (hoursUntilNeeded <= 24) score += 30;
      else if (hoursUntilNeeded <= 72) score += 10;
    }

    // Patient condition
    if (this.patientCondition === 'critical') score += 40;
    if (this.patientCondition === 'serious') score += 20;

    return score;
  }

  addNote(note) {
    this.notes.push({
      content: note,
      timestamp: new Date().toISOString(),
      type: 'general'
    });
  }

  updateStatus(newStatus, reason) {
    this.status = newStatus;
    this.addNote({
      content: `Status updated to ${newStatus}: ${reason}`,
      timestamp: new Date().toISOString(),
      type: 'status_change'
    });
  }

  addFulfillment(fulfillment) {
    this.fulfillmentDetails.push({
      ...fulfillment,
      timestamp: new Date().toISOString()
    });

    const totalUnitsFulfilled = this.fulfillmentDetails.reduce(
      (total, detail) => total + detail.units, 0
    );

    if (totalUnitsFulfilled >= this.unitsNeeded) {
      this.updateStatus('fulfilled', 'All required units have been fulfilled');
    }
  }

  addMedicalDocument(document) {
    this.medicalDocuments.push({
      ...document,
      uploadedAt: new Date().toISOString()
    });
  }

  isExpired() {
    if (!this.requiredBy) return false;
    return new Date(this.requiredBy) < new Date();
  }

  getRemainingUnits() {
    const fulfilledUnits = this.fulfillmentDetails.reduce(
      (total, detail) => total + detail.units, 0
    );
    return this.unitsNeeded - fulfilledUnits;
  }

  getTimeline() {
    const timeline = [
      ...this.notes.map(note => ({
        ...note,
        type: 'note'
      })),
      ...this.fulfillmentDetails.map(detail => ({
        timestamp: detail.timestamp,
        content: `Received ${detail.units} units from ${detail.donorId || 'blood bank'}`,
        type: 'fulfillment'
      })),
      ...this.medicalDocuments.map(doc => ({
        timestamp: doc.uploadedAt,
        content: `Document uploaded: ${doc.name}`,
        type: 'document'
      }))
    ];

    return timeline.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }
}
