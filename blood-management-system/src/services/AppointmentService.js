export class AppointmentService {
  constructor() {
    this.appointments = [];
    this.slots = {};
    this.hospitalCapacity = new Map();
    this.waitingList = new Map();
  }

  initializeHospitalSlots(hospitalId, config = {}) {
    const defaultConfig = {
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30, // minutes
      maxDonorsPerSlot: 3,
      breakTimes: ['13:00-14:00'],
      daysInAdvance: 30
    };

    const finalConfig = { ...defaultConfig, ...config };
    this.hospitalCapacity.set(hospitalId, finalConfig);
    
    // Generate slots for the next 30 days
    const slots = this.generateSlots(hospitalId, finalConfig);
    this.slots[hospitalId] = slots;
  }

  generateSlots(hospitalId, config) {
    const slots = {};
    const now = new Date();
    
    for (let i = 0; i < config.daysInAdvance; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      if (date.getDay() === 0) continue; // Skip Sundays
      
      const dateStr = date.toISOString().split('T')[0];
      slots[dateStr] = this.generateDaySlots(config);
    }
    
    return slots;
  }

  generateDaySlots(config) {
    const slots = [];
    const breakTimeRanges = config.breakTimes.map(break_ => {
      const [start, end] = break_.split('-');
      return { start, end };
    });

    let currentTime = this.parseTime(config.startTime);
    const endTime = this.parseTime(config.endTime);

    while (currentTime < endTime) {
      const timeStr = this.formatTime(currentTime);
      
      // Check if current time is in break time
      const isBreakTime = breakTimeRanges.some(break_ => 
        this.parseTime(break_.start) <= currentTime && 
        currentTime < this.parseTime(break_.end)
      );

      if (!isBreakTime) {
        slots.push({
          time: timeStr,
          capacity: config.maxDonorsPerSlot,
          booked: 0,
          donors: []
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + config.slotDuration);
    }

    return slots;
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  formatTime(date) {
    return date.toTimeString().substring(0, 5);
  }

  async scheduleAppointment(appointment) {
    const { hospitalId, date, time, donorId, donorInfo } = appointment;
    
    const dateSlots = this.slots[hospitalId]?.[date];
    if (!dateSlots) {
      throw new Error('No slots available for this date');
    }

    const slot = dateSlots.find(s => s.time === time);
    if (!slot) {
      throw new Error('Invalid time slot');
    }

    if (slot.booked >= slot.capacity) {
      // Add to waiting list
      if (!this.waitingList.has(hospitalId)) {
        this.waitingList.set(hospitalId, new Map());
      }
      const hospitalWaitList = this.waitingList.get(hospitalId);
      
      if (!hospitalWaitList.has(date)) {
        hospitalWaitList.set(date, []);
      }
      
      hospitalWaitList.get(date).push({
        donorId,
        donorInfo,
        preferredTime: time,
        requestedAt: new Date().toISOString()
      });

      throw new Error('Slot is full. Added to waiting list.');
    }

    const appointmentId = Date.now().toString();
    const newAppointment = {
      id: appointmentId,
      hospitalId,
      date,
      time,
      donorId,
      donorInfo,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checkInTime: null,
      completionTime: null,
      notes: []
    };

    slot.booked++;
    slot.donors.push(donorId);
    this.appointments.push(newAppointment);

    return newAppointment;
  }

  async rescheduleAppointment(appointmentId, newDate, newTime) {
    const appointment = this.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Cancel old slot
    const oldSlot = this.slots[appointment.hospitalId][appointment.date]
      .find(s => s.time === appointment.time);
    oldSlot.booked--;
    oldSlot.donors = oldSlot.donors.filter(id => id !== appointment.donorId);

    // Schedule new slot
    const newSlot = this.slots[appointment.hospitalId][newDate]
      .find(s => s.time === newTime);
    if (!newSlot || newSlot.booked >= newSlot.capacity) {
      throw new Error('New slot is not available');
    }

    appointment.date = newDate;
    appointment.time = newTime;
    appointment.updatedAt = new Date().toISOString();
    appointment.status = 'rescheduled';

    newSlot.booked++;
    newSlot.donors.push(appointment.donorId);

    return appointment;
  }

  async cancelAppointment(appointmentId) {
    const index = this.appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) {
      throw new Error('Appointment not found');
    }

    const appointment = this.appointments[index];
    const slot = this.slots[appointment.hospitalId][appointment.date]
      .find(s => s.time === appointment.time);

    slot.booked--;
    slot.donors = slot.donors.filter(id => id !== appointment.donorId);

    // Check waiting list
    const waitList = this.waitingList.get(appointment.hospitalId)?.get(appointment.date);
    if (waitList && waitList.length > 0) {
      const nextInLine = waitList.shift();
      try {
        await this.scheduleAppointment({
          hospitalId: appointment.hospitalId,
          date: appointment.date,
          time: appointment.time,
          donorId: nextInLine.donorId,
          donorInfo: nextInLine.donorInfo
        });
      } catch (error) {
        console.error('Error scheduling from waiting list:', error);
      }
    }

    appointment.status = 'cancelled';
    appointment.updatedAt = new Date().toISOString();

    return appointment;
  }

  async checkIn(appointmentId) {
    const appointment = this.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'rescheduled') {
      throw new Error('Invalid appointment status for check-in');
    }

    appointment.status = 'checked-in';
    appointment.checkInTime = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();

    return appointment;
  }

  async complete(appointmentId, notes = '') {
    const appointment = this.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'checked-in') {
      throw new Error('Appointment must be checked-in before completion');
    }

    appointment.status = 'completed';
    appointment.completionTime = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();
    if (notes) {
      appointment.notes.push({
        content: notes,
        timestamp: new Date().toISOString()
      });
    }

    return appointment;
  }

  getAvailableSlots(hospitalId, date) {
    return this.slots[hospitalId]?.[date] || [];
  }

  getDonorAppointments(donorId) {
    return this.appointments
      .filter(a => a.donorId === donorId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getHospitalAppointments(hospitalId, date) {
    return this.appointments
      .filter(a => a.hospitalId === hospitalId && a.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  getWaitingList(hospitalId, date) {
    return this.waitingList.get(hospitalId)?.get(date) || [];
  }
}
