import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExportOptions {
  type: 'invoices' | 'payments' | 'accounts';
  fromDate?: string;
  toDate?: string;
  region?: string;
}

export function useExcelExport() {
  const [isLoading, setIsLoading] = useState(false);

  const exportToExcel = async ({ type, fromDate, toDate, region }: ExportOptions) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-excel', {
        body: { type, fromDate, toDate, region },
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', data.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Export downloaded successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { exportToExcel, isLoading };
}
