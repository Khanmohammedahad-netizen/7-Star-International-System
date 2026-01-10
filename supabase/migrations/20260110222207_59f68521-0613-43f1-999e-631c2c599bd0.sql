-- Add columns to invoice_items table for hierarchical numbering
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS is_sub_item boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_serial_no integer DEFAULT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN public.invoice_items.is_sub_item IS 'Whether this is a sub-item (1.1, 1.2) under a main item';
COMMENT ON COLUMN public.invoice_items.parent_serial_no IS 'For sub-items, the serial number of the parent main item';