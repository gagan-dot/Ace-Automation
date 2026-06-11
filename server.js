import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const cleanedLine = line.trim();
      if (cleanedLine && !cleanedLine.startsWith('#')) {
        const parts = cleanedLine.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      }
    });
  }
} catch (err) {
  console.error('Failed to load manual .env file:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read leads
const readLeads = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading leads file:', error);
    return [];
  }
};

// Helper to write leads
const writeLeads = (leads) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing leads file:', error);
    return false;
  }
};

// Mock Data Generator
const generateMockLeads = () => {
  const mockLeads = [
    {
      id: 'lead_1',
      name: 'Rajesh Kumar',
      company: 'RK Industries',
      phone: '9876543210',
      email: 'rajesh@rkindustries.com',
      service: 'AI Automation',
      message: 'Interested in automating our production line reporting using custom AI solutions.',
      source: 'Form',
      status: 'Hot Lead',
      notes: 'Very interested. Wants a demo next Tuesday.',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString() // 4 hours ago
    },
    {
      id: 'lead_2',
      name: 'Amit Sharma',
      company: 'Sharma Smart Homes',
      phone: '9165699823',
      email: 'amit@sharmash.in',
      service: 'WhatsApp Automation',
      message: 'Need a customer support chatbot for our e-commerce operations.',
      source: 'Consultation',
      status: 'Interested',
      notes: 'Sent pricing catalog. Waiting for response.',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day ago
    },
    {
      id: 'lead_3',
      name: 'WhatsApp Lead (Jabalpur)',
      company: 'N/A',
      phone: 'N/A',
      email: 'N/A',
      service: 'N/A',
      message: 'User clicked the WhatsApp chat link.',
      source: 'WhatsApp',
      status: 'Interested',
      notes: 'Initiated conversation on WhatsApp. Inquiry on home automation.',
      timestamp: new Date(Date.now() - 36 * 3600000).toISOString() // 1.5 days ago
    },
    {
      id: 'lead_4',
      name: 'Priya Patel',
      company: 'Priya Textiles',
      phone: '7000563768',
      email: 'info@priyatex.com',
      service: 'Website Development',
      message: 'Looking to revamp our outdated brochure website to a modern custom web app.',
      source: 'Form',
      status: 'Not Interested',
      notes: 'Budget constraints. Prefers standard templates for now.',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString() // 3 days ago
    },
    {
      id: 'lead_5',
      name: 'Call Lead (Guest)',
      company: 'N/A',
      phone: 'N/A',
      email: 'N/A',
      service: 'N/A',
      message: 'User clicked the Call link.',
      source: 'Call',
      status: 'New',
      notes: 'No info. Callback scheduled.',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString() // 5 days ago
    }
  ];
  writeLeads(mockLeads);
};

// Check and generate mock data if leads file is empty
if (readLeads().length === 0) {
  generateMockLeads();
}

// --- REST API ENDPOINTS ---

// ============ ADMIN AUTH SYSTEM ============

