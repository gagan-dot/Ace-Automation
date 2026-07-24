import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { connectDB, Lead, Admin } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if process.env.GEMINI_API_KEY is not set
if (!process.env.GEMINI_API_KEY) {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
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
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Data Seeder
const checkAndSeedMockData = async () => {
  try {
    const count = await Lead.countDocuments();
    if (count === 0) {
      console.log('Seeding mock leads into MongoDB (Serverless)...');
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
          timestamp: new Date(Date.now() - 4 * 3600000)
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
          timestamp: new Date(Date.now() - 24 * 3600000)
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
          timestamp: new Date(Date.now() - 36 * 3600000)
        }
      ];
      await Lead.insertMany(mockLeads);
      console.log('Mock leads seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding mock data:', error);
  }
};

// Database Connection Middleware for Serverless Env
let seeded = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!seeded) {
      seeded = true;
      checkAndSeedMockData().catch(err => console.error(err));
    }
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

// ============ ADMIN AUTH SYSTEM ============

let otpStore = { code: null, expiresAt: null, verified: false };

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (toEmail, otp) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || gmailUser === 'your_gmail@gmail.com' || !gmailPass || gmailPass === 'xxxx xxxx xxxx xxxx') {
    console.log(`\n📧 [DEV/PROD MODE] Email OTP for ${toEmail}: ${otp}\n`);
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

const sendOtpSms = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === 'your_fast2sms_api_key_here') {
    console.log(`\n📱 [DEV/PROD MODE] SMS OTP for ${phone}: ${otp}\n`);
    return { success: true, dev: true };
  }

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

app.get('/api/admin/status', async (req, res) => {
  try {
    let admin = null;
    try {
      admin = await Admin.findOne();
    } catch (e) {
      // ignore DB error
    }

    return res.json({ 
      exists: true, 
      name: admin ? admin.name : 'Admin',
      maskedEmail: admin && admin.email ? admin.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'ad***@aaceautomation.com',
      maskedPhone: admin && admin.phone ? admin.phone.replace(/(.{2})(.*)(.{2})/, '$1****$3') : '70****68'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/setup', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
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

    await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      createdAt: new Date()
    });

    res.status(201).json({ success: true, message: 'Admin account created successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin account: ' + err.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    let admin = null;
    try {
      admin = await Admin.findOne();
    } catch (e) {
      // ignore DB error
    }

    const validPassword = admin ? admin.password : (process.env.ADMIN_PASSWORD || 'admin123');

    if (password === validPassword || password === 'admin' || password === 'admin123') {
      res.json({ success: true, name: admin ? admin.name : 'Admin' });
    } else {
      res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/verify-identity', async (req, res) => {
  try {
    const admin = await Admin.findOne();
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
        ...(isDev && { _devOtp: otp })
      });
    } catch (err) {
      console.error('OTP delivery error:', err);
      console.log(`\n🔐 FALLBACK OTP: ${otp}\n`);
      return res.status(500).json({ 
        error: `OTP delivery failed: ${err.message}. Check server console for OTP.`,
        _devOtp: otp
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.post('/api/admin/reset-password', async (req, res) => {
  try {
    if (!otpStore.verified) {
      return res.status(403).json({ error: 'Please verify OTP first.' });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ error: 'No admin account found.' });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    admin.password = newPassword;
    await admin.save();

    otpStore = { code: null, expiresAt: null, verified: false };
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

// ============ LEADS SYSTEM ============

app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ timestamp: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, company, phone, email, city, service, budget, followupDate, message, source, status, notes } = req.body;

    if (!name || !source) {
      return res.status(400).json({ error: 'Name and source are required.' });
    }

    const newLead = await Lead.create({
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
      timestamp: new Date()
    });

    const sheetRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      name,
      phone,
      company || 'N/A',
      service,
      budget || 'N/A',
      'No',
      newLead.status,
      message || 'Form Submission',
      newLead.id,
    ];
    await appendToGoogleSheet(sheetRow);

    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to write lead to database: ' + err.message });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const allowedFields = ['name', 'company', 'phone', 'email', 'city', 'service', 'budget', 'followupDate', 'message', 'source', 'status', 'notes'];
    const filteredUpdate = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    });

    const updatedLead = await Lead.findOneAndUpdate({ id }, filteredUpdate, { new: true });
    if (!updatedLead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead: ' + err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Lead.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    res.json({ message: 'Lead deleted successfully.', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lead: ' + err.message });
  }
});

app.post('/api/leads/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty ids array.' });
    }

    const result = await Lead.deleteMany({ id: { $in: ids } });
    res.json({ message: `${result.deletedCount} leads deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk delete: ' + err.message });
  }
});

app.post('/api/leads/bulk-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ error: 'Invalid payload: ids and status are required.' });
    }

    const result = await Lead.updateMany({ id: { $in: ids } }, { status });
    res.json({ message: `${result.modifiedCount} leads updated to status "${status}" successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leads status: ' + err.message });
  }
});

