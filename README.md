# Nelson-GPT PWA 🏥

*AI-Powered Pediatric Medical Assistant with Advanced Clinical Reasoning*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dr-zee/v0-nelson-gpt-pwa-design-tf)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/FPhgoezBOs3)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)]()

## ✨ Features

### 🧠 **Advanced AI Capabilities**
- **Evidence-Based Responses** from Nelson Textbook of Pediatrics
- **Clinical Reasoning Engine** with confidence scoring and risk assessment
- **Semantic Vector Search** using Hugging Face embeddings
- **Multi-Stage Query Processing** for complex medical scenarios

### 💬 **Intelligent Chat System**
- **Persistent Chat History** with session management
- **Real-time Message Sync** across devices
- **Citation Tracking** with page references
- **Error Recovery** with graceful degradation

### ⚙️ **Comprehensive Settings**
- **Role-Based Experience** (Parent, Healthcare Provider, Medical Student, Researcher)
- **Personalized AI Responses** with configurable confidence thresholds
- **Accessibility Features** including high contrast and reduced motion
- **Medical Unit Preferences** (metric/imperial, celsius/fahrenheit)

### 📱 **Progressive Web App**
- **Offline Functionality** with service worker caching
- **Native App Experience** with install prompts
- **Responsive Design** optimized for mobile and desktop
- **Dark/Light Theme** with system preference detection

### 🔒 **Enterprise-Grade Security**
- **HIPAA-Compliant Architecture** ready for medical data
- **Row-Level Security** with Supabase RLS policies  
- **Input Validation** and sanitization
- **Error Boundaries** preventing app crashes

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ with pnpm
- Supabase project
- Hugging Face API key (free tier available)

### 1. **Clone and Install**
```bash
git clone https://github.com/DrZ199/v0-nelson-gpt-pwa.git
cd v0-nelson-gpt-pwa
pnpm install
```

### 2. **Database Setup**
Run these SQL scripts in your Supabase SQL editor:
```bash
# 1. Vector search setup
scripts/001_setup_vector_search.sql

# 2. Enhanced chat schema  
scripts/002_enhance_chat_messages_schema.sql

# 3. User settings and sessions
scripts/003_user_settings_schema.sql
```

### 3. **Environment Configuration**
```bash
cp .env.local.example .env.local
```

Fill in your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Hugging Face Embeddings
HUGGINGFACE_API_KEY=hf_your-api-key-here
```

### 4. **Run Development Server**
```bash
pnpm dev
# Visit http://localhost:3000
```

### 5. **Build for Production**
```bash
pnpm build
pnpm start
```

## 🏗️ **Architecture**

### **Frontend Stack**
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS V4** with custom design system
- **ShadCN UI** components with Radix primitives

### **Backend Services**  
- **Supabase** PostgreSQL with pgvector
- **Hugging Face** embeddings API
- **Edge Functions** for AI processing

### **Key Components**
```
├── app/api/               # API routes
│   ├── chat/             # AI chat processing
│   ├── settings/         # User preferences
│   ├── sessions/         # Chat session management
│   └── messages/         # Message CRUD
├── lib/                  # Core utilities
│   ├── embeddings.ts     # Hugging Face integration
│   ├── settings-context.tsx
│   └── chat-context.tsx
└── components/           # UI components
    ├── chat-interface.tsx
    ├── error-boundary.tsx
    └── pages/            # Settings pages
```

## 🔧 **API Endpoints**

### Chat & AI
- `POST /api/chat` - Process medical queries with AI
- `GET /api/health` - System health and embedding validation

### Session Management  
- `GET /api/sessions` - Retrieve chat sessions
- `POST /api/sessions` - Create/update sessions
- `DELETE /api/sessions` - Delete sessions

### Messages
- `GET /api/messages` - Get session messages
- `POST /api/messages` - Save new messages
- `PUT /api/messages` - Edit/rate messages

### Settings
- `GET /api/settings` - User preferences
- `POST /api/settings` - Update settings
- `DELETE /api/settings` - Reset to defaults

## 📊 **Database Schema**

### Core Tables
- **`chat_sessions`** - Chat metadata and medical context
- **`chat_messages`** - Messages with citations and reasoning
- **`user_settings`** - Personalized preferences
- **`nelson_textbook_chunks`** - Vector-indexed medical content

### Advanced Features
- **Vector Similarity Search** with pgvector extension
- **Row-Level Security** for user data protection  
- **PostgreSQL Functions** for efficient operations
- **Automated Triggers** for data consistency

## 🎯 **Medical Features**

### Clinical Decision Support
- **Symptom Analysis** with demographic considerations
- **Risk Stratification** (Low/Medium/High)
- **Specialist Referral** recommendations  
- **Evidence Citations** from Nelson Textbook

### Safety Systems
- **Confidence Scoring** for AI responses
- **Medical Disclaimers** on all interactions
- **Error Handling** with medical context awareness
- **Audit Logging** for compliance tracking

## 📱 **PWA Capabilities**

### Installation
- **Custom Install Prompts** with medical branding
- **Offline Functionality** for basic operations
- **Background Sync** for message queuing
- **Push Notifications** for critical alerts (optional)

### Performance
- **Service Worker** with advanced caching strategies
- **Code Splitting** for optimal loading
- **Image Optimization** with Next.js
- **Bundle Analysis** and optimization

## 🔒 **Security & Compliance**

### Data Protection
- **HIPAA-Ready Architecture** with proper safeguards
- **End-to-End Encryption** for sensitive data
- **Secure Headers** and CORS configuration
- **Input Validation** preventing injection attacks

### Privacy Controls
- **Anonymous Usage** without requiring accounts
- **Data Retention** policies with automatic cleanup
- **Export/Delete** user data on request
- **Audit Trails** for compliance reporting

## 🧪 **Development**

### Code Quality
- **TypeScript** with strict configuration
- **ESLint** and Prettier for consistency
- **Error Boundaries** preventing crashes
- **Comprehensive Logging** for debugging

### Testing (Coming Soon)
- **Unit Tests** with Jest and React Testing Library
- **Integration Tests** for API endpoints
- **E2E Tests** with Playwright
- **Accessibility Testing** with axe-core

## 📈 **Monitoring & Analytics**

### Health Monitoring
- **API Health Checks** with `/api/health`
- **Embedding Service** validation
- **Database Connectivity** monitoring
- **Performance Metrics** tracking

### Usage Analytics (Optional)
- **Privacy-First Analytics** with user consent
- **Medical Query Patterns** for improvement
- **Error Rate Monitoring** with Sentry integration
- **Performance Tracking** with Core Web Vitals

## 🤝 **Contributing**

This project is continuously improving. Key areas for contribution:

- **Medical Content**: Expanding the knowledge base
- **Accessibility**: Enhanced screen reader support  
- **Performance**: Optimization and caching improvements
- **Testing**: Comprehensive test suite development

## 📄 **License**

This project is built on v0.dev and deployed on Vercel. Please review the terms of service for both platforms.

## 🆘 **Support**

- **Documentation**: See `FIXES_AND_IMPROVEMENTS.md` for detailed implementation notes
- **Health Check**: Visit `/api/health` to verify system status
- **Issues**: Check the GitHub issues for known problems and solutions

---

**⚠️ Medical Disclaimer**: This application provides educational information only. Always consult with qualified healthcare professionals for medical decisions and emergencies.

**Built with ❤️ for pediatric healthcare** | *Last updated: September 2025*