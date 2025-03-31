export class NotificationService {
  constructor() {
    this.subscribers = new Map();
    this.notificationHistory = [];
    this.priorityLevels = {
      EMERGENCY: 1,
      URGENT: 2,
      HIGH: 3,
      MEDIUM: 4,
      LOW: 5
    };
  }

  subscribe(userId, callback) {
    this.subscribers.set(userId, callback);
  }

  unsubscribe(userId) {
    this.subscribers.delete(userId);
  }

  async notify(notification) {
    const formattedNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notificationHistory.push(formattedNotification);

    // Notify all subscribers
    for (const callback of this.subscribers.values()) {
      try {
        await callback(formattedNotification);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    }

    // If it's a critical notification, trigger additional actions
    if (this.isCriticalNotification(notification)) {
      await this.handleCriticalNotification(formattedNotification);
    }

    return formattedNotification;
  }

  isCriticalNotification(notification) {
    return notification.priority === this.priorityLevels.EMERGENCY ||
           notification.priority === this.priorityLevels.URGENT;
  }

  async handleCriticalNotification(notification) {
    // Send SMS
    if (notification.contactNumber) {
      await this.sendSMS(notification);
    }

    // Send Email
    if (notification.email) {
      await this.sendEmail(notification);
    }

    // Push Notification
    await this.sendPushNotification(notification);
  }

  async sendSMS(notification) {
    // Implementation for SMS service integration
    console.log('Sending SMS:', notification);
  }

  async sendEmail(notification) {
    // Implementation for email service integration
    console.log('Sending Email:', notification);
  }

  async sendPushNotification(notification) {
    // Implementation for push notification service
    console.log('Sending Push Notification:', notification);
  }

  getNotificationsByUser(userId, options = {}) {
    let notifications = this.notificationHistory.filter(
      notification => notification.userId === userId
    );

    if (options.unreadOnly) {
      notifications = notifications.filter(notification => !notification.read);
    }

    if (options.priority) {
      notifications = notifications.filter(
        notification => notification.priority === options.priority
      );
    }

    if (options.startDate) {
      notifications = notifications.filter(
        notification => new Date(notification.timestamp) >= new Date(options.startDate)
      );
    }

    return notifications.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  markAsRead(notificationId) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  markAllAsRead(userId) {
    this.notificationHistory
      .filter(notification => notification.userId === userId)
      .forEach(notification => notification.read = true);
  }

  deleteNotification(notificationId) {
    const index = this.notificationHistory.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notificationHistory.splice(index, 1);
      return true;
    }
    return false;
  }

  clearOldNotifications(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    this.notificationHistory = this.notificationHistory.filter(
      notification => new Date(notification.timestamp) >= cutoffDate
    );
  }

  // Notification Templates
  createLowInventoryNotification(bloodType, units, hospitalId) {
    return {
      type: 'LOW_INVENTORY',
      priority: this.priorityLevels.HIGH,
      title: `Low ${bloodType} Blood Inventory Alert`,
      message: `${bloodType} blood type inventory is low (${units} units remaining)`,
      hospitalId,
      bloodType,
      units
    };
  }

  createEmergencyRequestNotification(request) {
    return {
      type: 'EMERGENCY_REQUEST',
      priority: this.priorityLevels.EMERGENCY,
      title: 'Emergency Blood Request',
      message: `Urgent need for ${request.bloodType} blood at ${request.hospitalName}`,
      request
    };
  }

  createDonationScheduleNotification(appointment) {
    return {
      type: 'DONATION_SCHEDULE',
      priority: this.priorityLevels.MEDIUM,
      title: 'Donation Appointment Reminder',
      message: `Your blood donation appointment is scheduled for ${appointment.date}`,
      appointment
    };
  }

  createBloodExpiryNotification(bloodType, units, expiryDate, hospitalId) {
    return {
      type: 'BLOOD_EXPIRY',
      priority: this.priorityLevels.HIGH,
      title: 'Blood Units Expiring Soon',
      message: `${units} units of ${bloodType} blood will expire on ${expiryDate}`,
      bloodType,
      units,
      expiryDate,
      hospitalId
    };
  }
}
