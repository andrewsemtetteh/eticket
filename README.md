# E-Tickets Application

A modern event ticketing system built with Next.js, Supabase, and Paystack integration. Features real-time payments, ticket management, and a comprehensive admin dashboard.

## Features

### 🎫 Ticket Management
- **Early Bird & General Tickets**: Dynamic pricing and availability
- **QR Code Generation**: Unique QR codes for each ticket
- **Real-time Inventory**: Live ticket availability tracking
- **Multiple Quantities**: Support for bulk ticket purchases

### 💳 Payment Integration
- **Paystack Integration**: Secure payment processing
- **Multiple Payment Methods**: Cards, mobile money, bank transfers
- **Payment Verification**: Automatic transaction verification
- **Receipt Generation**: Digital receipts and confirmations

### 👨‍💼 Admin Dashboard
- **Secure Authentication**: JWT-based admin login system
- **Ticket Management**: View, filter, and update ticket statuses
- **Analytics Dashboard**: Revenue tracking and ticket statistics
- **Recent Activity**: Real-time activity monitoring
- **Event Settings**: Configurable pricing and limits

### 🔒 Security & Data
- **Supabase Backend**: Secure PostgreSQL database
- **Row Level Security**: Database-level access control
- **Admin-only Access**: Protected admin routes and APIs
- **Data Validation**: Comprehensive input validation

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Paystack account (for payments)

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd etickets
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Database Setup**
   - Run the SQL in `supabase-schema.sql` in your Supabase project
   - Update environment variables with your Supabase credentials

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Initialize Admin User**
   ```bash
   # Visit or POST to:
   http://localhost:3000/api/admin/setup
   ```

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

### Admin Access
- **URL**: `/admin/login`
- **Email**: admin@oraduku.com
- **Password**: admin123

## API Endpoints

### Public APIs
- `GET /api/settings` - Event settings and ticket stats
- `POST /api/auth/register` - User registration
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/tickets` - Get ticket information

### Admin APIs (Protected)
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/tickets` - Get all tickets
- `PUT /api/admin/tickets` - Update ticket status
- `GET /api/admin/analytics` - Dashboard analytics
- `POST /api/admin/setup` - Initialize admin user

## Database Schema

### Tables
- **users** - Customer and admin user data
- **tickets** - Individual ticket records
- **payments** - Payment transaction records
- **event_settings** - Configurable event parameters

### Key Features
- UUID primary keys
- Automatic timestamps
- Row Level Security (RLS)
- Foreign key relationships
- Indexed for performance

## Payment Flow

1. **Customer Selection**: Choose ticket type and quantity
2. **Information Entry**: Provide contact details
3. **Payment Initialization**: Create payment record and Paystack transaction
4. **Payment Processing**: Redirect to Paystack for payment
5. **Verification**: Verify payment and create tickets
6. **Confirmation**: Display tickets with QR codes

## Admin Features

### Dashboard Analytics
- Total tickets sold
- Revenue tracking
- Ticket type breakdown
- Recent activity feed

### Ticket Management
- View all tickets with filters
- Update ticket statuses
- Customer information access
- Payment status tracking

## Development

### Project Structure
```
etickets/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── checkout/          # Checkout flow
│   └── confirmation/      # Payment confirmation
├── components/            # Reusable components
├── lib/                   # Utilities and services
├── supabase-schema.sql    # Database schema
└── SETUP.md              # Detailed setup guide
```

### Key Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Supabase**: Backend-as-a-Service
- **Paystack**: Payment processing
- **Tailwind CSS**: Utility-first styling

## Testing

### Test Payment Cards
**Successful Payment:**
- Card: 4084084084084081
- CVV: 408
- Expiry: Any future date

**Failed Payment:**
- Card: 4084084084084085
- CVV: 408
- Expiry: Any future date

## Deployment

### Production Checklist
- [ ] Update environment variables for production
- [ ] Configure Paystack live keys
- [ ] Set up proper domain for callbacks
- [ ] Enable Supabase production mode
- [ ] Configure email service (optional)
- [ ] Set up monitoring and logging

### Recommended Platforms
- **Vercel**: Seamless Next.js deployment
- **Netlify**: Alternative deployment option
- **Railway**: Full-stack deployment

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)

### Common Issues
- **Payment failures**: Check Paystack API keys
- **Database errors**: Verify Supabase schema setup
- **Admin access**: Ensure admin user was created

## License

This project is licensed under the MIT License.