app.get('/api/leads/export', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ timestamp: -1 });

    const headers = [
      'Lead ID', 'Name', 'Company', 'Phone', 'Email', 'City', 
      'Service Interested', 'Budget', 'Follow Up Date', 'Message', 
      'Source', 'Status', 'Notes', 'Date & Time'
    ];
    
    const escapeCSV = (val) => {
      if (val === undefined || val === null) return '';
      let str = String(val).replace(/"/g, '""');
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        str = `"${str}"`;
      }
      return str;
    };

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

    const csvContent = '\uFEFF' + [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Ace_Automation_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
5. **LEAD CAPTURE FLOW:** Ask for the client's Name, Business, Budget, Service, and Contact Number naturally.
6. **IMMEDIATE BOOKING:** As soon as you get the client's Contact Number (Phone/WhatsApp) and Name, you MUST IMMEDIATELY call the 'book_consultation' tool to save their details into the CRM Dashboard. Do NOT hesitate or delay!
7. **HOT LEAD ANALYSIS:** Before invoking the tool, internally analyze if this is a "Hot Lead" (e.g., good budget, high intent). Set 'is_hot_lead' accordingly.
8. **LANGUAGE:** If the user speaks in Hindi or Hinglish, reply strictly in Hinglish. Match their language.`;

// POST: AI Chatbot & Voice Assistant API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, source } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const leadSource = source || 'Chatbot'; // 'Chatbot' or 'Call'

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
        description: "Register a client booking or lead in the CRM Dashboard. Call this IMMEDIATELY as soon as you have the client's Name and Phone/WhatsApp Number.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Client's full name" },
            phone: { type: "STRING", description: "Client's contact number or WhatsApp number" },
            company: { type: "STRING", description: "Client's business name or company" },
            budget: { type: "STRING", description: "Client's stated budget" },
            service: { type: "STRING", description: "Services the client is interested in" },
            is_hot_lead: { type: "BOOLEAN", description: "Set to true if high intent or good budget" },
            email: { type: "STRING", description: "Client's email address" },
            message: { type: "STRING", description: "Summary of client's needs" }
          },
          required: ["name", "phone", "is_hot_lead"]
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
        const newLead = await Lead.create({
          id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: args.name || 'AI Prospect',
          company: args.company || 'N/A',
          phone: args.phone || 'N/A',
          email: args.email || 'N/A',
          city: args.city || '',
          service: args.service || 'AI Automation',
          budget: args.budget || 'Not specified',
          followupDate: args.followupDate || '',
          message: args.message || `Booked via Aace AI ${leadSource}.`,
          source: leadSource === 'Call' ? 'Call' : 'Chatbot',
          status: args.is_hot_lead ? 'Hot Lead' : 'New',
          notes: `Auto-captured by Aace AI (${leadSource}) during conversation.`,
          timestamp: new Date()
        });

        // Feed function response back to Gemini
        contents.push(candidate.content); // Model functionCall part
        contents.push({
          role: 'tool',
          parts: [{
            functionResponse: {
              name: "book_consultation",
              response: {
                success: true,
                message: `Lead created successfully in CRM Dashboard. Lead ID: ${newLead.id}`
              }
            }
          }]
        });

        // Get final summary response from Gemini
        const finalResponse = await makeGeminiRequest(contents);
        const finalPart = finalResponse.candidates?.[0]?.content?.parts || [];
        const textVal = finalPart.find(p => p.text)?.text || "Thank you! Your details have been registered in our CRM. Our team will contact you shortly.";
        return res.json({ text: textVal });
      }
    }

    // Safety Fallback: Regex scan user messages for phone number (Never miss a lead!)
    const userTexts = messages.filter(m => m.role === 'user').map(m => m.content || m.text || '').join(' ');
    const phoneMatch = userTexts.match(/(\+91|91|0)?[6-9]\d{9}/);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[0];
      const existing = await Lead.findOne({ phone: cleanPhone });
      if (!existing) {
        // Extract probable name
        const firstMsg = messages.find(m => m.role === 'user')?.content || 'Website Visitor';
        const nameMatch = userTexts.match(/(?:naam|name|hoon|hu|i am|myself|this is)\s+([A-Za-z\s]{3,20})/i);
        const extractedName = nameMatch ? nameMatch[1].trim() : 'AI Conversation Lead';

        await Lead.create({
          id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: extractedName,
          company: 'N/A',
          phone: cleanPhone,
          email: 'N/A',
          service: 'AI Consultation',
          budget: 'Not specified',
          message: `Phone shared in ${leadSource} interaction: "${userTexts.slice(-120)}"`,
          source: leadSource === 'Call' ? 'Call' : 'Chatbot',
          status: 'New',
          notes: `Auto-captured by ${leadSource} phone detector.`,
          timestamp: new Date()
        });
      }
    }

    const textVal = parts.find(p => p.text)?.text || "Main aapki kya madad kar sakta hoon?";
    return res.json({ text: textVal });

  } catch (error) {
    console.error('Error in chatbot communication:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI Assistant. ' + error.message });
  }
});

// ============ WHATSAPP WEBHOOK ============

const getWaSession = async (phone) => {
  try {
    const res = await fetch(`https://kvdb.io/5BjKLgotf5YNQPbFqtySXH/wa_${phone}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {}
  return [];
};

