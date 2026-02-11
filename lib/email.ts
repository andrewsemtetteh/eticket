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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: transparent; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Premium Ticket Design -->
        <table role="presentation" style="width: 100%; max-width: 500px; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); border: 1px solid #333; position: relative;">
          
          <!-- Ticket Header with Perforated Edge -->
          <tr>
            <td style="background: linear-gradient(135deg, #C9A227 0%, #E8C547 50%, #C9A227 100%); padding: 25px 30px; text-align: center; position: relative;">
              <!-- Perforated edge effect -->
              <div style="position: absolute; bottom: -8px; left: 0; right: 0; height: 16px; background-image: radial-gradient(circle at 8px 8px, transparent 4px, #C9A227 4px); background-size: 16px 16px;"></div>
              
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0a0a0a; letter-spacing: 2px; text-transform: uppercase;">
                ADMIT ONE
              </h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #1a1a1a; font-weight: 600; letter-spacing: 1px;">
                ${isAdmin ? 'NEW PURCHASE ALERT' : 'TICKET CONFIRMATION'}
              </p>
            </td>
          </tr>

          <!-- Main Ticket Body -->
          <tr>
            <td style="padding: 25px 30px; background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); position: relative;">
              <!-- Ticket stub perforation -->
              <div style="position: absolute; right: -8px; top: 20%; bottom: 20%; width: 16px; background-image: radial-gradient(circle at 8px 8px, transparent 4px, #1a1a1a 4px); background-size: 16px 16px;"></div>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Main ticket info -->
                  <td style="width: 70%; padding-right: 20px; border-right: 2px dashed #444;">
                    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #C9A227; text-transform: uppercase; letter-spacing: 1px;">
                      ${data.eventTitle}
                    </h2>
                    
                    <div style="margin: 15px 0; padding: 12px 0; border-top: 1px solid #333; border-bottom: 1px solid #333;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #fff; font-weight: 600;">
                        📅 ${data.eventDate} • ${data.eventTime}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #888;">
                        📍 Location details sent via email
                      </p>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                      <div style="flex: 1; margin-right: 15px;">
                        <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">TICKET TYPE</p>
                        <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: ${ticketTypeColor}; text-transform: uppercase;">${ticketTypeLabel}</p>
                      </div>
                      <div style="flex: 1; margin-right: 15px;">
                        <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">QTY</p>
                        <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #fff;">${data.quantity}</p>
                      </div>
                      <div style="flex: 1;">
                        <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">TOTAL</p>
                        <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #22C55E;">${data.currency} ${data.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Ticket stub -->
                  <td style="width: 30%; padding-left: 20px; text-align: center;">
                    <div style="transform: rotate(-90deg); white-space: nowrap;">
                      <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px;">TICKET ID</p>
                      <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #C9A227; letter-spacing: 1px;">${data.ticketId}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 8px; background-color: #333; border-radius: 8px;">
                      <p style="margin: 0; font-size: 10px; color: #888; text-transform: uppercase;">REF</p>
                      <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 500; color: #fff; word-break: break-all;">${data.paymentReference}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #1a1a1a; border-top: 1px dashed #444;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; padding-right: 15px;">
                    <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">HOLDER</p>
                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #fff;">${data.customerName}</p>
                  </td>
                  <td style="width: 50%; padding-left: 15px;">
                    <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">EMAIL</p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 500; color: #888; word-break: break-all;">${data.customerEmail}</p>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                  Present this ticket at the venue entrance
                </p>
              </div>
            </td>
          </tr>
          <!-- QR Code Section (for customer only) -->
          ${!isAdmin ? `
          <tr>
            <td style="padding: 25px 30px; background-color: #0a0a0a; text-align: center; border-top: 2px dashed #444;">
              <p style="margin: 0 0 15px 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 2px;">
                SCAN AT ENTRANCE
              </p>
              <div style="background-color: #fff; padding: 12px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data.ticketId)}" alt="QR Code" style="display: block; width: 120px; height: 120px;">
              </div>
              <p style="margin: 12px 0 0 0; font-size: 12px; font-weight: 600; color: #C9A227; letter-spacing: 1px;">
                ${data.ticketId}
              </p>
            </td>
          </tr>
          ` : ''}

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
