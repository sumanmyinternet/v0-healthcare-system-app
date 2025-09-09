# Default Admin Login Credentials

## Access the Admin Portal

1. **URL**: Navigate to `/auth/login`
2. **Default Credentials**:
   - **Email**: `suman.myinternet@gmail.com`
   - **Password**: `Admincdpr##`

## Important Security Notes

⚠️ **CHANGE DEFAULT CREDENTIALS IMMEDIATELY**

After your first login:
1. Go to your profile settings
2. Change the default password
3. Update the email if needed
4. Consider creating additional admin users

## Alternative Setup Method

If the default admin doesn't work, you can create an admin user manually:

1. Sign up normally at `/auth/sign-up`
2. Choose any role during signup
3. After registration, manually update your role in the database:
   \`\`\`sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   \`\`\`

## Admin Panel Features

Once logged in as admin, you'll have access to:
- User Management (view all users, manage roles)
- Doctor Management (approve doctors, specializations)
- Patient Management (view patient records)
- Financial Overview (wallet transactions, revenue)
- System Statistics and Analytics

## Troubleshooting

If you can't access the admin panel:
1. Ensure the database scripts have been run
2. Check that your user role is set to 'admin' in the profiles table
3. Clear browser cache and try again
4. Check the browser console for any errors
