import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export content to PDF
 */
export const exportToPDF = (content, title = 'content') => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString(), 20, 30);
    
    // Add content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 45);
    
    // Save
    doc.save(`${sanitizeFilename(title)}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Export PDF Error:', error);
    throw new Error('Failed to export PDF');
  }
};

/**
 * Export content to DOCX
 */
export const exportToDOCX = async (content, title = 'content') => {
  try {
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32,
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: new Date().toLocaleDateString(),
                size: 20,
                color: '666666',
              }),
            ],
            spacing: {
              after: 400,
            },
          }),
          // Content - split by paragraphs
          ...content.split('\n\n').map(para => 
            new Paragraph({
              children: [
                new TextRun({
                  text: para,
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          ),
        ],
      }],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFilename(title)}.docx`);
    
    return true;
  } catch (error) {
    console.error('Export DOCX Error:', error);
    throw new Error('Failed to export DOCX');
  }
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
};