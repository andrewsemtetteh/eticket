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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #C9A227 0%, #E8C547 50%, #C9A227 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0a0a0a; letter-spacing: 1px;">
                🎫 E-TICKETS
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
                ${isAdmin ? 'New Ticket Purchase Notification' : 'Your Ticket Confirmation'}
              </p>
            </td>
          </tr>

          <!-- Event Banner -->
          <tr>
            <td style="padding: 30px 40px; background-color: #252525; border-bottom: 1px solid #333;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #C9A227;">
                ${data.eventTitle}
              </h2>
              <p style="margin: 0; font-size: 16px; color: #888;">
                📅 ${data.eventDate} at ${data.eventTime}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
                📍 ${data.venueName}, ${data.venueAddress}
              </p>
            </td>
          </tr>

          <!-- Ticket Details -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px; background-color: #252525; border-radius: 12px; border-left: 4px solid ${ticketTypeColor};">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding-bottom: 15px; border-bottom: 1px dashed #444;">
                          <span style="display: inline-block; padding: 6px 16px; background-color: ${ticketTypeColor}20; color: ${ticketTypeColor}; font-size: 12px; font-weight: 600; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                            ${ticketTypeLabel} Ticket
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 15px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 50%; padding: 8px 0;">
                                <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Ticket ID</p>
                                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #C9A227;">${data.ticketId}</p>
                              </td>
                              <td style="width: 50%; padding: 8px 0;">
                                <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Quantity</p>
                                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #fff;">${data.quantity}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="width: 50%; padding: 8px 0;">
                                <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</p>
                                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #22C55E;">${data.currency} ${data.totalAmount.toFixed(2)}</p>
                              </td>
                              <td style="width: 50%; padding: 8px 0;">
                                <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Reference</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 500; color: #888;">${data.paymentReference}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                ${isAdmin ? 'Customer Details' : 'Your Details'}
              </h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #252525; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #333;">
                    <p style="margin: 0; font-size: 12px; color: #666;">Name</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #fff;">${data.customerName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #333;">
                    <p style="margin: 0; font-size: 12px; color: #666;">Email</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #fff;">${data.customerEmail}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">Phone</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #fff;">${data.customerPhone || 'Not provided'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code Section (for customer only) -->
          ${!isAdmin ? `
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <div style="background-color: #252525; border-radius: 12px; padding: 25px; display: inline-block;">
                <p style="margin: 0 0 15px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                  Present this ticket at the venue
                </p>
                <div style="background-color: #fff; padding: 15px; border-radius: 8px; display: inline-block;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.ticketId)}" alt="QR Code" style="display: block; width: 150px; height: 150px;">
                </div>
                <p style="margin: 15px 0 0 0; font-size: 14px; font-weight: 600; color: #C9A227;">
                  ${data.ticketId}
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Important Notes -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #1E3A5F; border-radius: 12px; padding: 20px; border-left: 4px solid #3B82F6;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #60A5FA;">
                  📋 Important Information
                </h4>
                <ul style="margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #93C5FD; line-height: 1.8;">
                  <li>Please arrive at least 30 minutes before the event starts</li>
                  <li>Present this email or QR code at the entrance</li>
                  <li>This ticket is non-refundable and non-transferable</li>
                  <li>For inquiries, contact us at support@etickets.com</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background-color: #151515; text-align: center; border-top: 1px solid #333;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">
                Purchase Date: ${data.purchaseDate}
              </p>
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
};

export const sendTicketEmail = async (
  data: TicketEmailData,
  adminEmails: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();

    // Send email to customer
    const customerMailOptions = {
      from: `"E-Tickets" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `🎫 Your Ticket Confirmation - ${data.eventTitle}`,
      html: generateTicketHTML(data, false),
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`✅ Ticket email sent to customer: ${data.customerEmail}`);

    // Send notification emails to admins
    for (const adminEmail of adminEmails) {
      if (adminEmail && adminEmail !== 'admin1@example.com' && adminEmail !== 'admin2@example.com' && adminEmail !== 'admin3@example.com') {
        const adminMailOptions = {
          from: `"E-Tickets System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `🎟️ New Ticket Purchase - ${data.customerName}`,
          html: generateTicketHTML(data, true),
        };

        await transporter.sendMail(adminMailOptions);
        console.log(`✅ Admin notification sent to: ${adminEmail}`);
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
