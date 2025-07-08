const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6060;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contact_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Form Schema
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  baseUrl: { type: String, required: true },
  entryField: { type: String, required: true }, // e.g., "entry.1234567"
  whatsappTemplate: { type: String, required: true },
  csvColumnName: { type: String, default: 'Paziente' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  formHistory: [{
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
    sentAt: { type: Date, default: Date.now },
    sentCount: { type: Number, default: 1 }
  }]
});

// Response Schema
const responseSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  responseData: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now },
  csvImportedAt: { type: Date, default: Date.now }
});

// Settings Schema
const settingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Your Company' },
  defaultFormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' }
});

const Form = mongoose.model('Form', formSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Response = mongoose.model('Response', responseSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes

// ========== FORMS ROUTES ==========

// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single form
app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create form
app.post('/api/forms', async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update form
app.put('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete form
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    // Delete associated responses
    await Response.deleteMany({ formId: req.params.id });
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONTACTS ROUTES ==========

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate('formHistory.formId', 'name')
      .sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contact
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('formHistory.formId', 'name');
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contact
app.post('/api/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    // Delete associated responses
    await Response.deleteMany({ contactId: req.params.id });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate prefilled form link
app.post('/api/generate-link/:contactId/:formId', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    const form = await Form.findById(req.params.formId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Update contact form history
    const existingFormHistory = contact.formHistory.find(
      h => h.formId.toString() === req.params.formId
    );
    
    if (existingFormHistory) {
      existingFormHistory.sentAt = new Date();
      existingFormHistory.sentCount += 1;
    } else {
      contact.formHistory.push({
        formId: req.params.formId,
        sentAt: new Date(),
        sentCount: 1
      });
    }
    
    await contact.save();

    // Generate prefilled URL
    const prefilledUrl = `${form.baseUrl}?usp=pp_url&${form.entryField}=${contact._id}`;
    
    // Generate WhatsApp URL
    const whatsappMessage = form.whatsappTemplate
      .replace('{FIRST_NAME}', contact.firstName)
      .replace('{LAST_NAME}', contact.lastName)
      .replace('{FULL_NAME}', `${contact.firstName} ${contact.lastName}`)
      .replace('{EMAIL}', contact.email)
      .replace('{PHONE}', contact.phone)
      .replace('{COMPANY}', contact.company || '')
      .replace('{FORM_LINK}', prefilledUrl);
    
    const whatsappUrl = `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

    res.json({
      prefilledUrl,
      whatsappUrl,
      message: whatsappMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== RESPONSES ROUTES ==========

// Get all responses
app.get('/api/responses', async (req, res) => {
  try {
    const { formId, contactId } = req.query;
    let query = {};
    
    if (formId) query.formId = formId;
    if (contactId) query.contactId = contactId;
    
    const responses = await Response.find(query)
      .populate('contactId', 'firstName lastName email phone')
      .populate('formId', 'name')
      .sort({ csvImportedAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import CSV responses
app.post('/api/responses/import/:formId', upload.single('csvFile'), async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;

    // Read and parse CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (const row of results) {
            processedCount++;
            
            // Look for the contact ID in the specified column
            const contactId = row[form.csvColumnName];
            if (!contactId) {
              errors.push(`Row ${processedCount}: Missing contact ID in column '${form.csvColumnName}'`);
              continue;
            }

            // Verify contact exists
            const contact = await Contact.findById(contactId);
            if (!contact) {
              errors.push(`Row ${processedCount}: Contact with ID '${contactId}' not found`);
              continue;
            }

            // Create response record
            const response = new Response({
              contactId: contactId,
              formId: req.params.formId,
              responseData: row
            });

            await response.save();
            successCount++;
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            message: `Import completed: ${successCount} responses imported, ${errors.length} errors`,
            successCount,
            errorCount: errors.length,
            errors: errors.slice(0, 10) // Limit errors shown
          });

        } catch (error) {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: error.message });
        }
      });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
});

// Delete response
app.delete('/api/responses/:id', async (req, res) => {
  try {
    const response = await Response.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SETTINGS ROUTES ==========

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne().populate('defaultFormId', 'name');
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== STATS ROUTES ==========

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const totalForms = await Form.countDocuments();
    const totalResponses = await Response.countDocuments();
    
    // Recent activity
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt');
    
    const recentResponses = await Response.find()
      .populate('contactId', 'firstName lastName')
      .populate('formId', 'name')
      .sort({ csvImportedAt: -1 })
      .limit(5);

    res.json({
      totalContacts,
      totalForms,
      totalResponses,
      recentContacts,
      recentResponses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});