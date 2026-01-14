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
      let endpoint = '';

      if (type === 'invoice') {
        endpoint = 'generate-invoice';
      } else if (type === 'quotation') {
        endpoint = 'generate-quotation';
      } else {
        toast.error('Ledger PDF not supported yet');
        return;
      }

      const response = await fetch(
        'https://7-star-pdf-service-production.up.railway.app/' + endpoint,
        {
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
        }
      );

      if (!response.ok) {
        throw new Error('Railway PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // ✅ OPEN REAL PDF (NO HTML, NO PRINT)
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
