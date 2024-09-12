const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const apiKey = process.env.GOOGLE_API_KEY;

const app = express();
const port = 3000;

// Set your API key directly here
  // Replace with your actual API key

app.use(bodyParser.json());

// Initialize GoogleGenerativeAI with the API key
const genAI = new GoogleGenerativeAI(apiKey);

// Replace with the actual model name or method if necessary
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Endpoint to detect form fields
app.post('/detect-fields', async (req, res) => {
  const { htmlContent } = req.body;

  console.log('Received request to /detect-fields');
  console.log('Request body:', req.body);

  if (!htmlContent) {
    console.warn('No HTML content provided');
    return res.status(400).send('HTML content is required');
  }

  try {
    // Define the prompt with HTML content
// Define the enhanced prompt with HTML content
// Define the enhanced prompt with HTML content
const prompt = `Analyze the following HTML content and identify all form fields present. For each field, provide the following details:
1. Field type (e.g., text, email, password, checkbox, radio button, etc.).
2. The name or ID of the field.
3. The label or placeholder text associated with the field, if available.
4. Any other relevant attributes such as required, disabled, or read-only.
5. If the form relates to personal information or a portfolio profile (e.g., name, email, bio, LinkedIn, GitHub, portfolio links), note that this is a profile or portfolio form.
6. Provide the structure of the form in a summarized format.

HTML content: ${htmlContent}`;

    console.log('Generated prompt:', prompt);

    // Generate content using Google Generative AI SDK
    const result = await model.generateContent(prompt);

    console.log('Result from API:', result);

    // Ensure the response text is accessed correctly
    const fields = result && result.response && result.response.text ? result.response.text() : 'No response text';
    
    res.json({ fields });
  } catch (error) {
    console.error('Error detecting fields:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).send('Error detecting fields');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
