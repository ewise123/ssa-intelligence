# SSA Intelligence Frontend

Beautiful React + TypeScript frontend for the SSA Intelligence research platform.

---

## 🎨 What's This?

This is the **complete frontend** for your SSA Intelligence app - the UI you designed with:
- Dashboard with active/completed research
- New research form with real-time progress
- Research detail view with section navigation
- Terminal-style activity log
- Markdown rendering
- Source citations

---

## ⚡ Quick Start

### Prerequisites
- Node.js v20+
- npm v10+
- Backend running on http://localhost:3000

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5174

**That's it!** The frontend will proxy API calls to your backend automatically.

---

## 📁 Project Structure

```
ssa-intelligence-frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Main layout with sidebar
│   │   └── StatusPill.tsx       # Status indicator component
│   │
│   ├── pages/
│   │   ├── Home.tsx             # Dashboard with job list
│   │   ├── NewResearch.tsx      # Create job with progress
│   │   └── ResearchDetail.tsx   # View complete report
│   │
│   ├── services/
│   │   └── researchManager.ts   # API client & state management
│   │
│   ├── types.ts                 # TypeScript types
│   ├── App.tsx                  # Root component
│   ├── index.tsx                # Entry point
│   └── index.css                # Global styles
│
├── public/                      # Static assets (if needed)
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration (with proxy!)
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## 🔌 Backend Integration

### Automatic Proxy (Already Configured!)

The `vite.config.ts` already has a proxy configured:

```typescript
proxy: {
  '/api': 'http://localhost:3000'  // All /api/* requests go to backend
}
```

**This means:**
- Frontend: http://localhost:5174
- Backend: http://localhost:3000
- API calls to `/api/*` automatically proxy to backend

**No CORS issues!** The proxy handles everything.

### API Endpoints Used

The frontend calls these backend endpoints:

- `POST /api/research/generate` - Create new research job
- `GET /api/research/jobs/:id` - Get job status (polled every 2s)
- `GET /api/research/:id` - Get complete research with all sections
- `GET /api/research` - List all research jobs

All calls are in `src/services/researchManager.ts`

---

## 🎯 How It Works

### 1. User Creates Research (NewResearch.tsx)

```typescript
// User submits form
createJob(companyName, geography, industry)
  ↓
// POST /api/research/generate
  ↓
// Backend returns jobId
  ↓
// Frontend polls for progress
runJob(jobId)
  ↓
// GET /api/research/jobs/:id (every 2 seconds)
  ↓
// Progress updates in real-time
  ↓
// When complete, redirect to detail view
```

### 2. Progress Display

**Left Panel:** Shows 10 sections with status icons
- Pending: Gray circle
- Running: Blue spinner
- Complete: Green checkmark

**Right Panel:** Terminal-style activity log
- Shows current action
- Displays completed sections
- Real-time updates

### 3. View Report (ResearchDetail.tsx)

**Left Sidebar:** Section navigation
- Click to switch between sections
- Shows completion status

**Content Area:** Markdown rendering
- Headers, lists, bold text
- Clean typography

**Footer:** Source citations
- Clickable links to sources
- Grouped by section

---

## 🎨 Styling

Uses **Tailwind CSS** via CDN (in index.html):

```html
```

**Custom Theme:**
- Brand color: Purple (#7c3aed)
- Clean slate grays
- Professional typography

**Animations:**
- Fade in on page load
- Smooth transitions
- Progress bar animations

---

## 🧪 Development

### Run Dev Server

```bash
npm run dev
```

**Hot reload enabled** - changes reflect immediately!

### Build for Production

```bash
npm run build
```

Output: `dist/` folder

### Preview Production Build

```bash
npm run preview
```

---

## 🔧 Configuration

### Change Backend URL

If your backend is NOT on localhost:3000:

**Option 1: Edit vite.config.ts**
```typescript
proxy: {
  '/api': 'http://your-backend-url:port'
}
```

**Option 2: Use environment variable**
```bash
# Create .env file
VITE_API_BASE_URL=http://your-backend-url:port/api
```

### Change Frontend Port

Edit `vite.config.ts`:
```typescript
server: {
  port: 5174,  // Change this
}
```

---

## 📊 Features

### Dashboard (Home.tsx)
✅ Active jobs with progress bars  
✅ Completed research library  
✅ Search/filter capability  
✅ Status indicators  
✅ Quick actions  

### New Research (NewResearch.tsx)
✅ Simple form (company + geography + industry)  
✅ Real-time progress tracking  
✅ 10-section checklist  
✅ Terminal-style activity log  
✅ Auto-redirect on completion  

### Research Detail (ResearchDetail.tsx)
✅ Section navigation sidebar  
✅ Markdown content rendering  
✅ Source citations with links  
✅ Headers, lists, bold text support  
✅ Confidence score display  
✅ Status pills for each section  

### Components
✅ Collapsible sidebar  
✅ Status pills (pending/running/complete/failed)  
✅ Breadcrumb navigation  
✅ Responsive layout  

---

## 🎓 Key Files Explained

### `researchManager.ts`

**The heart of the frontend!** Handles all API communication:

```typescript
export const useResearchManager = () => {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  
  const createJob = async (...) => {
    // POST /api/research/generate
  };
  
  const runJob = async (jobId) => {
    // Poll GET /api/research/jobs/:id every 2s
    // Update state in real-time
  };
  
  return { jobs, createJob, runJob };
};
```

**Key features:**
- Automatic polling (2 second intervals)
- State management for all jobs
- Error handling
- Progress calculation
- Source resolution

### `types.ts`

TypeScript types matching backend:

```typescript
type JobStatus = 'idle' | 'running' | 'completed' | 'failed';
type SectionId = 'exec_summary' | 'financial_snapshot' | ...;

interface ResearchJob {
  id: string;
  status: JobStatus;
  progress: number;
  sections: Record<SectionId, ResearchSection>;
}
```

### `Layout.tsx`

Main app layout:
- Collapsible sidebar
- Navigation
- Header with user menu
- Responsive design

---

## 🐛 Troubleshooting

### Frontend won't start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't connect to backend

**Check proxy configuration:**
```bash
# In vite.config.ts
proxy: {
  '/api': 'http://localhost:3000'  # Must point to backend
}
```

**Check backend is running:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

**Check browser console (F12):**
- Should NOT see CORS errors
- Should see successful API calls

### Styles not loading

Check `index.html` has Tailwind CDN:
```html
```

### TypeScript errors

```bash
# Regenerate types
npm run type-check
```

---

## 📦 Dependencies

### Core
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

### UI
- **Tailwind CSS** - Styling (via CDN)
- **Lucide React** - Icons

### Dev
- **@vitejs/plugin-react** - React plugin for Vite
- **TypeScript** - Language

**Total size:** ~50MB installed (mostly React)

---

## 🚀 Deployment

### With Backend (Same Server)

1. Build frontend:
```bash
npm run build
```

2. Serve from backend:
```typescript
// In backend Express app
app.use(express.static('../frontend/dist'));
```

### Separate Deployment

**Frontend (e.g., Vercel, Netlify):**
```bash
npm run build
# Deploy dist/ folder
```

**Update API URL:**
```bash
# .env.production
VITE_API_BASE_URL=https://your-backend.com/api
```

**Backend (e.g., Railway, Render):**
- Set CORS_ORIGIN to your frontend URL

---

## ✅ Checklist

- [ ] `npm install` completed
- [ ] Backend running on port 3000
- [ ] `npm run dev` starts successfully
- [ ] Can access http://localhost:5174
- [ ] Can create test research job
- [ ] Progress updates in real-time
- [ ] Can view completed research
- [ ] Sources show as clickable links

---

## 💡 Tips

1. **Keep backend running** - Frontend needs it for all data
2. **Use React DevTools** - Inspect component state
3. **Check Network tab** - See API calls in browser console
4. **Hot reload works** - Just save and see changes
5. **Tailwind is CDN-based** - No build step needed for styles

---

## 📞 Support

If you encounter issues:

1. Check backend is running: `curl http://localhost:3000/health`
2. Check browser console (F12) for errors
3. Verify proxy in `vite.config.ts`
4. Clear cache: `rm -rf node_modules && npm install`

---

**Happy researching!** 🚀

Built with ❤️ for institutional-grade company intelligence.
