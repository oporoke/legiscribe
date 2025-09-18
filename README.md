# Legiscribe - AI-Powered Legislative Analysis Platform

Legiscribe is a modern, AI-driven web application designed to streamline the process of reviewing, understanding, and voting on legislative bills. It leverages the power of Google's Gemini models through Genkit to provide users with deep insights into complex legal documents, making the legislative process more transparent and efficient.

## Key Features

- **Multi-Format Document Upload**: Users can upload legislative bills in various formats, including `.txt`, `.pdf`, and `.docx`. The platform intelligently extracts the text content for analysis.
- **AI-Powered Bill Processing**: Once a bill is uploaded, Legiscribe uses a series of AI-driven flows to analyze the document's content and structure.
- **Comprehensive Summarization**: Generates a detailed, multi-level summary of the bill, including a high-level overview, a part-by-part breakdown, and a highlight of critical provisions like tax rates, penalties, and licensing requirements.
- **Granular Clause Extraction**: Meticulously breaks down the bill into its individual clauses, preserving the original text and structure. Each extracted clause is paired with a concise, AI-generated summary.
- **Interactive Clause Voting**: Provides a clean, user-friendly interface for reviewing and voting (Approve/Reject) on each individual clause of the bill. Progress is tracked visually with a progress bar.
- **On-Demand AI Explanations**: For any clause that requires deeper understanding, users can request a detailed explanation from the AI, which considers the context of the entire bill to provide a clear and simple interpretation.
- **Downloadable Summaries**: Users can download the complete AI-generated summary as a text file for offline review or distribution.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with [Google Gemini](https://deepmind.google/technologies/gemini/) models
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **File Parsing**: `pdf-parse` for PDFs and `mammoth` for DOCX files.

## Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing.

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm

### Setup and Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/oporoke/legiscribe.git
    cd legiscribe
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env` file in the root of the project and add your Google AI API key. You can obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```env
    GEMINI_API_KEY=your_google_api_key_here
    ```

### Running the Application

This project requires running two separate processes concurrently: the Next.js frontend application and the Genkit AI flows.

1.  **Start the Next.js Development Server**:
    Open a terminal and run:
    ```bash
    npm run dev
    ```
    This will start the frontend application, typically available at `http://localhost:9002`.

2.  **Start the Genkit Development Server**:
    Open a second terminal and run:
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit server, which makes the AI flows available for the Next.js app to call. You can inspect the flows at `http://localhost:4000`.

Once both servers are running, you can open your browser to `http://localhost:9002` to use the Legiscribe application.

## Project Structure

```
.
├── src
│   ├── ai                 # Contains all Genkit AI flows and configuration
│   │   ├── flows          # Individual AI flow definitions
│   │   └── genkit.ts      # Genkit initialization and model configuration
│   ├── app                # Next.js App Router pages and layouts
│   ├── components         # Reusable React components (ShadCN UI)
│   │   ├── bill-processing # Components specific to the bill view
│   │   └── ui             # Core ShadCN UI components
│   ├── hooks              # Custom React hooks (e.g., useToast)
│   ├── lib                # Core application logic, types, and server actions
│   │   └── actions        # Next.js Server Actions
│   └── public             # Static assets
└── tailwind.config.ts     # Tailwind CSS configuration
```
