import PDFDocument from 'pdfkit';

// Helper for Number to Words (Indian Format)
function getWords(num) {
  var a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  var b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
}

function amountToWords(amount) {
  const parts = parseFloat(amount).toFixed(2).split('.');
  const rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);
  let str = "INR " + getWords(rupees);
  if (paise > 0) {
    str += " and " + getWords(paise) + " Paise";
  }
  str += " Only";
  return str.toUpperCase();
}

export const generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const teal = '#00CED1';
      const darkText = '#2C3E50';
      const lightText = '#7F8C8D';
      const lighterGrey = '#f8f9f9';
      const borderGrey = '#e5e8e8';

      // Top Title
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#1c2833').text('TAX INVOICE', 40, 40);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1c2833')
         .text('Invoice No: ', 40, 75, {continued: true})
         .font('Helvetica').fillColor(lightText).text(order._id.toString().substring(0, 12).toUpperCase(), {continued: true})
         .font('Helvetica-Bold').fillColor('#1c2833').text('  |  Date: ', {continued: true})
         .font('Helvetica').fillColor(lightText).text(new Date(order.createdAt).toLocaleDateString());
         
      doc.font('Helvetica-Bold').fillColor('#1c2833')
         .text('IRN: ', 40, 90, {continued: true})
         .font('Helvetica').fillColor(lightText).text('4ecf1455f213378bf6abe16a0db3dd8fd9e3dd8da59bed15e10d4c6f86eee4add3');
         
      // Right side Prepaid tag
      doc.rect(480, 40, 75, 18).fill('#e8f8f5');
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#27ae60').text(order.paymentMethod === 'cod' ? 'COD' : 'PREPAID', 480, 45, {width: 75, align: 'center'});
      
      doc.fontSize(9).font('Helvetica-Bold').fillColor(lightText).text('Ack No: ', 390, 65, {continued: true, align: 'right', width: 165}).font('Helvetica').text('1826231068881684');

      // Draw mock QR Code
      const qrX = 490;
      const qrY = 80;
      doc.rect(qrX, qrY, 65, 65).fill('#000000');
      doc.rect(qrX + 5, qrY + 5, 15, 15).fill('#ffffff');
      doc.rect(qrX + 45, qrY + 5, 15, 15).fill('#ffffff');
      doc.rect(qrX + 5, qrY + 45, 15, 15).fill('#ffffff');
      doc.rect(qrX + 25, qrY + 25, 15, 15).fill('#ffffff');
      doc.rect(qrX + 45, qrY + 45, 10, 10).fill('#ffffff');
      doc.rect(qrX + 25, qrY + 5, 10, 10).fill('#ffffff');

      // Teal horizontal line
      doc.moveTo(40, 160).lineTo(555, 160).lineWidth(3).strokeColor(teal).stroke();
      
      // Billed By and Billed To Boxes
      const boxY = 175;
      
      // Box 1 (Seller)
      doc.roundedRect(40, boxY, 250, 100, 5).lineWidth(1).strokeColor(borderGrey).stroke();
      doc.font('Helvetica-Bold').fontSize(10).fillColor(lightText).text('BILLED BY (SELLER)', 50, boxY + 10);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(teal).text('MaxGlow', 50, boxY + 30);
         
      // Box 2 (Buyer)
      doc.roundedRect(305, boxY, 250, 100, 5).lineWidth(1).strokeColor(borderGrey).stroke();
      doc.font('Helvetica-Bold').fontSize(10).fillColor(lightText).text('BILLED TO (BUYER)', 315, boxY + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1c2833').text(`${order.deliveryAddress?.name || user.name}`, 315, boxY + 28);
      doc.font('Helvetica').fontSize(9).fillColor('#1c2833')
         .text(`${order.deliveryAddress?.address || ''}`, 315, boxY + 45)
         .text(`${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} - ${order.deliveryAddress?.pincode || ''}`)
         .font('Helvetica-Bold').text('Phone: ', 315, boxY + 75, {continued:true}).font('Helvetica').text(`${order.deliveryAddress?.phone || user.phone}`)
         .font('Helvetica-Bold').text('Place of Supply: ', 315, boxY + 90, {continued:true}).font('Helvetica').text(`${order.deliveryAddress?.state || 'WEST BENGAL (19)'}`);

      // Items Table Header
      let currentY = 290;
      doc.rect(40, currentY, 515, 25).fill(lighterGrey);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(lightText)
         .text('#', 50, currentY + 8)
         .text('ITEM DESCRIPTION', 80, currentY + 8)
         .text('HSN/SAC', 280, currentY + 8)
         .text('QTY', 350, currentY + 8)
         .text('NET RATE (Rs.)', 410, currentY + 8)
         .text('AMOUNT (Rs.)', 480, currentY + 8);
         
      currentY += 35;
      
      let itemsSubtotal = 0;

      // Items
      order.items.forEach((item, index) => {
        const itemNetRate = item.price; 
        const netAmount = itemNetRate * item.quantity;
        
        itemsSubtotal += netAmount;

        doc.font('Helvetica').fontSize(14).fillColor(lightText).text(index + 1, 50, currentY);
        
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#1c2833').text(item.name || 'Product', 80, currentY, {width: 190});
        
        doc.font('Helvetica').fontSize(12).fillColor('#1c2833').text('08013220', 280, currentY);
        doc.text(item.quantity.toString(), 350, currentY);
        
        doc.text(itemNetRate.toFixed(2), 410, currentY);
        
        doc.font('Helvetica-Bold').text(netAmount.toFixed(2), 480, currentY);
        
        currentY += 25;
        doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(0.5).strokeColor(borderGrey).stroke();
        currentY += 10;
      });

      // Bottom Lines
      doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(1).strokeColor(borderGrey).stroke();
      currentY += 5;
      doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(2).strokeColor(borderGrey).stroke();
      
      currentY += 20;

      const totalNum = order.totalAmount || itemsSubtotal;
      
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1c2833').text('Amount in Words: ', 40, currentY, {continued: true})
         .font('Helvetica').fillColor(lightText).text(amountToWords(totalNum.toFixed(2)));

      // Grand Total Box
      const gtBoxY = currentY - 10;
      doc.roundedRect(320, gtBoxY, 235, 95, 5).fillAndStroke('#fdfdfd', borderGrey);
      
      doc.font('Helvetica').fontSize(10).fillColor('#1c2833')
         .text(`Subtotal: Rs. ${itemsSubtotal.toFixed(2)}`, 330, gtBoxY + 15);
         
      if (order.couponDiscount && order.couponDiscount > 0) {
        doc.text(`Discount: - Rs. ${order.couponDiscount.toFixed(2)}`, 330, gtBoxY + 30);
      }
      
      const shipping = order.shippingFee || 0;
      doc.text(`Shipping: Rs. ${shipping.toFixed(2)}`, 330, gtBoxY + 45);
         
      doc.moveTo(330, gtBoxY + 60).lineTo(545, gtBoxY + 60).dash(3, {space: 2}).strokeColor('#bdc3c7').stroke();
      doc.undash();
      
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#1c2833').text('Grand Total:', 330, gtBoxY + 70, {continued: true})
         .fillColor(teal).text(`Rs. ${totalNum.toFixed(2)}`);
         
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1c2833').text(amountToWords(totalNum.toFixed(2)), 330, gtBoxY + 85, {width: 215, align: 'right'});

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
