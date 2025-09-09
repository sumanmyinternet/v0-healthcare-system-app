# Admin Setup Instructions

## Method 1: Automatic Setup (Recommended)

1. Visit `/auth/setup-admin` in your browser
2. Click "Create Admin Account" 
3. Check email for verification (if required)
4. Login with credentials: `admin@cdpr.com` / `Admin123!`

## Method 2: Manual Setup

1. Go to `/auth/sign-up`
2. Register with:
   - Email: `admin@cdpr.com`
   - Password: `Admin123!`
   - Role: `Admin`
   - Full Name: `System Administrator`
3. Verify email if required
4. Run the SQL script `scripts/004_create_default_admin.sql`
5. Login at `/auth/login`

## Troubleshooting

If admin login fails:
1. Ensure the user was created successfully
2. Check that email is verified
3. Verify the role is set to 'admin' in the profiles table
4. Try resetting password if needed

## Security Note

**Important**: Change the default admin password immediately after first login for security purposes.
