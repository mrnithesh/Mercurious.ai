# GCP Cloud Run Deployment Guide

This guide walks you through deploying Mercurious.ai to Google Cloud Platform (GCP) Cloud Run using the GCP Console. All steps can be completed through the web interface - no CLI required.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparing Firebase Credentials](#preparing-firebase-credentials)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Verification](#verification)
7. [Optional: Custom Domain Setup](#optional-custom-domain-setup)

---

## Prerequisites

### 1. GCP Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** (you'll need this later)

### 2. Enable Required APIs

1. Navigate to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Cloud Run API**
   - **Artifact Registry API**

### 3. Required Information

Before starting, gather:
- Your Firebase project credentials (from `firebase-credentials.json`)
- Gemini API Key
- YouTube Data API Key
- Firebase client configuration (from Firebase Console)

---

## Preparing Firebase Credentials

Your `firebase-credentials.json` file needs to be converted to individual environment variables.

### Firebase Service Account Fields

From your `firebase-credentials.json`, extract these values:

- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `client_id` → `FIREBASE_CLIENT_ID`

**Important:** When setting `FIREBASE_PRIVATE_KEY` in Cloud Run Console, keep the `\n` characters as-is. The console will handle them correctly.

### Firebase Client Configuration

From Firebase Console > Project Settings > Your apps, get:
- API Key → `NEXT_PUBLIC_FIREBASE_API_KEY`
- Auth Domain → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- Project ID → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Storage Bucket → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- Messaging Sender ID → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- App ID → `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Backend Deployment

### Step 1: Create Artifact Registry Repository

1. Navigate to **Artifact Registry** in GCP Console
2. Click **Create Repository**
3. Configure:
   - **Name**: `docker-repo` (or your preferred name)
   - **Format**: Docker
   - **Mode**: Standard
   - **Region**: Choose a region (e.g., `us-central1`)
4. Click **Create**

### Step 2: Build and Push Docker Image

You have two options:

#### Option A: Build Locally and Push

1. **Authenticate Docker** (one-time setup):
   ```bash
   gcloud auth configure-docker
   ```

2. **Build the image**:
   ```bash
   cd backend
   docker build -t REGION-docker.pkg.dev/PROJECT_ID/docker-repo/mercurious-backend:latest .
   ```
   Replace:
   - `REGION` with your repository region (e.g., `us-central1`)
   - `PROJECT_ID` with your GCP project ID

3. **Push the image**:
   ```bash
   docker push REGION-docker.pkg.dev/PROJECT_ID/docker-repo/mercurious-backend:latest
   ```

#### Option B: Use Cloud Build (via Console)

1. Navigate to **Cloud Build** > **Triggers**
2. Click **Create Trigger**
3. Connect your repository (GitHub/GitLab) or upload code
4. Configure build settings to use `backend/Dockerfile`
5. Set image name: `REGION-docker.pkg.dev/PROJECT_ID/docker-repo/mercurious-backend:latest`
6. Run the trigger

### Step 3: Deploy to Cloud Run

1. Navigate to **Cloud Run** in GCP Console
2. Click **Create Service**

3. **Configure the service**:
   - **Service name**: `mercurious-backend`
   - **Region**: Choose same region as Artifact Registry
   - **Deploy**: Select **1 revision**
   - **Container image**: Click **Select** and choose your pushed image

4. **Container settings**:
   - **Container port**: `8080`
   - **CPU allocation**: `CPU is only allocated during request processing`
   - **Memory**: `512 MiB` (or `1 GiB` if needed)
   - **CPU**: `1`
   - **Maximum number of instances**: `10`
   - **Minimum number of instances**: `0` (for cost savings)

5. **Environment variables** (expand **Container, Variables & Secrets, Connections, Security**):
   Click **Add Variable** for each:
   - `GEMINI_API_KEY` = your Gemini API key
   - `YOUTUBE_DATA_API` = your YouTube Data API key
   - `FIREBASE_PROJECT_ID` = from firebase-credentials.json
   - `FIREBASE_PRIVATE_KEY_ID` = from firebase-credentials.json
   - `FIREBASE_PRIVATE_KEY` = from firebase-credentials.json (keep `\n`)
   - `FIREBASE_CLIENT_EMAIL` = from firebase-credentials.json
   - `FIREBASE_CLIENT_ID` = from firebase-credentials.json
   - `FRONTEND_URL` = leave empty for now (set after frontend deployment)

6. **Authentication**:
   - Select **Allow unauthenticated invocations** (or configure as needed)

7. Click **Create** and wait for deployment

8. **Note the service URL** (e.g., `https://mercurious-backend-xxxxx.run.app`)

---

## Frontend Deployment

### Step 1: Build and Push Docker Image

#### Option A: Build Locally and Push

1. **Build the image with environment variables**:
   ```bash
   cd frontend/mercurious
   docker build \
     --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key" \
     --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com" \
     --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id" \
     --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com" \
     --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id" \
     --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id" \
     --build-arg NEXT_PUBLIC_API_URL="https://your-backend-url.run.app" \
     -t REGION-docker.pkg.dev/PROJECT_ID/docker-repo/mercurious-frontend:latest .
   ```
   Replace:
   - `REGION` with your repository region (e.g., `us-central1`)
   - `PROJECT_ID` with your GCP project ID
   - All `--build-arg` values with your actual Firebase and backend configuration

2. **Push the image**:
   ```bash
   docker push REGION-docker.pkg.dev/PROJECT_ID/docker-repo/mercurious-frontend:latest
   ```

#### Option B: Use Cloud Build (via Console)

1. Create a new Cloud Build trigger for the frontend
2. Set build configuration to use `frontend/mercurious/Dockerfile`
3. Set image name: `REGION-docker.pkg.dev/PROJECT_ID/docker-repo/mercurious-frontend:latest`

### Step 2: Deploy to Cloud Run

1. Navigate to **Cloud Run** in GCP Console
2. Click **Create Service**

3. **Configure the service**:
   - **Service name**: `mercurious-frontend`
   - **Region**: Same region as backend
   - **Deploy**: Select **1 revision**
   - **Container image**: Select your frontend image

4. **Container settings**:
   - **Container port**: `8080`
   - **CPU allocation**: `CPU is only allocated during request processing`
   - **Memory**: `512 MiB`
   - **CPU**: `1`
   - **Maximum number of instances**: `10`
   - **Minimum number of instances**: `0`

5. **Environment variables** (expand **Container, Variables & Secrets, Connections, Security**):
   **Note**: For Next.js, `NEXT_PUBLIC_*` variables are baked into the build. You can optionally set them here for reference, but they must be provided during the Docker build (see Step 1).
   
   If you want to set them here anyway (for documentation/consistency):
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = from Firebase Console
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = from Firebase Console
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = from Firebase Console
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = from Firebase Console
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = from Firebase Console
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = from Firebase Console
   - `NEXT_PUBLIC_API_URL` = your backend Cloud Run URL (from Step 3 of Backend Deployment)

6. **Authentication**:
   - Select **Allow unauthenticated invocations**

7. Click **Create** and wait for deployment

8. **Note the service URL** (e.g., `https://mercurious-frontend-xxxxx.run.app`)

---

## Post-Deployment Configuration

### Update Backend CORS

1. Navigate to **Cloud Run** > **mercurious-backend**
2. Click **Edit & Deploy New Revision**
3. Scroll to **Environment variables**
4. Find `FRONTEND_URL` and update it to your frontend Cloud Run URL (e.g., `https://mercurious-frontend-xxxxx.run.app`)
5. Click **Deploy**

---

## Verification

### 1. Test Backend

Open your browser and navigate to:
```
https://YOUR-BACKEND-URL/api/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "mercurious_ai_api",
  "message": "API is running successfully"
}
```

### 2. Test Frontend

1. Open your frontend URL in a browser: `https://YOUR-FRONTEND-URL`
2. The application should load successfully
3. Try signing up/logging in (Firebase authentication)
4. Test video processing functionality

### 3. Check Logs

If something doesn't work:

1. **Backend logs**: Cloud Run > mercurious-backend > **Logs** tab
2. **Frontend logs**: Cloud Run > mercurious-frontend > **Logs** tab

Common issues:
- Missing environment variables → Check Cloud Run environment variables
- CORS errors → Verify `FRONTEND_URL` is set correctly in backend
- Firebase errors → Verify all Firebase credentials are correct

---

## Optional: Custom Domain Setup

### 1. Map Custom Domain

1. Navigate to **Cloud Run** > Select your service
2. Click **Manage Custom Domains**
3. Click **Add Mapping**
4. Enter your domain name
5. Follow the DNS verification steps

### 2. Update Firebase Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Add your custom domain to **Authorized domains**
3. Update `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` in Cloud Run if needed

### 3. Update CORS

Update `FRONTEND_URL` in backend Cloud Run to your custom domain.

---

## Cost Optimization Tips

1. **Minimum instances**: Keep at `0` for portfolio projects (cold starts are acceptable)
2. **Memory**: Start with `512 MiB`, increase only if needed
3. **CPU**: Use `1` CPU for most cases
4. **Max instances**: Set reasonable limit (e.g., `10`) to prevent unexpected costs
5. **Cloud Run free tier**: 
   - 2 million requests per month
   - 360,000 GB-seconds of memory
   - 180,000 vCPU-seconds

---

## Troubleshooting

### Backend Issues

**Problem**: Health check fails
- **Solution**: Check environment variables, especially Firebase credentials

**Problem**: CORS errors
- **Solution**: Verify `FRONTEND_URL` is set correctly and matches your frontend URL exactly

**Problem**: API calls fail
- **Solution**: Check that `NEXT_PUBLIC_API_URL` in frontend matches backend URL

### Frontend Issues

**Problem**: Build fails
- **Solution**: Ensure all `NEXT_PUBLIC_*` environment variables are set

**Problem**: Firebase auth doesn't work
- **Solution**: Verify Firebase credentials and authorized domains

**Problem**: Can't connect to backend
- **Solution**: Check `NEXT_PUBLIC_API_URL` and backend CORS settings

---

## Security Notes

1. **Environment Variables**: While we're using direct env vars for simplicity, be careful not to expose sensitive values
2. **Firebase Rules**: Ensure Firestore security rules are properly configured
3. **API Keys**: Rotate API keys periodically
4. **CORS**: In production, restrict CORS to your frontend domain only

---

## Support

For issues or questions:
- Check Cloud Run logs
- Review Firebase Console for authentication issues
- Verify all environment variables are set correctly

---

**Deployment Complete!** 🎉

Your Mercurious.ai application should now be live on GCP Cloud Run.

