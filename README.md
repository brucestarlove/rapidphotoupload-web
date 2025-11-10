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

- `NEXT_PUBLIC_API_URL`: Your EC2 server API endpoint
  - Example: `https://your-ec2-server.com:8080` (use HTTPS if available)
  - Or: `http://your-ec2-ip:8080` (if using IP address)
  
- `NEXT_PUBLIC_WS_URL`: Your EC2 server WebSocket endpoint
  - Example: `wss://your-ec2-server.com:8080/ws` (use WSS if HTTPS is available)
  - Or: `ws://your-ec2-ip:8080/ws` (if using IP address)

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

### Important Notes

- **HTTPS/WSS**: If your EC2 server has SSL certificates, use `https://` and `wss://` protocols
- **CORS**: Ensure your EC2 backend allows requests from `https://your-vercel-app.vercel.app`
- **Security Groups**: Make sure your EC2 security group allows inbound traffic on ports 8080 (or your API port)
- **Mobile Folder**: The `mobile/` directory is excluded from Vercel builds automatically (it's a separate React Native app)

### Troubleshooting

- If WebSocket connections fail, check that your EC2 server supports WebSocket upgrades
- If API calls fail, verify CORS settings on your EC2 server
- Check Vercel build logs for any environment variable issues

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
