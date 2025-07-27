# 🚀 Deployment Checklist

Use this checklist to ensure smooth deployment of your Trendy Games application.

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All files committed to Git
- [ ] Repository pushed to GitHub
- [ ] Environment variables configured
- [ ] Build scripts working locally
- [ ] No sensitive data in code

### Testing
- [ ] Backend builds successfully (`npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] All game features work in local environment
- [ ] Socket connections working
- [ ] Mobile responsiveness tested

## 🔧 Backend Deployment (Railway/Render)

### Railway Deployment
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Configure environment variables:
  ```
  NODE_ENV=production
  PORT=3001
  CLIENT_URL=https://your-frontend-domain.vercel.app
  ```
- [ ] Deploy and test `/health` endpoint

### Render Deployment
- [ ] Create Render account
- [ ] New Web Service from GitHub
- [ ] Configure build settings:
  - Root Directory: `backend`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
- [ ] Set environment variables

## 🌐 Frontend Deployment (Vercel/Netlify)

### Vercel Deployment
- [ ] Create Vercel account
- [ ] Import repository
- [ ] Configure build settings:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Set environment variable:
  ```
  VITE_BACKEND_URL=https://your-backend-domain.railway.app
  ```

### Netlify Deployment
- [ ] Create Netlify account
- [ ] New site from Git
- [ ] Configure build settings:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
- [ ] Set environment variables

## 🔗 Post-Deployment

### Testing Production
- [ ] Frontend loads without errors
- [ ] Backend health check responds
- [ ] Socket connection established
- [ ] Can create rooms
- [ ] Can join rooms with codes
- [ ] Game functionality works end-to-end
- [ ] Mobile experience is smooth

### Performance
- [ ] Frontend loads in < 3 seconds
- [ ] Socket latency < 100ms
- [ ] No console errors
- [ ] PWA features working (if enabled)

### Security
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured correctly
- [ ] No sensitive data exposed
- [ ] Environment variables secured

## 🛠️ Environment Variables Reference

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend (Platform Settings)
```bash
VITE_BACKEND_URL=https://your-backend-domain.railway.app
```

## 🔄 Automatic Deployments

### GitHub Actions
- [ ] Workflow file present (`.github/workflows/deploy.yml`)
- [ ] Build tests passing
- [ ] Auto-deployment on push to main

### Platform Webhooks
- [ ] Vercel/Netlify auto-deploys on push
- [ ] Railway/Render auto-deploys on push
- [ ] Preview deployments for PRs

## 🐛 Troubleshooting

### Common Issues and Solutions

**Socket Connection Failed**
- [ ] Check VITE_BACKEND_URL matches deployed backend
- [ ] Verify CORS settings allow frontend domain
- [ ] Ensure both HTTP/HTTPS protocols match

**Build Failures**
- [ ] Check all dependencies in package.json
- [ ] Verify Node.js version compatibility
- [ ] Review build logs for specific errors

**404 Errors**
- [ ] Verify routing configuration
- [ ] Check build output directory
- [ ] Ensure SPA fallback configured

**Performance Issues**
- [ ] Enable compression on backend
- [ ] Optimize frontend bundle size
- [ ] Configure CDN if needed

## 📱 Mobile Testing

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify touch interactions
- [ ] Check responsive breakpoints
- [ ] Test Socket.IO on mobile networks

## 🔍 Monitoring

### Setup Monitoring (Optional)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation

### Key Metrics to Watch
- [ ] Response times
- [ ] Error rates
- [ ] Active connections
- [ ] Room creation success rate

## 🎉 Launch Ready!

Once all checkboxes are complete:
- [ ] Share your live URL with friends
- [ ] Document any deployment-specific notes
- [ ] Set up monitoring alerts
- [ ] Plan for scaling if needed

**Frontend URL**: `https://your-app.vercel.app`
**Backend URL**: `https://your-backend.railway.app`

Congratulations! Your Trendy Games app is now live! 🚀