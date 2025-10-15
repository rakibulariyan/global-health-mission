// Enhanced PDF Generation Function
function generateMemberPDF(memberData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get current date for receipt
    const currentDate = new Date().toLocaleDateString();
    
    // PAGE 1: MEMBER CARD
    doc.setFillColor(44, 127, 184);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('🌍 Global Health Mission', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Healthcare Membership Card', 105, 28, { align: 'center' });
    
    // Card Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEMBER CARD', 105, 50, { align: 'center' });
    
    // Member Photo Placeholder with better styling
    doc.setDrawColor(100, 100, 100);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, 60, 45, 55, 3, 3, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text('MEMBER', 42.5, 85, { align: 'center' });
    doc.text('PHOTO', 42.5, 92, { align: 'center' });
    
    // Member Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let yPosition = 65;
    doc.text('Name:', 75, yPosition); yPosition += 7;
    doc.text('Member ID:', 75, yPosition); yPosition += 7;
    doc.text("Father's Name:", 75, yPosition); yPosition += 7;
    doc.text('Age:', 75, yPosition); yPosition += 7;
    doc.text('Valid Until:', 75, yPosition); yPosition += 7;
    doc.text('Phone:', 75, yPosition); yPosition += 7;
    doc.text('Issued By:', 75, yPosition);
    
    doc.setFont('helvetica', 'normal');
    yPosition = 65;
    doc.text(memberData.name, 110, yPosition); yPosition += 7;
    doc.text(memberData.memberId, 110, yPosition); yPosition += 7;
    doc.text(memberData.fatherName, 110, yPosition); yPosition += 7;
    doc.text(memberData.age.toString() + ' years', 110, yPosition); yPosition += 7;
    doc.text(memberData.expiryDate.toLocaleDateString(), 110, yPosition); yPosition += 7;
    doc.text(memberData.phone, 110, yPosition); yPosition += 7;
    doc.text(memberData.createdBy, 110, yPosition);
    
    // Barcode/QR Code Area with better styling
    doc.setDrawColor(100, 100, 100);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(150, 60, 45, 45, 3, 3, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('BARCODE', 172.5, 110, { align: 'center' });
    doc.text('AREA', 172.5, 115, { align: 'center' });
    
    // Draw simple barcode lines
    doc.setDrawColor(0, 0, 0);
    for (let i = 0; i < 20; i++) {
        const height = 5 + (i % 3);
        doc.line(155 + (i * 2), 70, 155 + (i * 2), 70 + height);
    }
    
    // Benefits Section with better styling
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 125, 190, 125);
    
    doc.setTextColor(40, 167, 69);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MEMBERSHIP BENEFITS:', 20, 135);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('✓ 50% discount at partner hospitals', 20, 142);
    doc.text('✓ Discounts at pharmacies & diagnostic centers', 20, 149);
    doc.text('✓ Emergency medical assistance', 20, 156);
    
    // Security Features
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Issued On: ${currentDate}`, 20, 170);
    doc.text('This card is non-transferable', 20, 177);
    doc.text('Report loss immediately', 20, 184);
    
    // PAGE 2: RECEIPT
    doc.addPage();
    
    // Receipt Header
    doc.setFillColor(44, 127, 184);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Global Health Mission', 105, 30, { align: 'center' });
    
    // Receipt Details Box
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    const receiptTop = 55;
    
    // Receipt Header Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, receiptTop, 180, 25, 3, 3, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Receipt No: ${memberData.memberId}-REC`, 25, receiptTop + 8);
    doc.text(`Date: ${currentDate}`, 25, receiptTop + 16);
    doc.text('Status: PAID', 150, receiptTop + 12);
    
    // Member Information Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Member Information:', 20, receiptTop + 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let infoY = receiptTop + 50;
    doc.text(`Full Name: ${memberData.name}`, 20, infoY); infoY += 7;
    doc.text(`Father's Name: ${memberData.fatherName}`, 20, infoY); infoY += 7;
    doc.text(`Age: ${memberData.age} years`, 20, infoY); infoY += 7;
    doc.text(`Member ID: ${memberData.memberId}`, 20, infoY); infoY += 7;
    doc.text(`Phone: ${memberData.phone}`, 20, infoY); infoY += 7;
    doc.text(`Email: ${memberData.email || 'Not provided'}`, 20, infoY); infoY += 7;
    doc.text(`Address: ${memberData.address || 'Not provided'}`, 20, infoY);
    
    // Payment Details Section
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', 20, receiptTop + 105);
    
    // Payment Table
    const tableTop = receiptTop + 115;
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, tableTop, 170, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Description', 25, tableTop + 6);
    doc.text('Amount', 160, tableTop + 6, { align: 'right' });
    
    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.text('Healthcare Membership Fee', 25, tableTop + 16);
    doc.text('₹300.00', 160, tableTop + 16, { align: 'right' });
    
    doc.text('Service Charges', 25, tableTop + 24);
    doc.text('₹0.00', 160, tableTop + 24, { align: 'right' });
    
    // Total Row
    doc.setDrawColor(0, 0, 0);
    doc.line(20, tableTop + 30, 190, tableTop + 30);
    
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT', 25, tableTop + 38);
    doc.text('₹300.00', 160, tableTop + 38, { align: 'right' });
    
    // Payment Status
    doc.setTextColor(40, 167, 69);
    doc.text('✓ PAYMENT SUCCESSFUL', 25, tableTop + 50);
    
    // Membership Period
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Membership Period: ${memberData.joinDate.toLocaleDateString()} to ${memberData.expiryDate.toLocaleDateString()}`, 25, tableTop + 65);
    
    // Issued By
    doc.text(`Issued By: ${memberData.createdBy}`, 25, tableTop + 75);
    
    // Terms and Conditions
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Terms & Conditions:', 20, tableTop + 90);
    doc.text('1. Membership is valid for 1 year from date of issue', 20, tableTop + 97);
    doc.text('2. Card must be presented at partner establishments', 20, tableTop + 104);
    doc.text('3. Membership is non-transferable and non-refundable', 20, tableTop + 111);
    
    // Footer
    doc.setFontSize(9);
    doc.text('Thank you for choosing Global Health Mission', 105, 280, { align: 'center' });
    doc.text('For support: contact@globalhealthmission.org | Phone: 1800-HEALTH', 105, 287, { align: 'center' });
    
    // Generate PDF filename
    const fileName = `GHM_Member_${memberData.memberId}_${currentDate.replace(/\//g, '-')}.pdf`;
    
    // Open PDF in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new tab
    const newWindow = window.open(pdfUrl, '_blank');
    
    // Auto-download option (uncomment if needed)
    // doc.save(fileName);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    
    // Focus on the new tab
    if (newWindow) {
        newWindow.focus();
    }
}
