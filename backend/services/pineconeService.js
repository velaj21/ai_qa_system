import {Pinecone} from "@pinecone-database/pinecone";
import dotenv from "dotenv"; // Load environment variables

dotenv.config(); // Initialize dotenv

const pc = new Pinecone({apiKey: process.env.API_KEY});
export const pinecone_client = pc.index(process.env.INDEX_NAME);
