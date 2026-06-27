import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing with key:', key?.substring(0, 10) + '...');
  
  const genAI = new (await import('@google/generative-ai')).GoogleGenerativeAI(key || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  try {
    const result = await model.generateContent('Hello');
    console.log('Success gemini-2.5-flash:', result.response.text());
  } catch (e) {
    console.error('Error with gemini-2.5-flash:', e.message);
  }
}

main();
