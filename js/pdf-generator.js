// PDF Generation Function
function generateMemberPDF(memberData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get current date for receipt
    const currentDate = new Date().toLocaleDateString();
    
    // PAGE 1: MEMBER CARD
    doc.setFillColor(44, 127, 184);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('🌍 Global Health Mission', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Healthcare Membership Card', 105, 22, { align: 'center' });
    
    // Card Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEMBER CARD', 105, 40, { align: 'center' });
    
    // Member Photo Placeholder
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 50, 40, 50);
    doc.setFontSize(8);
    doc.text('Photo', 40, 85, { align: 'center' });
    
    // Member Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let yPosition = 55;
    doc.text('Member Name:', 70, yPosition); yPosition += 7;
    doc.text('Member ID:', 70, yPosition); yPosition += 7;
    doc.text("Father's Name:", 70, yPosition); yPosition += 7;
    doc.text('Age:', 70, yPosition); yPosition += 7;
    doc.text('Valid Until:', 70, yPosition); yPosition += 7;
    doc.text('Phone:', 70, yPosition); yPosition += 7;
    doc.text('Issued By:', 70, yPosition);
    
    doc.setFont('helvetica', 'normal');
    yPosition = 55;
    doc.text(memberData.name, 110, yPosition); yPosition += 7;
    doc.text(memberData.memberId, 110, yPosition); yPosition += 7;
    doc.text(memberData.fatherName, 110, yPosition); yPosition += 7;
    doc.text(memberData.age.toString(), 110, yPosition); yPosition += 7;
    doc.text(memberData.expiryDate.toLocaleDateString(), 110, yPosition); yPosition += 7;
    doc.text(memberData.phone, 110, yPosition); yPosition += 7;
    doc.text(memberData.createdBy, 110, yPosition);
    
    // QR Code Area
    doc.rect(150, 50, 40, 40);
    doc.setFontSize(8);
    doc.text('QR Code', 170, 95, { align: 'center' });
    
    // Benefits Section
    doc.setFontSize(9);
    doc.text('✓ Eligible for 50% discount at partner hospitals', 20, 110);
    doc.text('✓ Valid at pharmacies & diagnostic centers', 20, 117);
    doc.text('✓ Non-transferable • Report loss immediately', 20, 124);
    
    // Security Features
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Issue Date: ${currentDate}`, 20, 135);
    
    // PAGE 2: RECEIPT
    doc.addPage();
    
    // Receipt Header
    doc.setFillColor(44, 127, 184);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 105, 15, { align: 'center' });
    
    // Receipt Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    const receiptTop = 50;
    doc.text(`Receipt No: ${memberData.memberId}-REC`, 20, receiptTop);
    doc.text(`Date: ${currentDate}`, 20, receiptTop + 8);
    doc.text('', 20, receiptTop + 16); // Empty line
    
    // Member Information
    doc.setFont('helvetica', 'bold');
    doc.text('Member Information:', 20, receiptTop + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${memberData.name}`, 20, receiptTop + 35);
    doc.text(`Father's Name: ${memberData.fatherName}`, 20, receiptTop + 43);
    doc.text(`Age: ${memberData.age}`, 20, receiptTop + 51);
    doc.text(`Member ID: ${memberData.memberId}`, 20, receiptTop + 59);
    doc.text(`Phone: ${memberData.phone}`, 20, receiptTop + 67);
    doc.text(`Email: ${memberData.email || 'N/A'}`, 20, receiptTop + 75);
    doc.text(`Address: ${memberData.address || 'N/A'}`, 20, receiptTop + 83);
    
    // Payment Details
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', 20, receiptTop + 100);
    doc.setFont('helvetica', 'normal');
    
    const paymentTop = receiptTop + 110;
    doc.text('Description', 20, paymentTop);
    doc.text('Amount', 150, paymentTop);
    
    doc.text('Membership Joining Fee', 20, paymentTop + 8);
    doc.text('₹300.00', 150, paymentTop + 8);
    
    doc.text('Service Tax', 20, paymentTop + 16);
    doc.text('₹0.00', 150, paymentTop + 16);
    
    // Total
    doc.setDrawColor(0, 0, 0);
    doc.line(20, paymentTop + 24, 190, paymentTop + 24);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount', 20, paymentTop + 32);
    doc.text('₹300.00', 150, paymentTop + 32);
    
    // Payment Status
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text('Payment Status: PAID', 20, paymentTop + 50);
    
    // Validity Period
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Membership Valid From: ${memberData.joinDate.toLocaleDateString()}`, 20, paymentTop + 65);
    doc.text(`Membership Valid Until: ${memberData.expiryDate.toLocaleDateString()}`, 20, paymentTop + 73);
    
    // Issued By
    doc.text(`Issued By: ${memberData.createdBy}`, 20, paymentTop + 85);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Global Health Mission', 105, 280, { align: 'center' });
    doc.text('This is a computer generated receipt', 105, 285, { align: 'center' });
    
    // Open PDF in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
}
