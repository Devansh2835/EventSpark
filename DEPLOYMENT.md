# College Event Manager - Deployment Guide

## Overview

This is a full-stack event management application with:

- **Frontend**: React (deployed on Vercel)
- **Backend**: Node.js/Express (deployed on Render)
- **Database**: MongoDB (Atlas or local)

## Deployment Issues Fixed

### Issues Identified and Resolved:

1. **CORS Policy Blocking** - Vercel frontend couldn't communicate with Render backend
2. **Missing Environment Variables** - No `.env` files for production
3. **Missing Credentials Flag** - API calls weren't including credentials for sessions
4. **Improper Origin Validation** - CORS regex wasn't matching Vercel URLs correctly
5. **No Deployment Configuration** - Missing `vercel.json` files

## Deployment Setup

### Backend (Render)

#### 1. Create MongoDB Atlas Database

- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/college-event-manager?retryWrites=true&w=majority`

#### 2. Get Cloudinary Credentials

- Sign up at [Cloudinary](https://cloudinary.com)
- Get: `CLOUD_NAME`, `API_KEY`, `API_SECRET`

#### 3. Set Up Email Service

- Gmail App Password (or use your email provider)
- Get: `EMAIL_USER`, `EMAIL_PASS`

#### 4. Deploy to Render

**Option A: Using Git**

```bash
# Push to GitHub
git push origin main

# Go to render.com, create new Web Service
# Connect your GitHub repo
# Set environment variables (see below)
```

**Option B: Manual Upload**

```bash
cd server
npm install
npm start
```

#### 5. Environment Variables on Render

Go to Render dashboard → Your Service → Environment:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-event-manager?retryWrites=true&w=majority
SESSION_SECRET=your-very-secure-random-string-here
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### Frontend (Vercel)

#### 1. Prepare Frontend for Production

The repo already contains:

- `.env.production` - For production builds
- `vercel.json` - Vercel configuration
- `.env.development` - For local development

#### 2. Update Production Environment

Edit `client/.env.production`:

```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
```

Replace `your-render-backend-url` with your actual Render service URL.

#### 3. Deploy to Vercel

**Option A: GitHub Integration (Recommended)**

```bash
# Push to GitHub
cd ../
git add .
git commit -m "Fix: Deployment configuration for Vercel and Render"
git push origin main
```

Then:

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Select `client` as the root directory
5. Set environment variable:
   - `REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api`
6. Deploy!

**Option B: Vercel CLI**

```bash
cd client
npm install -g vercel
vercel env add REACT_APP_API_URL
# Enter: https://your-render-backend-url.onrender.com/api
vercel
```

## Critical: API Endpoint Configuration

### After Deployment

1. **Get your Render backend URL** from Render dashboard

   - Format: `https://your-service-name.onrender.com`

2. **Update Vercel environment variable**

   - Set `REACT_APP_API_URL=https://your-service-name.onrender.com/api`
   - Redeploy Vercel

3. **Update Render environment variable**
   - Set `FRONTEND_URL=https://your-frontend-name.vercel.app`
   - Restart the service

## Testing the Deployment

### Test CORS

```bash
curl -X GET https://your-render-backend.onrender.com/api/events \
  -H "Origin: https://your-frontend.vercel.app"
```

### Test Authentication Flow

1. Go to your Vercel frontend URL
2. Register a new account
3. Verify OTP (check console for any errors)
4. Login
5. Try registering for an event
6. Check Network tab in browser DevTools for failed requests

## Troubleshooting

### "Failed to load resource" or 404 errors

- **Issue**: Frontend can't reach backend
- **Solution**:
  1. Check `REACT_APP_API_URL` is set correctly in Vercel
  2. Ensure Render service is running (not sleeping)
  3. Verify backend URL in `.env.production`

### CORS errors in browser console

- **Issue**: "Access to XMLHttpRequest has been blocked by CORS policy"
- **Solutions**:
  1. Ensure `FRONTEND_URL` matches your Vercel domain exactly
  2. Check that Render's CORS middleware includes `.vercel.app` domains
  3. Verify `withCredentials: true` is set on axios calls

### Sessions not persisting

- **Issue**: User logs in but gets logged out immediately
- **Solutions**:
  1. Ensure `sameSite: 'none'` and `secure: true` in cookies (production)
  2. Verify `SESSION_SECRET` is set on Render
  3. Check MongoDB connection is working

### Email verification not working

- **Issue**: OTP email not received
- **Solutions**:
  1. Verify `EMAIL_USER` and `EMAIL_PASS` are correct
  2. For Gmail: Use App Password (not regular password)
  3. Check spam folder
  4. Enable "Less secure apps" if not using App Password

### Image upload failing

- **Issue**: "Failed to upload image"
- **Solutions**:
  1. Verify Cloudinary credentials
  2. Check file size (should be < 5MB)
  3. Ensure image format is supported (jpg, png, webp)

## Monitoring

### Render Logs

Go to Render dashboard → Your Service → Logs
Look for:

- Connection errors
- CORS rejections
- Database connection issues

### Vercel Analytics

Go to Vercel dashboard → Your Project → Analytics
Monitor:

- API response times
- Error rates
- Deployment history

## Security Checklist

- [ ] Change `SESSION_SECRET` to a strong random string
- [ ] Don't commit `.env` files to git (already in `.gitignore`)
- [ ] Use App Passwords for Gmail, not actual password
- [ ] Verify Cloudinary API Secret is not exposed
- [ ] Enable HTTPS (automatic on both Render and Vercel)
- [ ] Set strong MongoDB password
- [ ] Review CORS allowed origins before production

## Local Development

### Setup

```bash
# Clone repo
git clone <repo>
cd college-event-manager

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with local settings
npm run dev

# Frontend (in new terminal)
cd client
npm install
npm start
```

### Environment for Local Dev

Create `server/.env`:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-event-manager
SESSION_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## File Structure Overview

```
college-event-manager/
├── client/                 # React frontend
│   ├── .env.production    # Production environment
│   ├── .env.development   # Development environment
│   ├── vercel.json        # Vercel configuration
│   └── src/
├── server/                 # Express backend
│   ├── vercel.json        # Render/Vercel configuration
│   ├── server.js          # Main app with CORS setup
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   └── utils/             # Helper functions
└── README.md
```

## Next Steps

1. [ ] Deploy backend to Render
2. [ ] Deploy frontend to Vercel
3. [ ] Update environment variables
4. [ ] Test all flows
5. [ ] Monitor logs for issues
6. [ ] Set up error tracking (optional: Sentry)

## Support

If you encounter issues:

1. Check the console in browser DevTools (F12)
2. Check Render service logs
3. Verify all environment variables are set
4. Ensure no typos in API URLs
