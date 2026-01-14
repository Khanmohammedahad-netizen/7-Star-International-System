import { useState } from 'react';
import { toast } from 'sonner';

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
      let apiUrl = '';

      if (type === 'invoice') {
        apiUrl = '/api/pdf/invoice';
      } else if (type === 'quotation') {
        apiUrl = '/api/pdf/quotation';
      } else {
        toast.error('Ledger PDF not supported yet');
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          clientId,
          fromDate,
          toDate,
        }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // ✅ Opens REAL PDF (no CORS, no HTML, no print)
      window.open(url, '_blank');

      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadPdf, isLoading };
}
