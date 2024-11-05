import os
import pinecone
import gensim
from gensim import corpora
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import fitz  # PyMuPDF

# pip install gensim pinecone-client nltk PyMuPDF

# Initialize Pinecone
pinecone.init(api_key='YOUR_PINECONE_API_KEY', environment='YOUR_PINECONE_ENV')
index = pinecone.Index('YOUR_INDEX_NAME')

# Function to extract text from PDF files
def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

# Function to preprocess documents
def preprocess_documents(documents):
    stop_words = set(stopwords.words('english'))
    processed_docs = []
    for doc in documents:
        # Tokenize and remove stop words
        tokens = word_tokenize(doc.lower())
        filtered_tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
        processed_docs.append(filtered_tokens)
    return processed_docs

# Function to perform topic modeling
def perform_topic_modeling(documents, num_topics=5):
    processed_docs = preprocess_documents(documents)
    
    # Create a dictionary and corpus for LDA
    dictionary = corpora.Dictionary(processed_docs)
    corpus = [dictionary.doc2bow(doc) for doc in processed_docs]

    # Perform LDA topic modeling
    lda_model = gensim.models.LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=10)
    
    # Extract topics
    topics = lda_model.print_topics(num_words=3)
    return topics

# Function to update metadata in Pinecone
def update_pinecone_metadata(documents, topics):
    for doc_id, topic in zip(documents.keys(), topics):
        # Update metadata with extracted topics
        index.upsert([(doc_id, {'topics': str(topic)})])

# Main script
if __name__ == "__main__":
    # Example PDF file paths (replace with actual paths)
    pdf_files = {
        'doc1': 'path/to/document1.pdf',
        'doc2': 'path/to/document2.pdf',
        'doc3': 'path/to/document3.pdf',
    }

    # Extract text from PDFs
    documents = {doc_id: extract_text_from_pdf(pdf_path) for doc_id, pdf_path in pdf_files.items()}
    
    # Perform topic modeling
    extracted_topics = perform_topic_modeling(list(documents.values()))
    
    # Update Pinecone metadata
    update_pinecone_metadata(documents, extracted_topics)

    print("Metadata updated in Pinecone with extracted topics.")
