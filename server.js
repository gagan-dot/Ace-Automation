import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if process.env.GEMINI_API_KEY is not set
if (!process.env.GEMINI_API_KEY) {
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
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');

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
Your goal is to converse naturally with website visitors, answer their queries about Ace Automation, and help them book a consultation or service.

About Ace Automation:
- We are an elite team of developers, automation architects, and AI specialists reshaping business operations.
- Our mission is to replace manual repetitive grind with intelligent 24/7 digital workflows.
- Services we offer:
  1. Website Development: Modern, conversion-focused websites.
  2. Website Revamp: Transforming outdated websites into modern sales engines.
  3. AI Automation: Chatbots for customer support and lead qualification.
  4. WhatsApp Automation: Automating sales and customer chats.
  5. AI Voice Agents: Human-like AI calling and phone operations.
  6. CRM Automation: Custom tracking, syncing, and lead management.
  7. Workflow Automation: Automating business processes with custom integrations.
  8. Business Automation: Building unified intelligent workflows across apps.
- Core Philosophy: "Pay If U Like" (Risk-free model - we build, integrate, and deploy custom systems. If you're not fully satisfied, you don't pay us. It's that simple).
- Pricing Packages:
  * Starter Plan (Custom Pricing): Custom Website, Basic AI, Standard WhatsApp Automation, Email support.
  * Growth Plan (Custom Pricing - Recommended): Premium 3D website, Advanced AI Sales, Full WhatsApp Automation, Basic CRM, 24/7 support.
  * Enterprise Plan (Custom Pricing): Custom AI Solutions, AI Voice Agents, Full Workflow, Advanced CRM Automation, Dedicated account manager.
- Contact Details:
  * Phone/WhatsApp: +91 7000563768, +91 9165699823
  * Email: info@aaceautomation.com
  * Location: C73 phase 3 Dhanwantri Nagar, Jabalpur, MP, 482003

Guiding Rules for Conversation:
1. Speak in a mixture of Hinglish (Hindi written in English script) and English, depending on how the user talks. Be natural, polite, and helpful (like a friendly human consultant from India).
2. Answer questions ONLY about Ace Automation, its services, philosophy, contact details, plans, and address.
3. If the user asks general or out-of-scope questions (e.g. general coding, weather, recipes, trivia, other companies, etc.), politely refuse. Tell them: "Main sirf Ace Automation aur hamari services ke baare mein baat kar sakta hoon. Aapko Ace Automation ke services ke baare mein kya jaanna hai?"
4. If they show interest in our services, booking, a demo, or scheduling a callback:
   - Ask them politely for their details: Name, Phone (or WhatsApp), and Email (and optionally Company, Service, or custom message).
   - Once they have explicitly provided at least Name, Phone, and Email, invoke the \`book_consultation\` tool. Do not hallucinate or guess these details.
5. Keep your responses concise, engaging, and easy to read.`;

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
        description: "Register a client booking or lead in the CRM. Call this when the user explicitly requests a demo, booking, call, or consultation, and has provided their Name, Phone, and Email.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Client's full name" },
            phone: { type: "STRING", description: "Client's phone number or WhatsApp number" },
            email: { type: "STRING", description: "Client's email address" },
            company: { type: "STRING", description: "Client's company name (default to 'N/A')" },
            service: { type: "STRING", description: "Service client is interested in" },
            message: { type: "STRING", description: "Client's message or custom requirements" }
          },
          required: ["name", "phone", "email"]
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
          budget: args.budget || '',
          followupDate: args.followupDate || '',
          message: args.message || 'Booked via Aace AI Chatbot.',
          source: 'Chatbot',
          status: 'New',
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

// Serve frontend assets in production (after npm run build)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

