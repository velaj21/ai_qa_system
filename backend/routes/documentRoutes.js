// routes/users.js
import express from 'express';
import multer from "multer";
import fs from 'fs';
import path from 'path';

const documentRouter = express.Router();
const upload = multer({dest: 'uploads/'});


const splitContentIntoChunks = (content, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
};

// Define a GET route
documentRouter.get('/', (req, res) => {
    res.send('List of users');
});

// Define a POST route
documentRouter.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(process.cwd(), req.file.path); // Use process.cwd() for the correct path

    try {
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf-8');

        // Split the content into chunks (e.g., 1000 characters each)
        const chunkSize = 1000; // Adjust this size as needed
        const chunks = splitContentIntoChunks(content, chunkSize);

        // Here, you can process each chunk, e.g., convert to vectors, store in Pinecone, etc.
        console.log('Chunks:', chunks);

        // Clean up: Optionally delete the uploaded file after processing
        fs.unlinkSync(filePath);

        res.json({message: 'File uploaded and processed successfully'});
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).send('Error processing the file.');
    }
});

// Export the router
export default documentRouter;