// Helper to read admin data
const readAdmin = () => {
  try {
    if (!fs.existsSync(ADMIN_FILE)) return null;
    const data = fs.readFileSync(ADMIN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading admin file:', error);
    return null;
  }
};

// Helper to write admin data
const writeAdmin = (adminData) => {
  try {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing admin file:', error);
    return false;
  }
};

// In-memory OTP store
let otpStore = { code: null, expiresAt: null, verified: false };

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email using Gmail SMTP
const sendOtpEmail = async (toEmail, otp) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || gmailUser === 'your_gmail@gmail.com' || !gmailPass || gmailPass === 'xxxx xxxx xxxx xxxx') {
    console.log(`\n📧 [DEV MODE] Email OTP for ${toEmail}: ${otp}\n`);
    return { success: true, dev: true };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass }
  });

  await transporter.sendMail({
    from: `"Ace Automation Admin" <${gmailUser}>`,
    to: toEmail,
    subject: '🔐 Your Admin Password Reset OTP - Ace Automation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #818cf8; margin: 0;">🛡️ Ace Automation</h2>
          <p style="color: #94a3b8; font-size: 14px;">Admin Password Reset</p>
        </div>
        <p style="font-size: 15px;">Aapne apna admin password reset karne ki request ki hai. Neeche diya gaya OTP use karein:</p>
        <div style="background: #1e293b; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="font-size: 36px; font-weight: 800; letter-spacing: 0.5em; color: #a5b4fc; margin: 0;">${otp}</p>
          <p style="font-size: 13px; color: #64748b; margin: 8px 0 0 0;">⏰ 5 minutes mein expire ho jayega</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Agar aapne yeh request nahi ki hai to is email ko ignore karein. Kisi ke saath yeh OTP share na karein.</p>
        <hr style="border-color: #1e293b; margin: 24px 0;" />
        <p style="font-size: 12px; color: #475569; text-align: center;">Ace Automation CRM System</p>
      </div>
    `
  });

  return { success: true, dev: false };
};

// Send OTP via SMS using Fast2SMS
const sendOtpSms = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === 'your_fast2sms_api_key_here') {
    console.log(`\n📱 [DEV MODE] SMS OTP for ${phone}: ${otp}\n`);
    return { success: true, dev: true };
  }

  // Clean phone number (remove +91 or 0 prefix)
  const cleanPhone = phone.replace(/^(\+91|91|0)/, '').trim();

  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      flash: 0,
      numbers: cleanPhone
    })
  });

  const data = await response.json();
  if (!data.return) {
    throw new Error(data.message || 'SMS sending failed');
  }
  return { success: true, dev: false };
};

// GET: Check if admin account exists (first-time vs returning)
app.get('/api/admin/status', (req, res) => {
  const admin = readAdmin();
  if (!admin) {
    return res.json({ exists: false });
  }
  return res.json({ 
    exists: true, 
    name: admin.name,
    maskedEmail: admin.email ? admin.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
    maskedPhone: admin.phone ? admin.phone.replace(/(.{2})(.*)(.{2})/, '$1****$3') : null
  });
});

// POST: First-time admin setup
app.post('/api/admin/setup', (req, res) => {
  const existingAdmin = readAdmin();
  if (existingAdmin) {
    return res.status(400).json({ error: 'Admin account already exists. Use login instead.' });
  }

  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Name, email, phone, and password are all required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const adminData = {
    name,
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password,
    createdAt: new Date().toISOString()
  };

  if (writeAdmin(adminData)) {
    res.status(201).json({ success: true, message: 'Admin account created successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to create admin account.' });
  }
});

// POST: Admin login
app.post('/api/admin/login', (req, res) => {
  const admin = readAdmin();
  if (!admin) {
    return res.status(404).json({ error: 'No admin account found. Please set up first.' });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  if (password === admin.password) {
    res.json({ success: true, name: admin.name });
  } else {
    res.status(401).json({ error: 'Invalid password. Access denied.' });
  }
});

// POST: Verify identity for forgot password (email or phone)
app.post('/api/admin/verify-identity', async (req, res) => {
  const admin = readAdmin();
  if (!admin) {
    return res.status(404).json({ error: 'No admin account found.' });
  }

  const { method, value } = req.body;
  if (!method || !value) {
    return res.status(400).json({ error: 'Verification method and value are required.' });
  }

  let matched = false;
  if (method === 'email' && value.toLowerCase().trim() === admin.email) {
    matched = true;
  } else if (method === 'phone' && value.trim() === admin.phone) {
    matched = true;
  }

  if (!matched) {
    return res.status(401).json({ error: 'Provided details do not match our records.' });
  }

  // Generate OTP
  const otp = generateOTP();
  otpStore = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000, verified: false };

  try {
    let sendResult;
    if (method === 'email') {
      sendResult = await sendOtpEmail(admin.email, otp);
    } else {
      sendResult = await sendOtpSms(admin.phone, otp);
    }

    const isDev = sendResult.dev;
    const deliveryInfo = method === 'email'
      ? `OTP sent to your email: ${admin.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`
      : `OTP sent to your phone: ${admin.phone.replace(/^(\d{2})(\d+)(\d{2})$/, '$1****$3')}`;

    return res.json({
      success: true,
      message: deliveryInfo,
      // Only expose OTP in dev mode (when credentials not set)
      ...(isDev && { _devOtp: otp })
    });
  } catch (err) {
    console.error('OTP delivery error:', err);
    // Still return the OTP in console for fallback
    console.log(`\n🔐 FALLBACK OTP: ${otp}\n`);
    return res.status(500).json({ 
      error: `OTP delivery failed: ${err.message}. Check server console for OTP.`,
      _devOtp: otp
    });
  }
});

// POST: Verify OTP
app.post('/api/admin/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: 'OTP is required.' });
  }

  if (!otpStore.code || Date.now() > otpStore.expiresAt) {
    otpStore = { code: null, expiresAt: null, verified: false };
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (otp !== otpStore.code) {
    return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
  }

  otpStore.verified = true;
  res.json({ success: true, message: 'OTP verified successfully.' });
});

// POST: Reset password (after OTP verification)
app.post('/api/admin/reset-password', (req, res) => {
  if (!otpStore.verified) {
    return res.status(403).json({ error: 'Please verify OTP first.' });
  }

  const admin = readAdmin();
  if (!admin) {
    return res.status(404).json({ error: 'No admin account found.' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  admin.password = newPassword;
  if (writeAdmin(admin)) {
    otpStore = { code: null, expiresAt: null, verified: false };
    res.json({ success: true, message: 'Password reset successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ============ LEADS SYSTEM ============

// GET: Retrieve all leads
app.get('/api/leads', (req, res) => {
  const leads = readLeads();
  // Sort by timestamp descending
  leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(leads);
});

// POST: Add a new lead (from form, WhatsApp link, Call link, or manual entry)
app.post('/api/leads', (req, res) => {
  const { name, company, phone, email, city, service, budget, followupDate, message, source, status, notes } = req.body;

  if (!name || !source) {
    return res.status(400).json({ error: 'Name and source are required.' });
  }

  const leads = readLeads();
  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    company: company || 'N/A',
    phone: phone || 'N/A',
    email: email || 'N/A',
    city: city || '',
    service: service || 'N/A',
    budget: budget || '',
    followupDate: followupDate || '',
    message: message || '',
    source,
    status: status || 'New',
    notes: notes || '',
    timestamp: new Date().toISOString()
  };

  leads.push(newLead);
  if (writeLeads(leads)) {
    res.status(201).json(newLead);
  } else {
    res.status(500).json({ error: 'Failed to write lead to database.' });
  }
});

// PATCH: Update lead fields dynamically
app.patch('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const leads = readLeads();
  const leadIndex = leads.findIndex((l) => l.id === id);

  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found.' });
  }

  // Merge allowed fields
  const allowedFields = ['name', 'company', 'phone', 'email', 'city', 'service', 'budget', 'followupDate', 'message', 'source', 'status', 'notes'];
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      leads[leadIndex][field] = updateData[field];
    }
  });

  if (writeLeads(leads)) {
    res.json(leads[leadIndex]);
  } else {
    res.status(500).json({ error: 'Failed to update lead.' });
  }
});

// DELETE: Remove a lead
app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const leads = readLeads();
  const filteredLeads = leads.filter((l) => l.id !== id);

  if (leads.length === filteredLeads.length) {
    return res.status(404).json({ error: 'Lead not found.' });
  }

  if (writeLeads(filteredLeads)) {
    res.json({ message: 'Lead deleted successfully.', id });
  } else {
    res.status(500).json({ error: 'Failed to delete lead.' });
  }
});

// POST: Bulk delete leads
app.post('/api/leads/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty ids array.' });
  }

  const leads = readLeads();
  const initialCount = leads.length;
  const filteredLeads = leads.filter(l => !ids.includes(l.id));

  if (initialCount === filteredLeads.length) {
    return res.status(404).json({ error: 'No leads found to delete.' });
  }

  if (writeLeads(filteredLeads)) {
    res.json({ message: `${initialCount - filteredLeads.length} leads deleted successfully.` });
  } else {
    res.status(500).json({ error: 'Failed to perform bulk delete.' });
  }
});

// POST: Bulk update status of leads
app.post('/api/leads/bulk-status', (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !status) {
    return res.status(400).json({ error: 'Invalid payload: ids and status are required.' });
  }

  const leads = readLeads();
  let updatedCount = 0;

  leads.forEach(lead => {
    if (ids.includes(lead.id)) {
      lead.status = status;
      updatedCount++;
    }
  });

  if (updatedCount === 0) {
    return res.status(404).json({ error: 'No matching leads found to update.' });
  }

  if (writeLeads(leads)) {
    res.json({ message: `${updatedCount} leads updated to status "${status}" successfully.` });
  } else {
    res.status(500).json({ error: 'Failed to update leads status.' });
  }
});

// GET: Export leads in Excel-compatible CSV format
app.get('/api/leads/export', (req, res) => {
  const leads = readLeads();
  leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Define CSV headers including expanded fields
  const headers = [
    'Lead ID', 'Name', 'Company', 'Phone', 'Email', 'City', 
    'Service Interested', 'Budget', 'Follow Up Date', 'Message', 
    'Source', 'Status', 'Notes', 'Date & Time'
  ];
  
  // Helper to escape values for CSV
  const escapeCSV = (val) => {
    if (val === undefined || val === null) return '';
    let str = String(val).replace(/"/g, '""'); // Double quotes escape
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      str = `"${str}"`;
    }
    return str;
  };

  // Build CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.name,
    lead.company,
    lead.phone,
    lead.email,
    lead.city || '',
    lead.service,
    lead.budget || '',
    lead.followupDate || '',
    lead.message,
    lead.source,
    lead.status,
    lead.notes,
    new Date(lead.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  ]);

  // Join headers and rows
  const csvContent = '\uFEFF' + [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=Ace_Automation_Leads_${new Date().toISOString().split('T')[0]}.csv`);
  res.status(200).send(csvContent);
});

