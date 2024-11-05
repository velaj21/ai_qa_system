import {Configuration, OpenAIApi} from 'openai';
import {NlpManager} from 'node-nlp';
import fs from 'fs';
import {PDFDocument} from 'pdf-lib';
import axios from "axios";

// Initialize OpenAI
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Use environment variable for API key
}));

// Function to extract text from PDF
export const extractTextFromPDF = async (pdfPath) => {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    let text = '';

    for (let pageIndex = 0; pageIndex < pdfDoc.getPageCount(); pageIndex++) {
        const page = pdfDoc.getPage(pageIndex);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
};

// Function to chunk data
export const chunkData = (data, maxLength = 512) => {
    const sentences = data.match(/[^\.!\?]+[\.!\?]+/g) || []; // Split by sentence
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxLength) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};

// Function for named entity recognition
export const extractEntities = async (text) => {
    const manager = new NlpManager({languages: ['en']});
    await manager.train();
    const response = await manager.process('en', text);
    return response.entities;
};

// Function to generate embeddings
export const generateEmbeddings = async (textChunks) => {
    const embeddings = [];
    for (const chunk of textChunks) {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: chunk,
        });
        embeddings.push(response.data.data[0].embedding);
    }
    return embeddings;
};


export const getAnswer = async (context, question) => {
    const prompt = `${context}\n\nQ: ${question}\nA:`;
    const response = await axios.post(process.env.AI_API_URL, {
        prompt: prompt,
        model: 'gpt-4', // or 'claude-3.5'
        max_tokens: 150,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.AI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].text.trim();
}