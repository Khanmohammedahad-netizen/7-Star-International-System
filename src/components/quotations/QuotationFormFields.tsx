import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientCombobox } from '@/components/ClientCombobox';
import { Client } from '@/hooks/useClients';
import { getCurrencyCode } from '@/lib/currency';

interface QuotationItem {
  serial_no: number;
  description: string;
  size: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface QuotationFormData {
  quotation_number: string;
  client_id: string;
  quotation_date: string;
  element: string;
  notes: string;
  region: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

interface QuotationFormFieldsProps {
  formData: QuotationFormData;
  onFieldChange: (field: keyof QuotationFormData, value: string) => void;
  clients: Client[] | undefined;
  isSuperAdmin: boolean;
  items: QuotationItem[];
  onItemChange: (index: number, field: keyof QuotationItem, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  totals: { netAmount: number; vatAmount: number; totalAmount: number };
}

export function QuotationFormFields({
  formData,
  onFieldChange,
  clients,
  isSuperAdmin,
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  totals,
}: QuotationFormFieldsProps) {
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quotation Number *</Label>
          <Input
            value={formData.quotation_number}
            onChange={(e) => onFieldChange('quotation_number', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Client *</Label>
          <ClientCombobox
            clients={clients}
            value={formData.client_id}
            onValueChange={(value) => onFieldChange('client_id', value)}
            placeholder="Search or select client..."
          />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={formData.quotation_date}
            onChange={(e) => onFieldChange('quotation_date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Element</Label>
          <Input
            value={formData.element}
            onChange={(e) => onFieldChange('element', e.target.value)}
          />
        </div>
        {isSuperAdmin && (
          <div className="space-y-2">
            <Label>Region</Label>
            <Select
              value={formData.region}
              onValueChange={(value) => onFieldChange('region', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UAE">UAE</SelectItem>
                <SelectItem value="SAUDI">Saudi Arabia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => onFieldChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
        
        {/* Mobile-friendly line items */}
        <div className="space-y-4 sm:hidden">
          {items.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Item #{item.serial_no}</span>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  value={item.description}
                  onChange={(e) => onItemChange(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={item.size}
                    onChange={(e) => onItemChange(index, 'size', e.target.value)}
                    placeholder="Size"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    min={1}
                    placeholder="Qty"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => onItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    min={0}
                    step="0.01"
                    placeholder="Rate"
                  />
                  <div className="flex items-center justify-end font-medium">
                    Amount: {item.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S.No</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead className="w-[80px]">Qty</TableHead>
                <TableHead className="w-[100px]">Rate</TableHead>
                <TableHead className="w-[100px]">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.serial_no}</TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => onItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.size}
                      onChange={(e) => onItemChange(index, 'size', e.target.value)}
                      placeholder="Size"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => onItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-right space-y-1">
          <div>Net Amount: <span className="font-medium">{totals.netAmount.toFixed(2)} {getCurrencyCode(formData.region)}</span></div>
          <div>VAT (5%): <span className="font-medium">{totals.vatAmount.toFixed(2)} {getCurrencyCode(formData.region)}</span></div>
          <div className="text-lg">Total: <span className="font-bold">{totals.totalAmount.toFixed(2)} {getCurrencyCode(formData.region)}</span></div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
