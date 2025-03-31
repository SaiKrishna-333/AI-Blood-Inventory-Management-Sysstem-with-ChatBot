export class BloodMatchingService {
  constructor() {
    this.bloodCompatibility = this.initializeBloodCompatibility();
    this.riskFactors = this.initializeRiskFactors();
    this.specialRequirements = new Map();
  }

  initializeBloodCompatibility() {
    return {
      'A+': {
        canDonateTo: ['A+', 'AB+'],
        canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
        universalDonor: false,
        universalRecipient: false,
        rarity: 0.3
      },
      'A-': {
        canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
        canReceiveFrom: ['A-', 'O-'],
        universalDonor: false,
        universalRecipient: false,
        rarity: 0.06
      },
      'B+': {
        canDonateTo: ['B+', 'AB+'],
        canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
        universalDonor: false,
        universalRecipient: false,
        rarity: 0.08
      },
      'B-': {
        canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
        canReceiveFrom: ['B-', 'O-'],
        universalDonor: false,
        universalRecipient: false,
        rarity: 0.02
      },
      'AB+': {
        canDonateTo: ['AB+'],
        canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        universalDonor: false,
        universalRecipient: true,
        rarity: 0.03
      },
      'AB-': {
        canDonateTo: ['AB+', 'AB-'],
        canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
        universalDonor: false,
        universalRecipient: false,
        rarity: 0.01
      },
      'O+': {
        canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
        canReceiveFrom: ['O+', 'O-'],
        universalDonor: false,
        universalRecipient: false,
        rarity: 0.35
      },
      'O-': {
        canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        canReceiveFrom: ['O-'],
        universalDonor: true,
        universalRecipient: false,
        rarity: 0.15
      }
    };
  }

  initializeRiskFactors() {
    return {
      age: {
        young: 1.0,
        adult: 1.0,
        elderly: 1.2
      },
      medicalHistory: {
        none: 1.0,
        minor: 1.1,
        significant: 1.3
      },
      transfusionHistory: {
        none: 1.0,
        previous: 1.2,
        multiple: 1.4
      },
      pregnancy: {
        current: 1.5,
        previous: 1.2,
        none: 1.0
      },
      urgency: {
        routine: 1.0,
        urgent: 1.3,
        emergency: 1.5
      }
    };
  }

  async findMatch(request) {
    const {
      recipientBloodType,
      unitsNeeded,
      specialRequirements = [],
      patientInfo = {},
      urgency = 'routine'
    } = request;

    // Validate blood type
    if (!this.bloodCompatibility[recipientBloodType]) {
      throw new Error('Invalid blood type');
    }

    // Get compatible donor types
    const compatibleTypes = this.bloodCompatibility[recipientBloodType].canReceiveFrom;

    // Calculate risk score
    const riskScore = this.calculateRiskScore(patientInfo, urgency);

    // Find available units
    const availableUnits = await this.findAvailableUnits(
      compatibleTypes,
      unitsNeeded,
      specialRequirements,
      riskScore
    );

    // Optimize matches based on various factors
    const optimizedMatches = this.optimizeMatches(
      availableUnits,
      unitsNeeded,
      riskScore,
      specialRequirements
    );

    return {
      matches: optimizedMatches,
      riskScore,
      alternativeOptions: this.getAlternativeOptions(recipientBloodType, unitsNeeded)
    };
  }

  calculateRiskScore(patientInfo, urgency) {
    let score = 1.0;

    // Age factor
    if (patientInfo.age) {
      if (patientInfo.age < 18) score *= this.riskFactors.age.young;
      else if (patientInfo.age > 65) score *= this.riskFactors.age.elderly;
      else score *= this.riskFactors.age.adult;
    }

    // Medical history factor
    if (patientInfo.medicalHistory) {
      score *= this.riskFactors.medicalHistory[patientInfo.medicalHistory];
    }

    // Transfusion history factor
    if (patientInfo.transfusionHistory) {
      score *= this.riskFactors.transfusionHistory[patientInfo.transfusionHistory];
    }

    // Pregnancy factor
    if (patientInfo.pregnancy) {
      score *= this.riskFactors.pregnancy[patientInfo.pregnancy];
    }

    // Urgency factor
    score *= this.riskFactors.urgency[urgency];

    return score;
  }

  async findAvailableUnits(compatibleTypes, unitsNeeded, specialRequirements, riskScore) {
    const availableUnits = [];

    for (const bloodType of compatibleTypes) {
      // Simulated blood bank query
      const units = await this.queryBloodBank(bloodType, unitsNeeded, specialRequirements);
      availableUnits.push(...units);
    }

    return availableUnits;
  }

  optimizeMatches(availableUnits, unitsNeeded, riskScore, specialRequirements) {
    // Sort units based on multiple criteria
    const sortedUnits = availableUnits.sort((a, b) => {
      // Priority to exact blood type matches
      if (a.isExactMatch !== b.isExactMatch) {
        return b.isExactMatch - a.isExactMatch;
      }

      // Priority to fresher units
      const ageDiff = this.calculateAge(a.collectionDate) - 
                     this.calculateAge(b.collectionDate);
      if (ageDiff !== 0) return ageDiff;

      // Priority to special requirement matches
      const aReqMatch = this.matchesSpecialRequirements(a, specialRequirements);
      const bReqMatch = this.matchesSpecialRequirements(b, specialRequirements);
      if (aReqMatch !== bReqMatch) {
        return bReqMatch - aReqMatch;
      }

      return 0;
    });

    // Select optimal units
    return sortedUnits.slice(0, unitsNeeded);
  }

  getAlternativeOptions(bloodType, unitsNeeded) {
    const alternatives = [];
    const compatibility = this.bloodCompatibility[bloodType];

    // Check if plasma or platelets could be alternatives
    if (this.isPlasmaViable(bloodType, unitsNeeded)) {
      alternatives.push({
        type: 'plasma',
        compatibility: 'high',
        availability: 'good',
        processingTime: '24 hours'
      });
    }

    // Check if platelet concentrate could be used
    if (this.isPlateletViable(bloodType, unitsNeeded)) {
      alternatives.push({
        type: 'platelets',
        compatibility: 'medium',
        availability: 'limited',
        processingTime: '12 hours'
      });
    }

    // Check for synthetic alternatives
    if (this.areSyntheticsViable(bloodType, unitsNeeded)) {
      alternatives.push({
        type: 'synthetic',
        compatibility: 'universal',
        availability: 'limited',
        processingTime: '1 hour'
      });
    }

    return alternatives;
  }

  isPlasmaViable(bloodType, units) {
    // Implementation for plasma viability check
    return true;
  }

  isPlateletViable(bloodType, units) {
    // Implementation for platelet viability check
    return true;
  }

  areSyntheticsViable(bloodType, units) {
    // Implementation for synthetic alternatives check
    return false;
  }

  calculateAge(collectionDate) {
    return Math.floor((new Date() - new Date(collectionDate)) / (1000 * 60 * 60 * 24));
  }

  matchesSpecialRequirements(unit, requirements) {
    return requirements.every(req => unit.properties[req]);
  }

  async queryBloodBank(bloodType, unitsNeeded, specialRequirements) {
    // This would be replaced with actual blood bank database query
    return [];
  }

  addSpecialRequirement(requirementType, criteria) {
    this.specialRequirements.set(requirementType, criteria);
  }

  validateBloodUnit(unit, requirements) {
    const validationResults = {
      isValid: true,
      issues: []
    };

    // Check expiration
    if (new Date(unit.expirationDate) <= new Date()) {
      validationResults.isValid = false;
      validationResults.issues.push('Unit expired');
    }

    // Check storage conditions
    if (!this.validateStorageConditions(unit)) {
      validationResults.isValid = false;
      validationResults.issues.push('Storage conditions compromised');
    }

    // Check special requirements
    for (const requirement of requirements) {
      if (!unit.properties[requirement]) {
        validationResults.isValid = false;
        validationResults.issues.push(`Missing requirement: ${requirement}`);
      }
    }

    return validationResults;
  }

  validateStorageConditions(unit) {
    // Implementation for storage condition validation
    return true;
  }
}