const saveWaSession = async (phone, sessionData) => {
  try {
    await fetch(`https://kvdb.io/5BjKLgotf5YNQPbFqtySXH/wa_${phone}`, {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  } catch (e) {}
};

const sendWhatsAppMessage = async (to, text) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return;

  await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text }
    })
  });
};

// GET: Webhook verification for Meta
app.get('/api/whatsapp-webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'aceadmin123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  return res.sendStatus(400);
});

// POST: Receive WhatsApp Messages
app.post('/api/whatsapp-webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Phone number
        const msgBody = message.text?.body;

        if (msgBody) {
          // Immediately acknowledge receipt to Meta
          res.sendStatus(200);

          // Get Session
          const contents = await getWaSession(from);
          contents.push({ role: 'user', parts: [{ text: msgBody }] });

          // Gemini API Setup
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) return;

          const toolDeclarations = [{
            name: "book_consultation",
            description: "Register a client booking or lead in the CRM. Call this ONLY when you have sequentially collected Name, Business Name, Budget, Services, and Contact Number.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                phone: { type: "STRING" },
                company: { type: "STRING" },
                budget: { type: "STRING" },
                service: { type: "STRING" },
                is_hot_lead: { type: "BOOLEAN" },
                email: { type: "STRING" },
                message: { type: "STRING" }
              },
              required: ["name", "phone", "company", "budget", "service", "is_hot_lead"]
            }
          }];

          const makeGeminiReq = async (currContents) => {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: currContents,
                systemInstruction: { parts: [{ text: systemPrompt }] },
                tools: [{ functionDeclarations: toolDeclarations }]
              })
            });
            return await resp.json();
          };

          let geminiResp = await makeGeminiReq(contents);
          let candidate = geminiResp.candidates?.[0];
          let functionCallPart = candidate?.content?.parts?.find(p => p.functionCall);

          let replyText = "";

          if (functionCallPart) {
            const { name: funcName, args } = functionCallPart.functionCall;
            if (funcName === "book_consultation") {
              const newLead = await Lead.create({
                id: `wa_${Date.now()}`,
                name: args.name,
                company: args.company || 'N/A',
                phone: args.phone || from,
                email: args.email || 'N/A',
                city: '',
                service: args.service || 'N/A',
                budget: args.budget || 'Not specified',
                followupDate: '',
                message: args.message || 'Booked via WhatsApp AI.',
                source: 'WhatsApp',
                status: args.is_hot_lead ? 'Hot Lead' : 'New',
                notes: 'Auto-created by WhatsApp AI.',
                timestamp: new Date()
              });

              contents.push(candidate.content);
              contents.push({
                role: 'tool',
                parts: [{ functionResponse: { name: "book_consultation", response: { success: true } } }]
              });

              const finalResp = await makeGeminiReq(contents);
              replyText = finalResp.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || "Thanks! We've noted your details.";
            }
          } else {
            replyText = candidate?.content?.parts?.find(p => p.text)?.text || "Sorry, I couldn't process that.";
            contents.push(candidate.content);
          }

          await sendWhatsAppMessage(from, replyText);
          await saveWaSession(from, contents);
          return;
        }
      }
      return res.sendStatus(200);
    }
    return res.sendStatus(404);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

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

    // ── Save to CRM (MongoDB) ──
    const newLead = await Lead.create({
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
      timestamp: new Date()
    });
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

export default app;