const systemPrompt = `You are "Aace AI" (or Aace), a highly warm, friendly, professional, and human-like AI sales and customer support assistant for "Ace Automation".
Your ultimate goal is to generate and qualify leads by interacting naturally with website visitors.

About Ace Automation:
- We are an elite team replacing manual repetitive grind with intelligent 24/7 digital workflows.
- Services we offer:
  * Website Development & Revamp
  * AI Automation (Chatbots & Lead Qualification)
  * WhatsApp Automation
  * AI Voice Agents
  * CRM & Workflow Automation
- Core Philosophy: "Pay If U Like" (Risk-free model - we build, integrate, and deploy custom systems. If you're not fully satisfied, you don't pay us. It's that simple).
- Pricing Packages: Starter, Growth (Recommended), Enterprise. (All Custom Pricing).
- Contact: +91 7000563768, +91 9165699823 | info@aaceautomation.com | Jabalpur, MP, 482003

**CRITICAL RULES FOR CONVERSATION:**

1. **GREETING:** Always greet the user first warmly in your first message.
2. **FORMATTING:** Always give short and sweet answers using bullet points or pointers. NEVER use long paragraphs.
3. **STRICTLY ON-TOPIC:** You must ONLY talk about Ace Automation and its services. If the user asks about anything else (e.g. coding, weather, recipes, trivia, competitors), politely refuse by saying: "Main Aace Automation ka assistant hu, main sirf apni services ke baare mein madad kar sakta hu."
4. **ABUSIVE LANGUAGE:** If the user uses abusive or rude language, strictly apologize politely (e.g. "Mujhe maaf kijiye agar aapko kuch bura laga ho, main ek AI assistant hu.") and politely ask how you can help them with Ace Automation. Do not argue.
5. **SEQUENTIAL LEAD CAPTURE (IMPORTANT):** Do not ask for all details at once. Slowly and naturally collect the client's data one by one in the following order:
   - Step 1: Ask for their **Name**.
   - Step 2: Ask for their **Business Name** (Company).
   - Step 3: Ask for their **Budget**.
   - Step 4: Ask what **Services** they need.
   - Step 5: Ask for their **Contact Number** (Phone/WhatsApp).
6. **FINAL STEP:** Once you have collected ALL 5 details (Name, Business Name, Budget, Services, Contact Number), you MUST invoke the \`book_consultation\` tool.
7. **HOT LEAD ANALYSIS:** Before invoking the tool, internally analyze if this is a "Hot Lead" (e.g., they have a good budget, clear requirements, or are eager to start immediately). Set \`is_hot_lead\` accordingly in the tool arguments.
8. **LANGUAGE:** If the user speaks in Hindi or Hinglish, you MUST reply strictly in Hinglish (Hindi written in English script). If they speak in English, reply in English. Match their language perfectly.`;

