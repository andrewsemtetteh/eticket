# E-Tickets Setup Guide

This guide will help you complete the setup of your e-tickets application with Paystack payments and Supabase database.

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Paystack Account**: Create an account at [paystack.com](https://paystack.com)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 1.2 Run Database Schema
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` file
4. Execute the SQL to create all tables, indexes, and policies

### 1.3 Update Environment Variables
Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-public-key
PAYSTACK_SECRET_KEY=sk_test_your-secret-key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-for-admin-auth
```

## Step 2: Paystack Setup

### 2.1 Get API Keys
1. Log in to your Paystack dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your Test Public Key and Test Secret Key
4. Update the `.env.local` file with these keys

### 2.2 Set Webhook URL (Optional)
For production, set up a webhook URL in Paystack:
- URL: `https://yourdomain.com/api/payments/webhook`
- Events: `charge.success`, `charge.failed`

## Step 3: Initialize Admin User

### 3.1 Start the Development Server
```bash
npm run dev
```

### 3.2 Create Admin User
Make a POST request to create the initial admin user:

**Using curl (if available):**
```bash
curl -X POST http://localhost:3000/api/admin/setup
```

**Using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/setup" -Method POST
```

**Or visit in browser:**
Navigate to `http://localhost:3000/api/admin/setup` (this will make a GET request, but the endpoint handles both)

### 3.3 Admin Login Credentials
- **Email**: admin@oraduku.com
- **Password**: admin123

## Step 4: Test the Application

### 4.1 Test Ticket Purchase Flow
1. Go to `http://localhost:3000`
2. Click "Get tickets"
3. Select ticket type and quantity
4. Fill in customer details
5. Complete payment with Paystack test cards

### 4.2 Test Admin Dashboard
1. Go to `http://localhost:3000/admin/login`
2. Login with admin credentials
3. View analytics and manage tickets

## Step 5: Paystack Test Cards

Use these test card numbers for testing:

**Successful Transactions:**
- Card: 4084084084084081
- CVV: 408
- Expiry: Any future date
- PIN: 0000

**Failed Transactions:**
- Card: 4084084084084085
- CVV: 408
- Expiry: Any future date

## File Structure

```
etickets/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   ├── api/                   # API routes
│   │   ├── admin/            # Admin API endpoints
│   │   ├── auth/             # User registration
│   │   ├── payments/         # Paystack integration
│   │   ├── settings/         # Event settings
│   │   └── tickets/          # Ticket management
│   ├── checkout/             # Checkout page
│   └── confirmation/         # Payment confirmation
├── components/
│   └── PaystackCheckout.tsx  # Payment component
├── lib/
│   ├── auth.ts              # Admin authentication
│   ├── paystack.ts          # Paystack service
│   └── supabase.ts          # Database client
├── supabase-schema.sql      # Database schema
└── .env.local              # Environment variables
```

## Features Implemented

### ✅ Payment Integration
- Paystack payment initialization
- Payment verification
- Transaction callbacks
- Multiple payment methods support

### ✅ Database Management
- User registration and management
- Ticket creation and tracking
- Payment records
- Event settings configuration

### ✅ Admin Dashboard
- Secure admin authentication
- Ticket management and status updates
- Payment analytics and reporting
- Recent activity tracking

### ✅ User Experience
- Responsive checkout flow
- Real-time payment processing
- QR code generation for tickets
- Email confirmation (ready for integration)

## Next Steps

1. **Production Deployment**: Update environment variables for production
2. **Email Integration**: Add email service for ticket confirmations
3. **Webhook Handling**: Implement Paystack webhook for real-time updates
4. **Security**: Review and enhance security measures
5. **Testing**: Comprehensive testing of all flows

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**: Verify URL and API key in `.env.local`
2. **Paystack Payment Fails**: Check API keys and test card details
3. **Admin Login Issues**: Ensure admin user was created via setup endpoint
4. **Database Errors**: Verify schema was executed correctly in Supabase

### Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Paystack**: Check [Paystack Documentation](https://paystack.com/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
