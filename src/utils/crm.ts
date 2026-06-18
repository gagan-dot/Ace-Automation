export interface LeadData {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  service?: string;
  message?: string;
  source: 'Form' | 'Consultation' | 'WhatsApp' | 'Call' | 'Chatbot';
  status?: 'New' | 'Interested' | 'Hot Lead' | 'Not Interested';
}

// LocalStorage key — same as admin CRM panel uses
const CRM_STORAGE_KEY = 'ace_crm_leads';

function generateId(): string {
  return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Saves a lead record to localStorage so it appears in the admin CRM panel.
 */
export const trackLead = async (data: LeadData): Promise<boolean> => {
  try {
    // Read existing leads
    const existing = JSON.parse(localStorage.getItem(CRM_STORAGE_KEY) || '[]');

    // Build the new lead object (same format as admin crm.js)
    const newLead = {
      id: generateId(),
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      city: '',
      source: data.source === 'Form' ? 'Website Form'
            : data.source === 'WhatsApp' ? 'WhatsApp'
            : data.source === 'Call' ? 'Phone Call'
            : data.source === 'Chatbot' ? 'Chatbot'
            : 'Other',
      status: data.status || 'New',
      service: data.service || '',
      budget: '',
      notes: [data.company ? `Company: ${data.company}` : '', data.message || ''].filter(Boolean).join('\n'),
      followupDate: '',
      date: new Date().toISOString(),
    };

    // Add to front of list and save
    existing.unshift(newLead);
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(existing));

    console.log('Lead saved to CRM:', newLead);
    return true;
  } catch (error) {
    console.error('CRM tracking error:', error);
    return false;
  }
};

/**
 * Tracks and logs a WhatsApp chat button click.
 */
export const trackWhatsAppClick = async (): Promise<void> => {
  await trackLead({
    name: 'WhatsApp Click (Guest)',
    phone: 'N/A',
    email: 'N/A',
    service: 'N/A',
    message: 'User clicked the WhatsApp chat button/widget.',
    source: 'WhatsApp',
    status: 'Interested',
  });
};

/**
 * Tracks and logs a Phone call button click.
 */
export const trackCallClick = async (): Promise<void> => {
  await trackLead({
    name: 'Call Link Click (Guest)',
    phone: 'N/A',
    email: 'N/A',
    service: 'N/A',
    message: 'User clicked the Call link/phone number.',
    source: 'Call',
    status: 'Interested',
  });
};
