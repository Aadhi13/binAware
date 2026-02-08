# Deployment Guide for binAware

This guide outlines the steps to deploy the **binAware** application. The client is optimized for [Vercel](https://vercel.com) and the server for [Render](https://render.com), but other platforms (Netlify, Heroku, Railway) will work with similar configurations.

## 1. Backend Deployment (Render)

We will deploy the Node.js/Express server first so we have the live API URL for the frontend.

1.  **Push your code to GitHub/GitLab.**
2.  **Log in to Render** and create a **New Web Service**.
3.  **Connect your repository.**
4.  **Configure the service:**
    *   **Name:** `binaware-server` (or similar)
    *   **Root Directory:** `server` (Important! The server code is in a subdirectory)
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  **Environment Variables:** Add the following environment variables in the Render dashboard:
    *   `ATLAS_URI`: Your MongoDB connection string (e.g., `mongodb+srv://...`)
    *   `JWT_SECRET`: A long, random string for security.
    *   `JWT_EXPIRES_IN`: e.g., `7d`
    *   `AUTH_EMAIL`: The Gmail address for sending OTPs.
    *   `GOOGLE_APP_PASSWORD`: The App Password for the Gmail account.
    *   `CORS_ORIGIN`: **Wait on this.** Initially, you can set it to `*` to test, or deploy the frontend first and come back to update this with the frontend's URL (e.g., `https://binaware-client.vercel.app`).
6.  **Deploy.** Render will build and start your server. Note the **Service URL** (e.g., `https://binaware-server.onrender.com`).

## 2. Frontend Deployment (Vercel)

Now we deploy the React client.

1.  **Log in to Vercel** and click **Add New Project**.
2.  **Import your repository.**
3.  **Configure the project:**
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `client` (Important! Click 'Edit' next to Root Directory and select `client`)
4.  **Environment Variables:** Add the following:
    *   `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://binaware-server.onrender.com/api`).
    *   `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
    *   `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary Upload Preset (unsigned).
    *   `VITE_ORS_API_KEY`: Your OpenRouteService API Key.
5.  **Deploy.** Vercel will build and deploy your site.

## 3. Final Connection

1.  **Update Backend CORS:** Go back to your Render dashboard, find the Environment Variables, and update `CORS_ORIGIN` to your new frontend URL (e.g., `https://binaware-yourname.vercel.app`). This secures your API so only your frontend can access it.
2.  **Redeploy Backend:** Render might require a manual restart or redeploy for the new env var to take effect.

## Troubleshooting

*   **Client 404 on Refresh:** If you refresh a page like `/dashboard` and get a 404, ensure the `vercel.json` file exists in the `client` directory with the rewrite rules.
*   **CORS Errors:** Check the Browser Console. If you see CORS errors, double-check that the `CORS_ORIGIN` on the server matches *exactly* with your frontend URL (no trailing slash usually best).
*   **Database Connection Fail:** Check the Render logs. Ensure your MongoDB Atlas IP Whitelist allows access from anywhere (0.0.0.0/0) or specifically from Render's IPs.
