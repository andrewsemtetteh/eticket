import nodemailer from 'nodemailer';

interface TicketEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketId: string;
  ticketType: 'early_bird' | 'general';
  quantity: number;
  totalAmount: number;
  currency: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  paymentReference: string;
  purchaseDate: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };
};

const createTransporter = () => {
  const config = getEmailConfig();
  return nodemailer.createTransport(config);
};

const generateTicketHTML = (data: TicketEmailData, isAdmin: boolean = false): string => {
  const ticketTypeLabel = data.ticketType === 'early_bird' ? 'Early Bird' : 'General';
  const ticketTypeColor = data.ticketType === 'early_bird' ? '#3B82F6' : '#8B5CF6';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Confirmation - ${data.eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: transparent; color: #fff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Minimalistic Black Landscape Ticket -->
        <table role="presentation" style="width: 100%; max-width: 1000px; height: 280px; border-collapse: collapse; background-color: #000000; border: 3px solid #000; position: relative; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9); margin: 0 auto;">
          
          <!-- Main Ticket Content (Minimalistic) -->
          <tr>
            <td style="padding: 0; height: 280px;">
              <table role="presentation" style="width: 100%; height: 280px; border-collapse: collapse;">
                <tr>
                  <!-- Main Ticket Section (70%) -->
                  <td style="width: 70%; padding: 30px; vertical-align: top; border-right: 3px dashed #444; background-color: #000000; position: relative;">
                    <!-- Top V-Curve Cut Design -->
                    <div style="position: absolute; top: -15px; right: -15px; left: 0; height: 30px; background: #000000;">
                      <svg width="100%" height="30" style="position: absolute; top: 0; left: 0;">
                        <path d="M 0,15 Q 25,0 50,15 T 100,15" stroke="#444" stroke-width="2" fill="none"/>
                        <circle cx="25" cy="15" r="3" fill="#444"/>
                        <circle cx="50" cy="15" r="3" fill="#444"/>
                        <circle cx="75" cy="15" r="3" fill="#444"/>
                      </svg>
                    </div>
                    
                    <!-- Event Title -->
                    <div style="margin-bottom: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #C9A227; text-transform: uppercase; letter-spacing: 3px;">
                        ${data.eventTitle}
                      </h1>
                      <p style="margin: 8px 0 0 0; font-size: 11px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        ${isAdmin ? 'ADMIN COPY' : 'ADMISSION TICKET'}
                      </p>
                    </div>

                    <!-- Essential Event Information -->
                    <div style="margin-bottom: 25px;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #fff; font-weight: 600; text-align: center;">
                        <strong>${data.eventDate}</strong> • 5:00 PM
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #ccc; text-align: center;">
                        Location will be emailed two weeks before the event
                      </p>
                    </div>

                    <!-- Ticket Information -->
                    <div style="margin-bottom: 25px;">
                      <p style="margin: 0 0 6px 0; font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                        <span style="color: ${ticketTypeColor}; font-weight: bold;">${ticketTypeLabel.toUpperCase()}</span> • ${data.quantity} TICKET${data.quantity > 1 ? 'S' : ''} • ${data.currency} ${data.totalAmount.toFixed(2)}
                      </p>
                    </div>

                                        
                    <!-- Bottom V-Curve Cut Design -->
                    <div style="position: absolute; bottom: -15px; right: -15px; left: 0; height: 30px; background: #000000;">
                      <svg width="100%" height="30" style="position: absolute; bottom: 0; left: 0;">
                        <path d="M 0,15 Q 25,30 50,15 T 100,15" stroke="#444" stroke-width="2" fill="none"/>
                        <circle cx="25" cy="15" r="3" fill="#444"/>
                        <circle cx="50" cy="15" r="3" fill="#444"/>
                        <circle cx="75" cy="15" r="3" fill="#444"/>
                      </svg>
                    </div>
                  </td>
                  
                  <!-- Right Side Information (30%) -->
                  <td style="width: 30%; padding: 30px; text-align: center; vertical-align: top; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); position: relative;">
                    <!-- Left V-Curve Perforation -->
                    <div style="position: absolute; left: -15px; top: 10%; bottom: 10%; width: 30px; background: #0a0a0a;">
                      <svg width="30" height="100%" style="position: absolute; top: 0; left: 0;">
                        <path d="M 15,0 Q 0,25% 15,50% T 15,100%" stroke="#444" stroke-width="2" fill="none" stroke-dasharray="4,2"/>
                        <circle cx="15" cy="25%" r="3" fill="#444"/>
                        <circle cx="15" cy="50%" r="3" fill="#444"/>
                        <circle cx="15" cy="75%" r="3" fill="#444"/>
                      </svg>
                    </div>
                    
                    <!-- QR Code Section -->
                    <div style="margin-bottom: 30px;">
                      <p style="margin: 0 0 15px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">
                        SCAN FOR ENTRY
                      </p>
                      <div style="width: 100px; height: 100px; margin: 0 auto; border: 2px solid #444; padding: 0px; background-color: #fff; display: flex; align-items: center; justify-content: center;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data.ticketId)}" alt="QR Code" style="display: block; width: 100px; height: 100px;">
                      </div>
                    </div>

                    <!-- Ticket Number -->
                    <div style="margin-bottom: 30px;">
                      <p style="margin: 0 0 8px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">
                        Ticket Number
                      </p>
                      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #fff; letter-spacing: 2px;">${data.ticketId}</p>
                    </div>

                    <!-- Reference -->
                    <div>
                      <p style="margin: 0 0 8px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">
                        Reference
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #ccc; word-break: break-all;">${data.paymentReference}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const generateTicketPDF = async (data: TicketEmailData): Promise<Buffer> => {
  const ticketTypeLabel = data.ticketType === 'early_bird' ? 'Early Bird' : 'General';
  const ticketTypeColor = data.ticketType === 'early_bird' ? '#3B82F6' : '#8B5CF6';
  
  // Create a simpler but complete ticket design that renders properly in PDF
  const ticketHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Event Ticket</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body { 
        margin: 0; 
        padding: 0; 
        font-family: Arial, sans-serif; 
        background: #ffffff;
      }
      .ticket { 
        width: 1000px; 
        height: 280px; 
        background: #000000; 
        border: 3px solid #ffffff; 
        position: relative; 
        display: flex;
        overflow: hidden;
      }
      .left-section { 
        width: 700px; 
        padding: 30px; 
        border-right: 3px dashed #444; 
        background: #000000; 
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .right-section { 
        width: 300px; 
        padding: 30px; 
        text-align: center; 
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); 
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
      .v-curve-top {
        position: absolute; 
        top: -15px; 
        right: -15px; 
        left: 0; 
        height: 30px; 
        background: #000000;
        z-index: 10;
      }
      .v-curve-bottom {
        position: absolute; 
        bottom: -15px; 
        right: -15px; 
        left: 0; 
        height: 30px; 
        background: #000000;
        z-index: 10;
      }
      .v-curve-left {
        position: absolute; 
        left: -15px; 
        top: 10%; 
        bottom: 10%; 
        width: 30px; 
        background: #0a0a0a;
        z-index: 10;
      }
      .title-section {
        text-align: center;
        margin-bottom: 20px;
      }
      .title-section {
        margin-bottom: 30px; 
        text-align: center;
      }
      .event-title {
        margin: 0; 
        font-size: 24px; 
        font-weight: bold; 
        color: #C9A227; 
        text-transform: uppercase; 
        letter-spacing: 3px;
      }
      .ticket-type {
        margin: 8px 0 0 0; 
        font-size: 11px; 
        color: #aaa; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 1px;
      }
      .event-info {
        margin-bottom: 25px;
      }
      .event-datetime {
        margin: 0 0 8px 0; 
        font-size: 13px; 
        color: #fff; 
        font-weight: 600; 
        text-align: center;
      }
      .event-location {
        margin: 0 0 8px 0; 
        font-size: 12px; 
        color: #ccc; 
        text-align: center;
      }
      .ticket-details {
        margin-bottom: 25px;
      }
      .ticket-info-text {
        margin: 0 0 6px 0; 
        font-size: 11px; 
        color: #aaa; 
        text-transform: uppercase; 
        letter-spacing: 1px; 
        text-align: center;
      }
      .qr-section {
        margin-bottom: 30px;
      }
      .scan-label {
        margin: 0 0 15px 0; 
        font-size: 10px; 
        color: #aaa; 
        text-transform: uppercase; 
        letter-spacing: 2px;
      }
      .qr-code {
        width: 100px; 
        height: 100px; 
        margin: 0 auto; 
        border: 2px solid #444; 
        padding: 0px; 
        background-color: #fff; 
        display: flex; 
        align-items: center; 
        justify-content: center;
      }
      .reference-section {
        margin-bottom: 0;
        margin-top: 20px;
      }
      .reference-label {
        margin: 0 0 8px 0; 
        font-size: 10px; 
        color: #aaa; 
        text-transform: uppercase; 
        letter-spacing: 1px;
      }
      .reference-value {
        margin: 0; 
        font-size: 11px; 
        color: #ccc; 
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="left-section">
        <!-- Top V-Curve Cut Design -->
        <div class="v-curve-top">
          <svg width="100%" height="30" style="position: absolute; top: 0; left: 0;">
            <path d="M 0,15 Q 100,0 200,15 T 400,15 T 600,15" stroke="#444444" stroke-width="2" fill="none"/>
            <circle cx="100" cy="15" r="3" fill="#444444"/>
            <circle cx="200" cy="15" r="3" fill="#444444"/>
            <circle cx="300" cy="15" r="3" fill="#444444"/>
            <circle cx="400" cy="15" r="3" fill="#444444"/>
            <circle cx="500" cy="15" r="3" fill="#444444"/>
            <circle cx="600" cy="15" r="3" fill="#444444"/>
          </svg>
        </div>
        
        <!-- Event Title -->
        <div class="title-section">
          <h1 class="event-title">${data.eventTitle}</h1>
          <p class="ticket-type">ADMISSION TICKET</p>
        </div>

        <!-- Essential Event Information -->
        <div class="event-info">
          <p class="event-datetime">
            <strong>${data.eventDate}</strong> • 5:00 PM
          </p>
          <p class="event-location">
            Location will be emailed two weeks before the event
          </p>
        </div>

        <!-- Ticket Information -->
        <div class="ticket-details">
          <p class="ticket-info-text">
            <span style="color: ${ticketTypeColor}; font-weight: bold;">${ticketTypeLabel.toUpperCase()}</span> • ${data.quantity} TICKET${data.quantity > 1 ? 'S' : ''} • ${data.currency} ${data.totalAmount.toFixed(2)}
          </p>
        </div>

        <!-- Bottom V-Curve Cut Design -->
        <div class="v-curve-bottom">
          <svg width="100%" height="30" style="position: absolute; bottom: 0; left: 0;">
            <path d="M 0,15 Q 100,30 200,15 T 400,15 T 600,15" stroke="#444444" stroke-width="2" fill="none"/>
            <circle cx="100" cy="15" r="3" fill="#444444"/>
            <circle cx="200" cy="15" r="3" fill="#444444"/>
            <circle cx="300" cy="15" r="3" fill="#444444"/>
            <circle cx="400" cy="15" r="3" fill="#444444"/>
            <circle cx="500" cy="15" r="3" fill="#444444"/>
            <circle cx="600" cy="15" r="3" fill="#444444"/>
          </svg>
        </div>
      </div>
      
      <div class="right-section">
        <!-- Left V-Curve Perforation -->
        <div class="v-curve-left">
          <svg width="30" height="100%" style="position: absolute; top: 0; left: 0;">
            <path d="M 15,0 Q 0,30 15,60 T 15,120 T 15,180 T 15,240" stroke="#444444" stroke-width="2" fill="none" stroke-dasharray="4,2"/>
            <circle cx="15" cy="30" r="3" fill="#444444"/>
            <circle cx="15" cy="90" r="3" fill="#444444"/>
            <circle cx="15" cy="150" r="3" fill="#444444"/>
            <circle cx="15" cy="210" r="3" fill="#444444"/>
          </svg>
        </div>
        
        <!-- QR Code Section -->
        <div class="qr-section">
          <p class="scan-label">SCAN FOR ENTRY</p>
          <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data.ticketId)}" alt="QR Code" style="display: block; width: 100px; height: 100px;">
          </div>
        </div>

        
        <!-- Reference -->
        <div class="reference-section">
          <p class="reference-label">Reference</p>
          <p class="reference-value">${data.paymentReference}</p>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  try {
    // Use puppeteer to convert HTML to PDF with proper settings
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for proper rendering
    await page.setContent(ticketHTML, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 15000 
    });
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate PDF with exact ticket dimensions (1000x280px) and no margins
    const pdfBuffer = await page.pdf({
      width: '1000px',
      height: '280px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Puppeteer PDF generation failed, creating SVG fallback:', error);
    
    // Create SVG-based PDF as fallback with complete design
    const svgContent = `
    <svg width="1000" height="280" xmlns="http://www.w3.org/2000/svg">
      <!-- White outer border -->
      <rect width="1000" height="280" fill="#ffffff"/>
      <rect x="3" y="3" width="994" height="274" fill="#000000"/>
      
      <!-- Left section background -->
      <rect x="3" y="3" width="697" height="274" fill="#000000"/>
      
      <!-- Right section background with gradient -->
      <defs>
        <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="700" y="3" width="297" height="274" fill="url(#rightGradient)"/>
      
      <!-- V-cut divider -->
      <line x1="700" y1="3" x2="700" y2="277" stroke="#444444" stroke-width="3" stroke-dasharray="4,2"/>
      
      <!-- Top V-curve cut -->
      <path d="M 3,15 Q 103,3 203,15 T 403,15 T 603,15" stroke="#444444" stroke-width="2" fill="none"/>
      <circle cx="103" cy="15" r="3" fill="#444444"/>
      <circle cx="203" cy="15" r="3" fill="#444444"/>
      <circle cx="303" cy="15" r="3" fill="#444444"/>
      <circle cx="403" cy="15" r="3" fill="#444444"/>
      <circle cx="503" cy="15" r="3" fill="#444444"/>
      <circle cx="603" cy="15" r="3" fill="#444444"/>
      
      <!-- Bottom V-curve cut -->
      <path d="M 3,265 Q 103,277 203,265 T 403,265 T 603,265" stroke="#444444" stroke-width="2" fill="none"/>
      <circle cx="103" cy="265" r="3" fill="#444444"/>
      <circle cx="203" cy="265" r="3" fill="#444444"/>
      <circle cx="303" cy="265" r="3" fill="#444444"/>
      <circle cx="403" cy="265" r="3" fill="#444444"/>
      <circle cx="503" cy="265" r="3" fill="#444444"/>
      <circle cx="603" cy="265" r="3" fill="#444444"/>
      
      <!-- Left V-curve perforation -->
      <path d="M 700,30 Q 685,60 700,90 T 700,150 T 700,210 T 700,250" stroke="#444444" stroke-width="2" fill="none" stroke-dasharray="4,2"/>
      <circle cx="700" cy="60" r="3" fill="#444444"/>
      <circle cx="700" cy="120" r="3" fill="#444444"/>
      <circle cx="700" cy="180" r="3" fill="#444444"/>
      <circle cx="700" cy="240" r="3" fill="#444444"/>
      
      <!-- Event title -->
      <text x="350" y="60" font-family="Arial" font-size="24" font-weight="bold" fill="#C9A227" text-anchor="middle">
        ${data.eventTitle}
      </text>
      
      <!-- Admission ticket label -->
      <text x="350" y="75" font-family="Arial" font-size="11" fill="#aaaaaa" text-anchor="middle">
        ADMISSION TICKET
      </text>
      
      <!-- Event date and time -->
      <text x="350" y="120" font-family="Arial" font-size="13" font-weight="600" fill="#ffffff" text-anchor="middle">
        ${data.eventDate} • 5:00 PM
      </text>
      
      <!-- Event location -->
      <text x="350" y="138" font-family="Arial" font-size="12" fill="#cccccc" text-anchor="middle">
        Location will be emailed two weeks before the event
      </text>
      
      <!-- Ticket info -->
      <text x="350" y="165" font-family="Arial" font-size="11" fill="#aaaaaa" text-anchor="middle">
        <tspan fill="${ticketTypeColor}" font-weight="bold">${ticketTypeLabel.toUpperCase()}</tspan> • ${data.quantity} TICKET${data.quantity > 1 ? 'S' : ''} • ${data.currency} ${data.totalAmount.toFixed(2)}
      </text>
      
      <!-- QR code section -->
      <text x="850" y="50" font-family="Arial" font-size="10" fill="#aaaaaa" text-anchor="middle">
        SCAN FOR ENTRY
      </text>
      
      <!-- QR code placeholder -->
      <rect x="800" y="60" width="100" height="100" fill="#ffffff" stroke="#444444" stroke-width="2"/>
      <text x="850" y="115" font-family="Arial" font-size="10" fill="#000000" text-anchor="middle">
        QR CODE
      </text>
      
      <!-- Reference -->
      <text x="850" y="190" font-family="Arial" font-size="10" fill="#aaaaaa" text-anchor="middle">
        Reference
      </text>
      <text x="850" y="205" font-family="Arial" font-size="11" fill="#cccccc" text-anchor="middle">
        ${data.paymentReference}
      </text>
    </svg>`;
    
    // Convert SVG to proper PDF using a simple approach
    try {
      // Create a simple HTML wrapper for the SVG
      const svgHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; }
          svg { display: block; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>`;
      
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(svgHTML, { waitUntil: 'domcontentloaded' });
      
      const pdfBuffer = await page.pdf({
        width: '1000px',
        height: '280px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });
      
      await browser.close();
      return pdfBuffer;
    } catch (svgError) {
      console.error('❌ SVG to PDF conversion failed, creating basic PDF:', svgError);
      
      // Last resort: Create a proper minimal PDF
      const minimalPDF = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1000 280] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length 150 >>
stream
BT
/F1 16 Tf
50 200 Td
(${data.eventTitle}) Tj
/F1 12 Tf
0 -30 Td
(Ticket ID: ${data.ticketId}) Tj
0 -20 Td
(Reference: ${data.paymentReference}) Tj
0 -20 Td
(${data.customerName} - ${data.quantity} ${data.ticketType === 'early_bird' ? 'Early Bird' : 'General'} Ticket${data.quantity > 1 ? 's' : ''}) Tj
ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000254 00000 n 
0000000456 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
523
%%EOF`;
      
      return Buffer.from(minimalPDF);
    }
  }
};

export const sendTicketEmail = async (
  data: TicketEmailData,
  adminEmails: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    
    // Generate PDF ticket (now async)
    const pdfBuffer = await generateTicketPDF(data);

    // Send email to customer with PDF attachment
    const customerMailOptions = {
      from: `${process.env.SMTP_FROM || process.env.SMTP_USER}`,
      to: data.customerEmail,
      subject: `Your Ticket Confirmation - ${data.eventTitle}`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
    <h2 style="color: #000; margin-bottom: 20px; text-align: left;">Hello ${data.customerName},</h2>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        The attached document is your purchased ticket for <strong>${data.eventTitle}</strong>.
    </p>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        Your ticket is attached as a PDF file. Please download and save it. Bring it with you to the event.
    </p>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        <strong>Location:</strong> Will be communicated 2 weeks before the event
    </p>
    
    <p style="color: #000; margin-top: 30px; text-align: left;">
        Best regards,<br>
        <strong>The Orà duku Team</strong>
    </p>
</div>
      `,
      attachments: [
        {
          filename: `ticket-${data.ticketId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`✅ Ticket email with HTML design PDF sent to customer: ${data.customerEmail}`);

    // Send notification emails to admins
    for (const adminEmail of adminEmails) {
      if (adminEmail && adminEmail !== 'admin1@example.com' && adminEmail !== 'admin2@example.com' && adminEmail !== 'admin3@example.com') {
        const adminMailOptions = {
          from: `${process.env.SMTP_FROM || process.env.SMTP_USER}`,
          to: adminEmail,
          subject: `New Ticket Purchase - ${data.customerName}`,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        A new ticket has been purchased by <strong>${data.customerName}</strong> for <strong>${data.eventTitle}</strong>.
    </p>
    
    <div style="padding: 20px; margin: 20px 0;">
        <h3 style="color: #000; margin-top: 0; margin-bottom: 15px; text-align: left;">Purchase Details</h3>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Customer:</strong> ${data.customerName}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Email:</strong> ${data.customerEmail}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Phone:</strong> ${data.customerPhone}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Event:</strong> ${data.eventTitle}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Date:</strong> ${data.eventDate}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Ticket Type:</strong> ${data.ticketType === 'early_bird' ? 'Early Bird' : 'General'}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Quantity:</strong> ${data.quantity}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Total Amount:</strong> ${data.currency} ${data.totalAmount.toFixed(2)}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Payment Reference:</strong> ${data.paymentReference}</p>
    </div>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        The ticket PDF has been generated and sent to the customer. A copy is attached for your records.
    </p>
    
    <p style="color: #000; margin-top: 30px; text-align: left;">
        Best regards,<br>
        <strong>The Orà duku Team</strong>
    </p>
</div>
          `,
          attachments: [
            {
              filename: `ticket-${data.ticketId}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        };

        await transporter.sendMail(adminMailOptions);
        console.log(`✅ Admin notification with HTML design PDF sent to: ${adminEmail}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};

export const sendPaymentFailedEmail = async (
  customerEmail: string,
  customerName: string,
  eventTitle: string,
  reference: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          
          <tr>
            <td style="background-color: #DC2626; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #fff;">
                ❌ Payment Failed
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #ccc;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #ccc;">
                Unfortunately, your payment for <strong style="color: #C9A227;">${eventTitle}</strong> could not be processed.
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #888;">
                Reference: ${reference}
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #ccc;">
                Please try again or contact our support team if you continue to experience issues.
              </p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="display: inline-block; padding: 14px 28px; background-color: #C9A227; color: #0a0a0a; text-decoration: none; font-weight: 600; border-radius: 8px;">
                Try Again
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 25px 40px; background-color: #151515; text-align: center; border-top: 1px solid #333;">
              <p style="margin: 0; font-size: 12px; color: #555;">
                © ${new Date().getFullYear()} E-Tickets. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"E-Tickets" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `❌ Payment Failed - ${eventTitle}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Failed payment email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};