// POST: AI Chatbot API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.json({
        text: "Namaste! Main Aace hoon, Ace Automation ka AI assistant. (Note: Please set GEMINI_API_KEY in your .env file to enable full human-like capabilities). Aapko humare services ke baare me kya janna hai?"
      });
    }

    // Format messages for Gemini API
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }]
    }));

    const toolDeclarations = [
      {
        name: "book_consultation",
        description: "Register a client booking or lead in the CRM. Call this ONLY when you have sequentially collected Name, Business Name, Budget, Services, and Contact Number.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Client's full name" },
            phone: { type: "STRING", description: "Client's contact number or WhatsApp number" },
            company: { type: "STRING", description: "Client's business name or company" },
            budget: { type: "STRING", description: "Client's stated budget" },
            service: { type: "STRING", description: "Services the client is interested in" },
            is_hot_lead: { type: "BOOLEAN", description: "Set to true if the client shows high intent or has a good budget, otherwise false." },
            email: { type: "STRING", description: "Client's email address (optional, default to 'N/A' if not provided)" },
            message: { type: "STRING", description: "Summary of the client's needs or any extra message" }
          },
          required: ["name", "phone", "company", "budget", "service", "is_hot_lead"]
        }
      }
    ];

    const makeGeminiRequest = async (currentContents) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: currentContents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          tools: [{ functionDeclarations: toolDeclarations }]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Gemini API error detail:", data);
        throw new Error(data.error?.message || "Gemini API error");
      }
      return data;
    };

    let geminiResponse = await makeGeminiRequest(contents);
    const candidate = geminiResponse.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCallPart = parts.find(p => p.functionCall);

    if (functionCallPart) {
      const { name: funcName, args } = functionCallPart.functionCall;
      if (funcName === "book_consultation") {
        // Create new lead in local file database
        const leads = readLeads();
        const newLead = {
          id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: args.name,
          company: args.company || 'N/A',
          phone: args.phone || 'N/A',
          email: args.email || 'N/A',
          city: args.city || '',
          service: args.service || 'N/A',
          budget: args.budget || 'Not specified',
          followupDate: args.followupDate || '',
          message: args.message || 'Booked via Aace AI Chatbot.',
          source: 'Chatbot',
          status: args.is_hot_lead ? 'Hot Lead' : 'New',
          notes: 'Auto-created by Aace AI Chatbot during conversation.',
          timestamp: new Date().toISOString()
        };

        leads.push(newLead);
        writeLeads(leads);

        // Feed function response back to Gemini
        contents.push(candidate.content); // Model functionCall part
        contents.push({
          role: 'tool',
          parts: [{
            functionResponse: {
              name: "book_consultation",
              response: {
                success: true,
                message: `Lead created successfully in CRM. Lead ID is ${newLead.id}`
              }
            }
          }]
        });

        // Get final summary response from Gemini
        const finalResponse = await makeGeminiRequest(contents);
        const finalPart = finalResponse.candidates?.[0]?.content?.parts || [];
        const textVal = finalPart.find(p => p.text)?.text || "Thank you! Your booking has been registered, and our team will contact you soon.";
        return res.json({ text: textVal });
      }
    }

    const textVal = parts.find(p => p.text)?.text || "I couldn't process that. How else can I help you?";
    return res.json({ text: textVal });

  } catch (error) {
    console.error('Error in chatbot communication:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI Assistant. ' + error.message });
  }
});

