import express from 'express';
import multer from 'multer';
import fs from 'fs';
import {pinecone_client} from '../services/pineconeService.js';
import {
    extractTextFromPDF,
    chunkData,
    extractEntities,
    generateEmbeddings
} from './helper.js'; // Adjust path as necessary

const documentControllerRouter = express.Router();
const upload = multer({dest: 'uploads/'}); // Temporary storage directory

// Route for file upload
documentControllerRouter.post('/upload', upload.single('file'), async (req, res) => {
    const {path} = req.file;

    try {
        // Step 1: Extract text from PDF
        const text = await extractTextFromPDF(path);

        // Step 2: Chunk the text
        const textChunks = chunkData(text);

        // Step 3: Extract named entities
        const entities = await extractEntities(text);

        // Step 4: Generate embeddings for each chunk
        const embeddings = await generateEmbeddings(textChunks);

        // Step 5: Upload chunks and embeddings to Pinecone
        for (let i = 0; i < textChunks.length; i++) {
            const chunkData = {
                text: textChunks[i],
                embedding: embeddings[i],
                entities: entities, // Optional: adjust how you want to store entities
            };
            await pinecone_client.upsert(chunkData); // Adjust this method based on your Pinecone implementation
        }

        // Clean up the uploaded file
        fs.unlinkSync(path); // Remove the file after processing
        res.status(200).json({message: 'File uploaded and processed successfully!'});
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({error: 'Error processing file'});
    }
});

export default documentControllerRouter;
