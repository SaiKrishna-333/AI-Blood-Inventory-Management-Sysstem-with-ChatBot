export class DonorProfile {
  constructor(data = {}) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.bloodType = data.bloodType || '';
    this.lastDonationDate = data.lastDonationDate || null;
    this.medicalHistory = data.medicalHistory || [];
    this.allergies = data.allergies || [];
    this.medications = data.medications || [];
    this.weight = data.weight || 0;
    this.height = data.height || 0;
    this.age = data.age || 0;
    this.gender = data.gender || '';
    this.donationCount = data.donationCount || 0;
    this.eligibilityStatus = data.eligibilityStatus || 'pending';
    this.nextEligibleDate = data.nextEligibleDate || null;
    this.bloodPressure = data.bloodPressure || { systolic: 0, diastolic: 0 };
    this.hemoglobinLevel = data.hemoglobinLevel || 0;
    this.certificates = data.certificates || [];
    this.rewards = data.rewards || [];
  }

  isEligibleToDonate() {
    const today = new Date();
    const lastDonation = this.lastDonationDate ? new Date(this.lastDonationDate) : null;
    const minDaysBetweenDonations = 56; // 8 weeks

    if (!lastDonation) return true;

    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    return daysSinceLastDonation >= minDaysBetweenDonations;
  }

  calculateBMI() {
    if (!this.weight || !this.height) return 0;
    const heightInMeters = this.height / 100;
    return this.weight / (heightInMeters * heightInMeters);
  }

  checkBasicEligibility() {
    const bmi = this.calculateBMI();
    const isHealthyBMI = bmi >= 18.5 && bmi <= 35;
    const isHealthyAge = this.age >= 18 && this.age <= 65;
    const isHealthyWeight = this.weight >= 50;
    const isHealthyHemoglobin = this.hemoglobinLevel >= 12.5;
    const isHealthyBP = 
      this.bloodPressure.systolic >= 90 && 
      this.bloodPressure.systolic <= 180 &&
      this.bloodPressure.diastolic >= 60 && 
      this.bloodPressure.diastolic <= 100;

    return {
      eligible: isHealthyBMI && isHealthyAge && isHealthyWeight && isHealthyHemoglobin && isHealthyBP,
      reasons: {
        bmi: !isHealthyBMI ? 'BMI out of healthy range' : null,
        age: !isHealthyAge ? 'Age not within eligible range' : null,
        weight: !isHealthyWeight ? 'Weight below minimum requirement' : null,
        hemoglobin: !isHealthyHemoglobin ? 'Hemoglobin level too low' : null,
        bloodPressure: !isHealthyBP ? 'Blood pressure out of range' : null
      }
    };
  }

  addMedicalHistory(condition) {
    this.medicalHistory.push({
      condition,
      dateAdded: new Date().toISOString(),
      status: 'active'
    });
  }

  addAllergy(allergy) {
    this.allergies.push({
      name: allergy,
      severity: 'unknown',
      dateAdded: new Date().toISOString()
    });
  }

  updateEligibilityStatus() {
    const basicEligibility = this.checkBasicEligibility();
    const canDonate = this.isEligibleToDonate();

    if (!basicEligibility.eligible) {
      this.eligibilityStatus = 'ineligible';
      return basicEligibility.reasons;
    }

    if (!canDonate) {
      this.eligibilityStatus = 'temporary_ineligible';
      return { timeConstraint: 'Must wait longer between donations' };
    }

    this.eligibilityStatus = 'eligible';
    return null;
  }

  addDonation(donation) {
    this.donationCount++;
    this.lastDonationDate = donation.date;
    this.nextEligibleDate = new Date(donation.date);
    this.nextEligibleDate.setDate(this.nextEligibleDate.getDate() + 56);
    
    // Add rewards based on donation count
    if (this.donationCount % 5 === 0) {
      this.rewards.push({
        type: 'milestone',
        description: `${this.donationCount}th Donation Achievement`,
        dateAwarded: new Date().toISOString()
      });
    }
  }
}