// ============ GOOGLE SHEETS HELPER ============

const appendToGoogleSheet = async (rowData) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!sheetId || sheetId === 'your_google_sheet_id_here' || !keyJson || keyJson === 'your_service_account_json_here') {
      console.log('📊 [DEV MODE] Google Sheets not configured. Row would be:', rowData);
      return { success: false, dev: true };
    }

    let credentials;
    try {
      credentials = JSON.parse(keyJson);
    } catch {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON');
      return { success: false, error: 'Invalid credentials JSON' };
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    console.log('✅ Google Sheets: Row appended successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Google Sheets error:', err.message);
    return { success: false, error: err.message };
  }
};

// ============ VAPI WEBHOOK — Meeting Booking ============

// POST: Vapi calls this after every voice call ends with transcript + summary
app.post('/api/vapi-webhook', async (req, res) => {
  try {
    const payload = req.body;
    const eventType = payload?.message?.type;

    console.log('📞 Vapi Webhook received:', eventType);

    // Only process end-of-call reports
    if (eventType !== 'end-of-call-report') {
      return res.json({ received: true });
    }

    const summary    = payload?.message?.analysis?.summary || '';
    const transcript = payload?.message?.transcript || '';
    const callId     = payload?.message?.call?.id || `call_${Date.now()}`;

    // Extract structured data from Vapi's analysis or fallback to transcript parsing
    const structuredData = payload?.message?.analysis?.structuredData || {};

    const name     = structuredData.clientName     || extractField(transcript, ['name', 'naam', 'mera naam', 'main hoon', "i'm", "i am", "my name is"]) || 'Voice Lead';
    const phone    = structuredData.clientPhone    || extractField(transcript, ['number', 'mobile', 'phone', 'contact', 'whatsapp', 'no.']) || 'N/A';
    const business = structuredData.clientBusiness || extractField(transcript, ['business', 'company', 'kaam', 'shop', 'firm', 'startup', 'kya karta']) || 'N/A';
    const service  = structuredData.serviceNeeded  || extractField(transcript, ['website', 'automation', 'crm', 'workflow', 'voice agent', 'revamp']) || summary.split('.')[0] || 'N/A';
    const budget   = structuredData.budget         || extractField(transcript, ['budget', 'kitna', 'price', 'cost', 'paisa', 'amount']) || 'N/A';
    const meetingBooked = structuredData.meetingBooked || summary.toLowerCase().includes('meeting') || summary.toLowerCase().includes('consultation');

    const notes = [
      meetingBooked ? '📅 Meeting Booked via Voice Agent' : '📞 Voice Call — No meeting booked',
      `Business: ${business}`,
      `Summary: ${summary.slice(0, 300)}`,
    ].join(' | ');

    // ── Save to CRM (leads.json) ──
    const leads = readLeads();
    const newLead = {
      id: `vapi_${callId}`,
      name,
      company: business,
      phone,
      email: 'N/A',
      city: '',
      service,
      budget,
      followupDate: meetingBooked ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : '',
      message: summary || 'Voice Agent call',
      source: 'AI Voice Agent',
      status: meetingBooked ? 'Hot Lead' : 'New',
      notes,
      timestamp: new Date().toISOString(),
    };
    leads.push(newLead);
    writeLeads(leads);
    console.log('✅ CRM updated — Lead:', name, '|', phone);

    // ── Save to Google Sheets ──
    const sheetRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      name,
      phone,
      business,
      service,
      budget,
      meetingBooked ? 'Yes ✅' : 'No',
      newLead.status,
      summary.slice(0, 500),
      callId,
    ];
    await appendToGoogleSheet(sheetRow);

    return res.json({ success: true, leadId: newLead.id });
  } catch (err) {
    console.error('Vapi webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Helper: simple keyword-based field extraction from transcript text
const extractField = (text, keywords) => {
  if (!text) return null;
  const lines = text.toLowerCase().split('\n');
  for (const line of lines) {
    if (keywords.some(kw => line.includes(kw))) {
      // Extract the part after the keyword colon or comma
      const match = line.match(/[:\-]\s*([\w\s+@.]{3,40})/);
      if (match) return match[1].trim();
    }
  }
  return null;
};

// Serve frontend assets in production (after npm run build)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

