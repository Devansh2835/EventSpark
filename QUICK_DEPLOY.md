# Quick Deployment Checklist

## Step 1: Deploy Backend to Render ✅

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Choose "Deploy an existing project from a Git repository"
4. Select your GitHub repo
5. Fill in these details:
   - **Name**: college-event-manager-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: server
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your service URL (e.g., `https://college-event-manager-api.onrender.com`)

## Step 2: Add Environment Variables to Render ✅

Go to your Render service dashboard:

1. Click "Environment"
2. Add these variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-event-manager?retryWrites=true&w=majority
SESSION_SECRET=generate-a-random-string-here
FRONTEND_URL=https://your-vercel-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

3. Click "Save Changes"
4. Service will redeploy automatically

## Step 3: Update Frontend Environment ✅

In your `client/.env.production` file:

Replace this line:

```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
```

With your actual Render URL. For example:

```
REACT_APP_API_URL=https://college-event-manager-api.onrender.com/api
```

## Step 4: Deploy Frontend to Vercel ✅

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "other" and set:
   - **Root Directory**: `client`
5. Add Environment Variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-render-url.onrender.com/api`
6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

## Step 5: Update Render FRONTEND_URL ✅

Go back to Render dashboard:

1. Click on your backend service
2. Click "Environment"
3. Update `FRONTEND_URL` with your Vercel URL
4. Click "Save Changes"
5. Service will redeploy

## Verify Everything Works ✅

1. Open your Vercel frontend URL in browser
2. Try to register a new account
3. Check if OTP email arrives
4. Verify OTP
5. Try to login
6. Browse events
7. Try to register for an event

## Troubleshooting

### Frontend loads but can't login

```
Check:
1. REACT_APP_API_URL is correct in Vercel environment
2. Render backend service is running (check logs)
3. CORS error? Check browser DevTools Console (F12)
```

### CORS error in browser console

```
Error: "Access to XMLHttpRequest has been blocked by CORS policy"

Fix:
1. Go to Render dashboard
2. Check FRONTEND_URL matches your Vercel domain exactly
3. Restart the backend service
4. Wait 30 seconds and reload page
```

### 502 Bad Gateway error

```
Fix:
1. Render service might be sleeping (free tier sleeps after inactivity)
2. Click on service and ensure it's running
3. Wait for it to wake up (30-60 seconds)
4. Reload page
```

### MongoDB connection error

```
Check:
1. MongoDB URI is correct
2. Network access is allowed in MongoDB Atlas
3. Database user has correct password
4. Connection string in Render environment is exact
```

### Emails not sending

```
Check:
1. Gmail app password is correct
2. 2-Factor authentication is enabled on Gmail account
3. Check Render logs for email errors
```

## Quick Reference

| Service     | URL                                 | Type    |
| ----------- | ----------------------------------- | ------- |
| Frontend    | `https://your-app.vercel.app`       | Vercel  |
| Backend API | `https://your-api.onrender.com/api` | Render  |
| MongoDB     | `mongodb+srv://...`                 | Atlas   |
| Database    | college-event-manager               | MongoDB |

## Environment Variables Summary

```bash
# Frontend (.env.production in client folder)
REACT_APP_API_URL=https://your-api.onrender.com/api

# Backend (Environment variables in Render dashboard)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college-event-manager
SESSION_SECRET=strong-random-string
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

**After deployment, your app will be live and accessible to anyone!** 🎉
