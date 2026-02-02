# Google Sheets Setup - Fixing Service Account Policy Block

## Problem
You're seeing: "Service account key creation is disabled" due to organization policy `iam.disableServiceAccountKeyCreation`

## Solution: Disable the Policy

### Step 1: Go to Organization Policies
1. Open Google Cloud Console: https://console.cloud.google.com/
2. Select your project
3. In the left menu, go to: **IAM & Admin** → **Organization Policies**
4. Or direct link: https://console.cloud.google.com/iam-admin/orgpolicies

### Step 2: Find and Edit the Policy
1. Search for: `Disable service account key creation`
2. Click on the policy
3. Click **"Manage Policy"** or **"Edit"**
4. Select **"Replace"** or **"Override parent's policy"**
5. Choose: **"Not enforced"** or **"Allow All"**
6. Click **"Set Policy"** or **"Save"**

### Step 3: Try Creating Service Account Again
1. Go back to **APIs & Services** → **Credentials**
2. Click on your service account
3. Go to **Keys** tab
4. Click **"Add Key"** → **"Create new key"**
5. Choose **JSON**
6. Download the key file

---

## Alternative: Use API Key Instead (Simpler but Less Secure)

If you still can't create a service account, we can use a simpler API key approach:

### Step 1: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key
4. Click **"Restrict Key"**:
   - **API restrictions**: Select "Google Sheets API"
   - **Application restrictions**: None (or HTTP referrers if you want)
5. Save

### Step 2: Make Sheet Public (Read-Only)
1. Open your Google Sheet
2. Click **"Share"**
3. Change to: **"Anyone with the link"** → **"Viewer"**
4. Copy the Sheet ID from URL

### Step 3: Update Code to Use API Key
I'll need to modify the `lib/google-sheets.js` to use API key instead of service account.

---

## Which Method Do You Want?

**Method 1 (Recommended)**: Disable the organization policy and use service account
**Method 2 (Simpler)**: Use API key with public sheet

Let me know which one works for you!
