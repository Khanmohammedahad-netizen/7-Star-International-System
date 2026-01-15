import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PdfDownloadOptions {
  type: 'quotation' | 'invoice' | 'ledger';
  id?: string;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  filename: string;
}

export function usePdfDownload() {
  const [isLoading, setIsLoading] = useState(false);

  const downloadPdf = async ({
    type,
    id,
    clientId,
    fromDate,
    toDate,
    filename,
  }: PdfDownloadOptions) => {
    setIsLoading(true);

    try {
      // Call the edge function to get the HTML from your exact templates
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          type,
          id,
          clientId,
          fromDate,
          toDate,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate PDF');
      }

      if (!data?.html) {
        throw new Error('No HTML content received');
      }

      // Open a new window with the HTML content for printing
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      
      if (!printWindow) {
        toast.error('Please allow popups to generate PDF');
        return;
      }

      // Write the HTML content with print-optimized styles
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { size: A4; margin: 18mm; }
            }
            @media screen {
              body { 
                display: flex; 
                justify-content: center; 
                background: #f0f0f0; 
                padding: 20px;
                margin: 0;
              }
              .print-container {
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.2);
                width: 210mm;
                min-height: 297mm;
                padding: 18mm;
                box-sizing: border-box;
              }
            }
            .print-actions {
              position: fixed;
              top: 20px;
              right: 20px;
              display: flex;
              gap: 10px;
              z-index: 1000;
            }
            .print-actions button {
              padding: 12px 24px;
              font-size: 14px;
              font-weight: 600;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.2s;
            }
            .print-btn {
              background: #22c55e;
              color: white;
            }
            .print-btn:hover {
              background: #16a34a;
            }
            .close-btn {
              background: #6b7280;
              color: white;
            }
            .close-btn:hover {
              background: #4b5563;
            }
            @media print {
              .print-actions { display: none !important; }
              .print-container { 
                box-shadow: none; 
                padding: 0; 
                width: 100%;
                min-height: auto;
              }
              body { 
                background: white; 
                padding: 0;
                display: block;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-actions">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="close-btn" onclick="window.close()">✕ Close</button>
          </div>
          <div class="print-container">
            ${data.html.replace(/<html[\s\S]*?<body[^>]*>/i, '').replace(/<\/body[\s\S]*?<\/html>/i, '')}
          </div>
          <script>
            // Auto-focus the window
            window.focus();
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();

      toast.success('Document ready - Click "Print / Save as PDF" to download');
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadPdf, isLoading };
}
