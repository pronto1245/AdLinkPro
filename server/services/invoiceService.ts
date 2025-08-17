import fs from 'fs';
import path from 'path';

// Simple invoice PDF generation service
// In a production environment, you would use a proper PDF library like puppeteer, PDFKit, or jsPDF

export interface InvoiceData {
  invoiceNumber: string;
  advertiserId: string;
  partnerId: string;
  amount: string;
  currency: string;
  vatRate?: string;
  vatAmount?: string;
  totalAmount: string;
  description?: string;
  invoiceDate: Date;
  dueDate?: Date;
  partnerInfo: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  };
  advertiserInfo: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  };
}

export class InvoiceService {
  private static readonly invoiceDir = path.join(process.cwd(), 'public', 'invoices');

  static async ensureInvoiceDirectory(): Promise<void> {
    if (!fs.existsSync(this.invoiceDir)) {
      fs.mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  static async generateInvoiceHTML(data: InvoiceData): Promise<string> {
    const { 
      invoiceNumber, 
      amount, 
      currency, 
      totalAmount, 
      description, 
      invoiceDate, 
      dueDate,
      partnerInfo,
      advertiserInfo,
      vatRate,
      vatAmount 
    } = data;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                margin: 0;
                padding: 40px;
                color: #333;
                line-height: 1.6;
            }
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
            }
            .invoice-title {
                font-size: 28px;
                font-weight: 700;
                color: #2563eb;
                margin: 0;
            }
            .invoice-number {
                font-size: 16px;
                color: #666;
                margin: 5px 0 0 0;
            }
            .company-info {
                text-align: right;
            }
            .company-name {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            .company-tagline {
                color: #666;
                font-size: 14px;
                margin: 5px 0 0 0;
            }
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
            }
            .detail-section h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 15px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .detail-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 6px;
                border-left: 4px solid #2563eb;
            }
            .detail-info p {
                margin: 5px 0;
                font-size: 14px;
            }
            .detail-info strong {
                color: #1f2937;
            }
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .invoice-table th {
                background: #2563eb;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .invoice-table td {
                padding: 15px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
            }
            .invoice-table tr:last-child td {
                border-bottom: none;
            }
            .amount-cell {
                text-align: right;
                font-weight: 600;
                color: #1f2937;
            }
            .total-section {
                margin-left: auto;
                width: 300px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .total-row:last-child {
                border-bottom: 2px solid #2563eb;
                font-weight: 700;
                font-size: 18px;
                color: #2563eb;
            }
            .invoice-footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
            .status-badge {
                display: inline-block;
                padding: 6px 12px;
                background: #fbbf24;
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .payment-info {
                background: #eff6ff;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #dbeafe;
                margin-top: 30px;
            }
            .payment-info h4 {
                color: #2563eb;
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            .payment-info p {
                margin: 5px 0;
                font-size: 14px;
                color: #1e40af;
            }
            @media print {
                body { 
                    padding: 20px; 
                }
                .invoice-container {
                    box-shadow: none;
                    border: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
                <div>
                    <h1 class="invoice-title">INVOICE</h1>
                    <p class="invoice-number">#${invoiceNumber}</p>
                    <span class="status-badge">Payment Pending</span>
                </div>
                <div class="company-info">
                    <h2 class="company-name">AdLinkPro</h2>
                    <p class="company-tagline">Performance Marketing Platform</p>
                </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
                <div class="detail-section">
                    <h3>Bill To</h3>
                    <div class="detail-info">
                        <p><strong>Partner:</strong> ${partnerInfo.username}</p>
                        <p><strong>Email:</strong> ${partnerInfo.email}</p>
                        ${partnerInfo.firstName || partnerInfo.lastName ? 
                          `<p><strong>Name:</strong> ${[partnerInfo.firstName, partnerInfo.lastName].filter(Boolean).join(' ')}</p>` : ''}
                        ${partnerInfo.company ? `<p><strong>Company:</strong> ${partnerInfo.company}</p>` : ''}
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Invoice Details</h3>
                    <div class="detail-info">
                        <p><strong>Invoice Date:</strong> ${invoiceDate.toLocaleDateString()}</p>
                        ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>` : ''}
                        <p><strong>Currency:</strong> ${currency}</p>
                        <p><strong>Advertiser:</strong> ${advertiserInfo.username}</p>
                    </div>
                </div>
            </div>

            <!-- Invoice Items -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th class="amount-cell">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${description || 'Partner Commission Payout'}</td>
                        <td class="amount-cell">${amount}</td>
                        <td>${currency}</td>
                        <td class="amount-cell">${amount} ${currency}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Totals -->
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${amount} ${currency}</span>
                </div>
                ${vatRate && vatAmount ? `
                <div class="total-row">
                    <span>VAT (${vatRate}%):</span>
                    <span>${vatAmount} ${currency}</span>
                </div>
                ` : ''}
                <div class="total-row">
                    <span>Total Amount:</span>
                    <span>${totalAmount} ${currency}</span>
                </div>
            </div>

            <!-- Payment Information -->
            <div class="payment-info">
                <h4>Payment Information</h4>
                <p>This invoice will be processed according to your payout request settings.</p>
                <p>Payment method: As specified in your payout request</p>
                <p>Processing time: 1-5 business days depending on payment method</p>
            </div>

            <!-- Footer -->
            <div class="invoice-footer">
                <p>This invoice was generated automatically by AdLinkPro platform.</p>
                <p>For questions regarding this invoice, please contact support.</p>
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return html;
  }

  static async generateInvoiceFile(data: InvoiceData): Promise<string> {
    await this.ensureInvoiceDirectory();
    
    const html = await this.generateInvoiceHTML(data);
    const filename = `invoice-${data.invoiceNumber}.html`;
    const filePath = path.join(this.invoiceDir, filename);

    await fs.promises.writeFile(filePath, html, 'utf8');

    return `/invoices/${filename}`;
  }

  static async generateInvoicePDF(data: InvoiceData): Promise<string> {
    // In a production environment, you would use puppeteer to generate PDF:
    // 
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // const html = await this.generateInvoiceHTML(data);
    // await page.setContent(html);
    // const pdf = await page.pdf({ format: 'A4', printBackground: true });
    // await browser.close();
    // 
    // const filename = `invoice-${data.invoiceNumber}.pdf`;
    // const filePath = path.join(this.invoiceDir, filename);
    // await fs.promises.writeFile(filePath, pdf);
    // return `/invoices/${filename}`;

    // For now, we'll generate HTML and return the path
    return await this.generateInvoiceFile(data);
  }

  static async emailInvoice(data: InvoiceData, invoiceUrl: string): Promise<boolean> {
    // In a production environment, integrate with email service (SendGrid, etc.)
    console.log(`Would send invoice ${data.invoiceNumber} to ${data.partnerInfo.email}`);
    console.log(`Invoice URL: ${invoiceUrl}`);
    
    // Mock successful email sending
    return true;
  }
}

// Utility function to format currency amounts
export function formatCurrency(amount: string | number, currency: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currency === 'USD' || currency === 'EUR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num);
  }
  
  // For crypto currencies
  return `${num.toFixed(8)} ${currency}`;
}

export default InvoiceService;