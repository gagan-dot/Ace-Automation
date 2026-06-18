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

/**
 * Sends a lead to the server API (/api/leads).
 * On Vercel, this is handled by api/index.js which saves to KVDB cloud database.
 * Both the website form and admin CRM panel read from the same KVDB database.
 */
export const trackLead = async (data: LeadData): Promise<boolean> => {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        company: data.company || 'N/A',
        phone: data.phone || 'N/A',
        email: data.email || 'N/A',
        service: data.service || 'N/A',
        message: data.message || '',
        source: data.source,
        status: data.status || 'New',
      }),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error('CRM tracking failed:', errorMsg);
      return false;
    }

    const result = await response.json();
    console.log('Lead saved to CRM:', result);
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
