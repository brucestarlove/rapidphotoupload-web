This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Prerequisites

1. **EC2 Server**: Your backend API server should be running and accessible
2. **CORS Configuration**: Ensure your EC2 server allows requests from your Vercel domain

### Environment Variables

Before deploying, configure these environment variables in your Vercel project settings:

- `NEXT_PUBLIC_API_URL`: Your EC2 server API endpoint (must be HTTPS for production)
  - Example: `https://your-ec2-server.com:8080` or `https://your-ec2-domain.com`
  - **Important**: Must use HTTPS (not HTTP) when deployed to Vercel
  - For development: `http://localhost:8080` is fine
  
- `NEXT_PUBLIC_WS_URL`: (Optional) Your EC2 server WebSocket endpoint
  - Example: `wss://your-ec2-server.com:8080/ws` or `wss://your-ec2-domain.com/ws`
  - If not set, will be derived from `NEXT_PUBLIC_API_URL` (replacing `https://` with `wss://`)
  - **Important**: Must use WSS (not WS) when deployed to Vercel

### Deployment Steps

1. **Connect your repository** to Vercel (GitHub/GitLab/Bitbucket)

2. **Configure Environment Variables**:
   - Go to your project settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` pointing to your EC2 server
   - Add `NEXT_PUBLIC_WS_URL` pointing to your EC2 WebSocket endpoint

3. **Build Settings** (usually auto-detected):
   - Framework Preset: Next.js
   - Build Command: `npm run build` (or `yarn build`)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (or `yarn install`)

4. **Deploy**: Vercel will automatically deploy on every push to your main branch

### Backend HTTPS Setup

Your EC2 backend **must** be served over HTTPS for production. Here are common approaches:

1. **Using a Reverse Proxy (Recommended)**:
   - Set up Nginx or Apache as a reverse proxy with SSL certificates
   - Use Let's Encrypt for free SSL certificates
   - Example Nginx config:
     ```nginx
     server {
         listen 443 ssl;
         server_name your-domain.com;
         
         ssl_certificate /path/to/cert.pem;
         ssl_certificate_key /path/to/key.pem;
         
         location / {
             proxy_pass http://localhost:8080;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection "upgrade";
         }
     }
     ```

2. **Using AWS Application Load Balancer**:
   - Create an ALB with SSL certificate (ACM)
   - Point it to your EC2 instance
   - Use the ALB DNS name as your API URL

3. **Using Cloudflare Tunnel**:
   - Set up Cloudflare Tunnel on your EC2 instance
   - Provides HTTPS automatically without exposing ports

### Important Notes

- **HTTPS Required**: Backend must use HTTPS (not HTTP) when frontend is served over HTTPS
- **CORS**: Ensure your EC2 backend allows requests from `https://your-vercel-app.vercel.app`
- **Security Groups**: Make sure your EC2 security group allows inbound traffic on ports 443 (HTTPS) and 8080 (if using reverse proxy)
- **Mobile Folder**: The `mobile/` directory is excluded from Vercel builds automatically (it's a separate React Native app)

### Troubleshooting

- **Mixed Content Errors**: If you see "Mixed Content" errors, ensure your backend is using HTTPS, not HTTP
- **WebSocket Connection Failures**: 
  - Verify your backend supports WebSocket upgrades (STOMP over SockJS)
  - Ensure you're using `wss://` (not `ws://`) in production
  - Check that your reverse proxy (if using one) supports WebSocket upgrades
- **CORS Errors**: Ensure your EC2 backend allows requests from your Vercel domain
- **API Connection Failures**: 
  - Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
  - Check that your EC2 security group allows inbound traffic
  - Test the backend URL directly in a browser/Postman
- **Build Issues**: Check Vercel build logs for any environment variable issues

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
