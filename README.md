
# EMA: Neo X - AI Exam Forecaster

**Neo X** is a powerful, experimental AI exam forecasting assistant developed by **E-SchoolBooks**, a non-profit educational ecosystem. Our core mission is to create a world where learning is accessible, sustainable, and free from physical and financial burdens. E-SchoolBooks is a crowdfunded NGO dedicated to helping students achieve high marks, improve their skills, and find pathways to successful careers. Neo X is the technological spearhead of this mission, leveraging generative AI to provide students with intelligent tools to excel in their studies. Unlike other educational tools, our entire initiative is driven by community support, ensuring that our resources remain free for every student, forever.

<div align="center">
  <a href="https://github.com/sponsors/eschoolbooks">
    <img src="https://img.shields.io/badge/Support%20Our%20Mission-%E2%9D%A4%EF%B8%8F%20Donate-brightgreen?style=for-the-badge&logo=github-sponsors" alt="Donate to E-SchoolBooks">
  </a>
</div>

---

## ✨ About the Project

This application is a Next.js web app that serves as the user interface for Neo X. It allows students to upload their educational materials (like textbooks and past question papers) and receive AI-powered insights to aid their learning.

### Key Features
- **🔮 AI Exam Predictor**: Analyzes uploaded documents to forecast the most likely topics and questions for upcoming exams.
- **🧠 AI Quiz Generator**: Creates customized multiple-choice quizzes from textbooks to help students test their knowledge.
- **💬 AI Chat Tutor**: An interactive chat assistant that can answer questions and explain concepts based on the uploaded materials.
- **🔥 Firebase Integration**: Securely manages user authentication and stores analysis/quiz history in Firestore.
- **📄 PDF Report Generation**: Allows users to download their AI-generated prediction reports as a professional PDF document.

## 🚀 Tech Stack

This project is built with a modern, powerful, and scalable tech stack, designed for a fantastic developer experience.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Google's Gemini via Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Project Structure

The codebase is organized to be clean, modular, and easy to navigate.

```
/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── ai/                 # Genkit flows for interacting with the Gemini API
│   │   └── flows/
│   ├── components/         # Reusable React components (UI and feature-specific)
│   │   └── ui/             # ShadCN UI components
│   ├── firebase/           # Firebase configuration, providers, and hooks
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions and libraries
├── docs/                   # Project documentation, including backend schemas
└── firestore.rules         # Security rules for Firestore
```

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-repo-url/ema-nextjs.git
    cd ema-nextjs
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add your Google Gemini API key. You can get a key from [Google AI Studio](https://makersuite.google.com/).

    ```.env
    GOOGLE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Set up Firebase:**
    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - In your project, go to **Project Settings** > **General**.
    - Under "Your apps", click the web icon (`</>`) to add a new web app.
    - Copy the `firebaseConfig` object.
    - Paste this object into `src/firebase/config.ts`.
    - Enable **Authentication** (with Email/Password and Google providers) and **Firestore Database** in the Firebase console.

5.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 How to Contribute

We are thrilled that you are interested in contributing to E-SchoolBooks! Your help is essential to our mission of providing free and accessible education to all.

### Contribution Ideas
- **Report a Bug**: If you find an issue, please create a new issue in the GitHub repository with detailed steps to reproduce it.
- **Suggest a Feature**: Have an idea to make Neo X even better? We'd love to hear it!
- **Submit a Pull Request**: Feel free to fix a bug or implement a new feature. Please fork the repository and create a pull request with a clear description of your changes.

Together, we can build a brighter future for students everywhere. Thank you for being a part of this journey.
