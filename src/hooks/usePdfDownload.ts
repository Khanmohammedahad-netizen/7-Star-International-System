import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const downloadPdf = async ({ type, id, clientId, fromDate, toDate, filename }: PdfDownloadOptions) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { type, id, clientId, fromDate, toDate },
      });

      if (error) throw error;

      // Create a printable window with the HTML
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download PDF');
        return;
      }

      printWindow.document.write(data.html);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };

      toast.success('PDF ready for download');
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadPdf, isLoading };
}
