# CDPR Health Care System

A comprehensive digital healthcare management system built with Next.js, Supabase, and modern web technologies.

## Features

### 🏥 Multi-Role System
- **Admin Panel**: Complete system oversight, user management, financial tracking
- **Doctor Panel**: Patient management, appointment scheduling, prescription creation
- **Patient Panel**: Health dashboard, appointment booking, family management, wallet system

### 🔐 Secure Authentication
- Role-based access control (Admin, Doctor, Patient)
- Email verification and secure session management
- Protected routes with middleware authentication

### 💳 Integrated Wallet System
- Digital wallet for healthcare payments
- Secure recharge functionality
- Transaction history and balance management
- Payment processing for appointments and services

### 📋 Prescription Management
- Digital prescription creation by doctors
- Medication tracking and history
- Status management (Active, Completed, Cancelled)
- Patient prescription access and monitoring

### 👨‍👩‍👧‍👦 Family Management
- Add and manage family members
- Dependent healthcare tracking
- Family prescription management
- Shared appointment booking

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel

## Database Schema

The system uses a comprehensive database schema with:
- User profiles with role-based access
- Wallet system for financial transactions
- Family member relationships
- Appointment scheduling
- Prescription management
- Doctor schedules and availability

## Getting Started

1. **Setup Database**: Run the SQL scripts in the `scripts/` folder:
   - `001_create_core_tables.sql`
   - `002_enable_rls_and_policies.sql`
   - `003_create_triggers_and_functions.sql`

2. **Configure Environment**: Ensure Supabase integration is connected

3. **Deploy**: The system is ready for deployment on Vercel

## User Roles & Access

### Admin
- System overview and analytics
- User management (patients, doctors)
- Financial oversight and reporting
- System configuration

### Doctor
- Patient management and records
- Appointment scheduling
- Prescription creation and management
- Schedule and availability management

### Patient
- Personal health dashboard
- Appointment booking and management
- Family member management
- Wallet and payment system
- Prescription tracking

## Security Features

- Row Level Security (RLS) policies
- Role-based access control
- Secure session management
- Protected API endpoints
- Data encryption and validation

## Support

For technical support or questions about the CDPR Health Care System, please contact the development team.
