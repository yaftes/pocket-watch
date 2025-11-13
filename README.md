# Pocket Watch

Pocket Watch is a smart expense tracking and budgeting application that helps users manage their finances efficiently. It provides features like OCR-based receipt scanning, categorized transactions, spending insights, and a simple, elegant interface built with modern tools.

🚀 Features

💸 Add Transactions Easily — Record income and expenses with just a few taps.

🧾 OCR Receipt Scanning — Extract transaction details directly from receipt images using Tesseract.js.

📊 Visual Budget Insights — View your spending habits with clean charts and analytics.

🗂️ Category Management — Organize expenses by categories like Food, Transport, Bills, etc.

🔒 Secure User Authentication — Login and manage your data safely (e.g., via Supabase).

🌙 Modern UI — Built using ShadCN UI, React, and TailwindCSS for a clean and responsive experience.

🧠 Tech Stack

Frontend: React + Vite

UI Components: ShadCN UI + TailwindCSS

OCR Engine: Tesseract.js

Backend: Supabase (Auth + Database)

State Management: React Hooks / Context API

Charts: Chart.js or Recharts

⚙️ Installation & Setup

Clone the repository

git clone https://github.com/yourusername/pocket-watch.git
cd pocket-watch

Install dependencies

npm install

Set up environment variables
Create a .env file in the root folder and add:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

Run the app

npm run dev
