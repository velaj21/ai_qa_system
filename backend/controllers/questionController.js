import express from 'express';
import {pinecone_client} from '../services/pineconeService.js';
import {getAnswer} from "../helper.js";

const questionControllerRouter = express.Router();

async function retrieveRelevantChunks(query) {
    const response = await pinecone_client.query({
        query: query,
        top_k: 5, // Number of relevant documents to retrieve
        include_values: true,
    });
    return response.matches.map(match => match.metadata.text);
}

// Question answering endpoint
questionControllerRouter.post('/question', async (req, res) => {
    const {question} = req.body;

    if (!question) {
        return res.status(400).json({error: 'Question is required'});
    }

    try {
        // Retrieve relevant chunks from Pinecone
        const relevantChunks = await retrieveRelevantChunks(question);

        if (relevantChunks.length === 0) {
            return res.status(404).json({answer: 'No relevant documents found.'});
        }

        // Combine the relevant context
        const context = relevantChunks.join('\n');

        // Get answer from AI API
        const answer = await getAnswer(context, question);

        return res.json({answer});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'An error occurred while processing your request.'});
    }
});

export default questionControllerRouter;