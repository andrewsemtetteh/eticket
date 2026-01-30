Product Requirements Document (PRD)

Project: Ora duku – Event Ticketing System
Event: Sitting with the Silence After the Noise
Purpose: Allow invited guests to purchase e-tickets for a reflective, intimate art experience.

1. Objectives

Provide a secure and seamless e-ticketing system for an invitation-only art event.

Accept multiple payment methods: bank cards and mobile money (MTN, Vodafone/Telecel, AirtelTigo).

Minimalist, elegant dark theme interface that reflects the contemplative tone of the event.

2. Target Users

Guests invited to “Sitting with the Silence After the Noise.”

Users interested in slow, reflective engagement with art.

Mobile and desktop users who value intuitive, uncluttered design.

3. Event Description for Platform Display

Sitting with the Silence After the Noise is an intimate, invitation-only art experience designed for reflection, storytelling, and thoughtful conversation. Guests are guided through moments of silence and dialogue with a small selection of artworks, engaging directly with artists, curators, and collectors to explore meaning, intention, and value beyond aesthetics.

Rather than a traditional exhibition, the evening prioritizes depth, presence, and connection. Curated tea, wine, light pastries, and music gently accompany the experience, creating space for meaningful exchange and discovery. Attendance is intentionally limited to preserve intimacy. This is an experiment in how African art can be encountered, understood, and valued slowly, thoughtfully, and with care.

This text should be displayed prominently on the homepage or event page to set the tone.

4. Core Features
4.1 User Interface

Theme: Dark mode, minimalist.

Design elements:

Small card roundness (4–6px).

No shadows, gradients, or unnecessary icons.

Clear hierarchy: ticket type, pricing, and purchase actions.

Layout:

Homepage: Event overview with description, ticket options, “Buy Ticket” CTA.

Ticket selection: Choose ticket type (if applicable) and quantity.

Checkout: Select payment method, provide minimal personal info, confirm purchase.

Confirmation: E-ticket displayed with QR code and optional email/SMS receipt.

4.2 Ticket Management

Invitation-only system: Users can redeem unique invite codes if necessary.

Real-time ticket availability tracking.

Each ticket has a unique QR code for scanning at entry.

4.3 Payment Options

Bank payments: Visa, Mastercard, local bank cards.

Mobile money: MTN, Vodafone/Telecel, AirtelTigo.

Payment workflow:

Select payment method

Enter required details

Confirm payment

Receive e-ticket via email/SMS

Security: PCI DSS compliance, SSL encryption.

4.4 Notifications

Email and/or SMS confirmation of ticket purchase.

Optional reminder notification 24 hours before the event.

5. Technical Requirements

Frontend:

React.js or Vue.js for responsive design.

Minimalist dark mode UI with small card roundness.

Backend:

Node.js, Django, or Laravel for API and ticket management.

PostgreSQL/MySQL database for storing ticket and user info.

Payment gateway integration for bank and mobile money options.

Security:

SSL/TLS encryption for all data.

Input validation and fraud detection.

6. Non-functional Requirements

Performance: Checkout should complete in under 5 seconds.

Accessibility: High contrast for readability on dark mode.

Scalability: Able to handle hundreds of concurrent users.

Reliability: 99% uptime during ticketing period.

7. UX/UI Guidelines

Cards: Small roundness, no shadow.

Buttons: Clear CTA, subtle color accent.

Typography: Light text on dark background, legible and elegant.

Navigation: Simple menu, no extra icons or decorative elements.

Tone: Quiet, reflective, and elegant to match the event.

8. Workflow

User visits the Ora duku ticketing site.

User reads the event description → selects ticket type/quantity.

User proceeds to checkout → chooses payment method.

Payment completed → user receives e-ticket with QR code via email/SMS.

Event staff scans QR code at entry to verify attendance.

9. Optional Enhancements

Admin dashboard to track ticket sales and attendee data.