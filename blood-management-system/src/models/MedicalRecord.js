export class MedicalRecord {
  constructor(data = {}) {
    this.id = data.id || '';
    this.patientId = data.patientId || '';
    this.bloodType = data.bloodType || '';
    this.medicalHistory = data.medicalHistory || [];
    this.allergies = data.allergies || [];
    this.medications = data.medications || [];
    this.vaccinations = data.vaccinations || [];
    this.labResults = data.labResults || [];
    this.vitals = data.vitals || [];
    this.conditions = data.conditions || [];
    this.surgeries = data.surgeries || [];
    this.familyHistory = data.familyHistory || [];
    this.lifestyle = data.lifestyle || {
      smoking: false,
      alcohol: false,
      exercise: 'moderate',
      diet: 'balanced'
    };
    this.emergencyContacts = data.emergencyContacts || [];
    this.insuranceInfo = data.insuranceInfo || null;
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
  }

  addLabResult(result) {
    this.labResults.push({
      ...result,
      date: new Date().toISOString(),
      id: Date.now().toString()
    });
    this.updateLastModified();
  }

  addVitalSign(vital) {
    this.vitals.push({
      ...vital,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    });
    this.updateLastModified();
  }

  addCondition(condition) {
    this.conditions.push({
      ...condition,
      diagnosedDate: new Date().toISOString(),
      id: Date.now().toString(),
      status: 'active'
    });
    this.updateLastModified();
  }

  addMedication(medication) {
    this.medications.push({
      ...medication,
      prescribedDate: new Date().toISOString(),
      id: Date.now().toString(),
      status: 'active'
    });
    this.updateLastModified();
  }

  addAllergy(allergy) {
    this.allergies.push({
      ...allergy,
      identifiedDate: new Date().toISOString(),
      id: Date.now().toString()
    });
    this.updateLastModified();
  }

  addVaccination(vaccination) {
    this.vaccinations.push({
      ...vaccination,
      administeredDate: new Date().toISOString(),
      id: Date.now().toString()
    });
    this.updateLastModified();
  }

  addSurgery(surgery) {
    this.surgeries.push({
      ...surgery,
      date: new Date().toISOString(),
      id: Date.now().toString()
    });
    this.updateLastModified();
  }

  updateLifestyle(lifestyle) {
    this.lifestyle = {
      ...this.lifestyle,
      ...lifestyle
    };
    this.updateLastModified();
  }

  addEmergencyContact(contact) {
    this.emergencyContacts.push({
      ...contact,
      id: Date.now().toString(),
      addedDate: new Date().toISOString()
    });
    this.updateLastModified();
  }

  updateInsuranceInfo(insurance) {
    this.insuranceInfo = {
      ...insurance,
      lastUpdated: new Date().toISOString()
    };
    this.updateLastModified();
  }

  updateLastModified() {
    this.lastUpdated = new Date().toISOString();
  }

  getRecentVitals(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.vitals.filter(vital => 
      new Date(vital.timestamp) >= cutoffDate
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getActiveConditions() {
    return this.conditions.filter(condition => condition.status === 'active');
  }

  getActiveMedications() {
    return this.medications.filter(medication => medication.status === 'active');
  }

  getLabResultsByType(type) {
    return this.labResults
      .filter(result => result.type === type)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  checkBloodDonationEligibility() {
    const eligibilityChecks = {
      recentSurgery: false,
      activeConditions: false,
      medications: false,
      vitals: false
    };

    // Check recent surgeries (within 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    eligibilityChecks.recentSurgery = this.surgeries.some(
      surgery => new Date(surgery.date) >= sixMonthsAgo
    );

    // Check active conditions
    const disqualifyingConditions = ['diabetes', 'heart_disease', 'cancer'];
    eligibilityChecks.activeConditions = this.getActiveConditions().some(
      condition => disqualifyingConditions.includes(condition.name.toLowerCase())
    );

    // Check medications
    const disqualifyingMedications = ['blood_thinners', 'immunosuppressants'];
    eligibilityChecks.medications = this.getActiveMedications().some(
      medication => disqualifyingMedications.includes(medication.category.toLowerCase())
    );

    // Check recent vitals
    const recentVitals = this.getRecentVitals(1)[0];
    if (recentVitals) {
      eligibilityChecks.vitals = !(
        recentVitals.bloodPressure.systolic >= 90 &&
        recentVitals.bloodPressure.systolic <= 180 &&
        recentVitals.bloodPressure.diastolic >= 60 &&
        recentVitals.bloodPressure.diastolic <= 100 &&
        recentVitals.hemoglobin >= 12.5
      );
    }

    return {
      isEligible: !Object.values(eligibilityChecks).some(check => check),
      reasons: Object.entries(eligibilityChecks)
        .filter(([_, value]) => value)
        .map(([key]) => key)
    };
  }

  generateHealthSummary() {
    return {
      activeConditions: this.getActiveConditions(),
      activeMedications: this.getActiveMedications(),
      recentVitals: this.getRecentVitals(7),
      allergies: this.allergies,
      lastCheckup: this.labResults
        .filter(result => result.type === 'checkup')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0],
      lifestyle: this.lifestyle
    };
  }
}
