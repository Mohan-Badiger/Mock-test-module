# Documentation Index

Welcome to the Mock Test Backend API documentation.

## 📚 Documentation Files

### [Environment Setup](./ENVIRONMENT.md)
Complete guide for configuring environment variables, including:
- Required and optional variables
- Database connection setup (Neon/Cloud or Local)
- Security best practices
- Troubleshooting tips

### [Deployment Guide](./DEPLOYMENT.md)
Production deployment instructions for:
- Heroku
- Railway
- Render
- Other platforms
- Health checks and monitoring
- Security checklist

### [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
Complete step-by-step guide for deploying to Render.com:
- Render-specific configuration
- Environment variables setup
- Database migration steps
- Troubleshooting Render-specific issues

### [API Documentation](./API.md)
Complete API reference including:
- All endpoints with request/response examples
- Authentication requirements
- Error responses
- Query parameters

### [Render Fix Guide](./RENDER_FIX.md)
Quick reference for fixing common Render deployment issues:
- CORS errors
- Database connection problems
- Environment variable setup

### [Vercel CORS Fix](./VERCEL_CORS_FIX.md)
Quick fix guide for CORS errors when using Vercel frontend:
- How to allow Vercel domains
- Environment variable configuration
- Troubleshooting steps

### [Multiple Vercel Domains](./VERCEL_MULTIPLE_DOMAINS.md)
Guide for handling multiple Vercel domains (production + preview):
- Why some domains work and others don't
- How to allow all Vercel domains
- Troubleshooting multiple domain issues

### [Admin Setup](./ADMIN_SETUP.md)
Complete guide for setting up admin accounts:
- Manual admin registration via SQL
- Password hashing instructions
- Creating and managing admin accounts
- Security best practices

## 🚀 Quick Start

1. **Setup Environment** → See [ENVIRONMENT.md](./ENVIRONMENT.md)
2. **Run Migrations** → `npm run migrate`
3. **Start Server** → `npm start` or `npm run dev`
4. **Deploy** → See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 Additional Resources

- Main [README.md](../README.md) - Project overview and quick start
- [package.json](../package.json) - Available npm scripts
- [.env.example](../.env.example) - Environment variable template

## 🔍 Need Help?

- **Configuration Issues**: Check [ENVIRONMENT.md](./ENVIRONMENT.md)
- **API Questions**: Review [API.md](./API.md)
- **Deployment Problems**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Render Deployment**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **CORS Errors**: Check [RENDER_FIX.md](./RENDER_FIX.md), [VERCEL_CORS_FIX.md](./VERCEL_CORS_FIX.md), or [VERCEL_MULTIPLE_DOMAINS.md](./VERCEL_MULTIPLE_DOMAINS.md)
