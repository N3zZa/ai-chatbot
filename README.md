# 🤖 AI Chatbot Platform

A full-stack, ChatGPT-like interface built with Next.js. This project provides a seamless conversational AI experience with support for multimodal inputs (text, images, documents), anonymous usage limits, and real-time cross-tab synchronization.

## 🎥 Demo
* **Live Deployment:** [Insert Vercel Link Here]
* **Video Presentation:** [Insert Loom/YouTube Link Here]

---

## ✨ Features

* **Real-time LLM Streaming:** Smooth, token-by-token response generation using Vercel AI SDK and the Gemini API.
* **Multimodal Chat:** Support for uploading and analyzing images, `.pdf`, `.docx`, and `.txt` files directly in the chat context.
* **Anonymous & Authenticated Access:** * Anonymous users can ask up to 3 free questions before being prompted to sign up.
  * Secure authentication via Supabase Auth.
* **Persistent Chat History:** Chats are securely saved and can be renamed, accessed, or deleted via the sidebar.
* **Cross-Tab Synchronization:** Instant updates across multiple browser tabs using Supabase Realtime.
* **Polished UI/UX:** Responsive design built with Tailwind CSS and Shadcn UI, featuring loading skeletons, empty states, and smooth auto-scrolling animations.

---

## 🛠 Tech Stack & Architecture

* **Framework:** Next.js (App Router)
* **Client State & Data Fetching:** TanStack Query (`@tanstack/react-query`)
* **AI Integration:** Vercel AI SDK (`ai/react`)
* **Styling & UI:** Tailwind CSS, Shadcn UI, Lucide Icons, `react-markdown` (memoized for performance)
* **Database & Auth:** PostgreSQL via Supabase
* **Realtime:** Supabase Realtime channels

### 🏗 Architectural Principles
Strict separation of concerns is maintained throughout the application:
1. **Client Layer:** React components handle UI/UX and state. **Zero direct database calls** are made from the frontend or Server Components. All data is fetched via TanStack Query from the REST API.
2. **REST API Layer:** Next.js Route Handlers (`/api/*`) manage business logic, validation, and AI model interactions.
3. **Database Layer:** Supabase is accessed strictly server-side using the **Service Role Key** (bypassing RLS), ensuring secure, backend-only database transactions. The only exception is the Supabase Realtime client, which uses the public anon key strictly for listening to websocket events.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18.17+)
* npm / yarn / pnpm
* Supabase Project
* AI Provider API Key (e.g., Google Gemini)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a `.env.local` file in the root directory and configure the following variables. 
> **Security Note:** Never expose the `SUPABASE_SERVICE_ROLE_KEY` or `AI_API_KEY` to the client.

\`\`\`env
# Next.js Public
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Public - for Auth & Realtime only)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Supabase (Secret - for Backend DB operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# LLM Provider
GEMINIAI_API_KEY=your_gemini_api_key
\`\`\`

### 4. Database Setup
Execute the SQL schema located in `/supabase/migrations` (or wherever your schema is stored) in your Supabase SQL editor to create the necessary tables (`users`, `chats`, `messages`).

### 5. Run the development server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📡 API Endpoints Overview

The application strictly adheres to RESTful conventions:

* \`GET /api/chats\` - Retrieve all chats for the authenticated user.
* \`POST /api/chats\` - Create a new chat session.
* \`GET /api/chats/:chatId/messages\` - Fetch message history for a specific chat.
* \`PATCH /api/chats/:chatId\` - Update chat metadata (e.g., auto-generated title).
* \`DELETE /api/chats/:chatId\` - Delete a chat and its messages.
* \`POST /api/chats/:chatId/chat\` - Primary LLM interaction endpoint (handles streaming and limits).

---

## 🔒 Security Measures
* No API keys or Service Role keys are exposed to the browser.
* Ownership validation checks are enforced on every API route before modifying or fetching chat data.
* Anonymous user rate limiting is tracked securely server-side.