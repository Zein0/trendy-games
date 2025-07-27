# Deployment Guide for Trendy Games

This guide will help you deploy both the frontend and backend of your Trendy Games application.

## Prerequisites

1. Create accounts on:
   - [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (for frontend)
   - [Railway](https://railway.app) or [Render](https://render.com) (for backend)
   - [GitHub](https://github.com) (to push your code)

2. Install necessary CLIs (optional):
   ```bash
   npm i -g vercel netlify-cli
   ```

## Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   cd /mnt/c/Users/Zein/Documents/project/trendy-games
   git init
   git add .
   git commit -m "Initial commit with organized structure"
   ```

2. Create a GitHub repository and push:
   ```bash
   git remote add origin https://github.com/Zein0/trendy-games.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend (Choose one option)

### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect your backend in the `backend` folder
6. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```
7. Deploy will happen automatically

### Option B: Render

1. Go to [Render](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Set environment variables in the dashboard

## Step 3: Deploy Frontend (Choose one option)

### Option A: Vercel (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Set environment variable:
   ```
   VITE_BACKEND_URL=https://your-backend-domain.railway.app
   ```
7. Deploy

### Option B: Netlify

1. Go to [Netlify](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Set environment variable in Site settings:
   ```
   VITE_BACKEND_URL=https://your-backend-domain.railway.app
   ```

## Step 4: Update Environment Variables

### Backend Environment Variables:
```
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables:
```
VITE_BACKEND_URL=https://your-backend-domain.railway.app
```

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try creating a room
3. Test the game functionality
4. Check browser console for any errors

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Make sure `CLIENT_URL` in backend matches your frontend domain
   - Check that both HTTP and HTTPS protocols match

2. **Socket Connection Issues**:
   - Verify `VITE_BACKEND_URL` points to correct backend domain
   - Ensure backend is running and accessible

3. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Checking Logs:

- **Railway**: Check logs in the Railway dashboard
- **Render**: View logs in the Render dashboard  
- **Vercel**: Check function logs in Vercel dashboard
- **Netlify**: View deploy logs in Netlify dashboard

## Development vs Production

### Local Development:
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

### Production URLs:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

## Security Notes

1. Never commit `.env` files with sensitive data
2. Use environment variables for all configuration
3. Keep your GitHub repository private if needed
4. Regularly update dependencies

## Automatic Deployments

Both Vercel/Netlify and Railway/Render support automatic deployments:
- Push to `main` branch → automatic deployment
- Pull requests → preview deployments
- Environment-specific branches supported

## Cost Considerations

- **Vercel/Netlify**: Free tier sufficient for most small projects
- **Railway**: $5/month after free tier usage
- **Render**: Free tier available with limitations

Your app is now ready for deployment! 🚀