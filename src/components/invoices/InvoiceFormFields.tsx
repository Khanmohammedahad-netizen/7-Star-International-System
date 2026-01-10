import { Trash2, Plus, CornerDownRight } from 'lucide-react';
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

export interface InvoiceItem {
  serial_no: number;
  description: string;
  size: string;
  quantity: number;
  rate: number;
  amount: number;
  is_sub_item: boolean;
  parent_serial_no: number | null;
}

interface InvoiceFormData {
  invoice_number: string;
  client_id: string;
  invoice_date: string;
  notes: string;
  region: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

interface InvoiceFormFieldsProps {
  formData: InvoiceFormData;
  onFieldChange: (field: keyof InvoiceFormData, value: string) => void;
  clients: Client[] | undefined;
  isSuperAdmin: boolean;
  isEditing: boolean;
  isGeneratingNumber: boolean;
  onGenerateNumber: () => void;
  items: InvoiceItem[];
  onItemChange: (index: number, field: keyof InvoiceItem, value: any) => void;
  onAddItem: () => void;
  onAddSubItem: (parentIndex: number) => void;
  onRemoveItem: (index: number) => void;
  totals: { netAmount: number; vatAmount: number; totalAmount: number };
  getDisplaySerialNo: (item: InvoiceItem, index: number) => string;
}

export function InvoiceFormFields({
  formData,
  onFieldChange,
  clients,
  isSuperAdmin,
  isEditing,
  isGeneratingNumber,
  onGenerateNumber,
  items,
  onItemChange,
  onAddItem,
  onAddSubItem,
  onRemoveItem,
  totals,
  getDisplaySerialNo,
}: InvoiceFormFieldsProps) {
  // Helper to check if an item can have sub-items (only main items)
  const canHaveSubItems = (item: InvoiceItem) => !item.is_sub_item;
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Invoice Number *</Label>
          <div className="flex gap-2">
            <Input
              value={formData.invoice_number}
              onChange={(e) => onFieldChange('invoice_number', e.target.value)}
              required
            />
            {!isEditing && (
              <Button type="button" variant="outline" onClick={onGenerateNumber} disabled={isGeneratingNumber}>
                {isGeneratingNumber ? '...' : 'Auto'}
              </Button>
            )}
          </div>
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
            value={formData.invoice_date}
            onChange={(e) => onFieldChange('invoice_date', e.target.value)}
            required
          />
        </div>
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
            <Card key={index} className={`p-3 ${item.is_sub_item ? 'ml-4 border-l-2 border-primary/30' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {item.is_sub_item && <CornerDownRight className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                  Item #{getDisplaySerialNo(item, index)}
                </span>
                <div className="flex gap-1">
                  {canHaveSubItems(item) && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => onAddSubItem(index)} title="Add Sub-Item">
                      <CornerDownRight className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={item.description}
                  onChange={(e) => onItemChange(index, 'description', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Description (Shift+Enter for new line)"
                  rows={2}
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
                <TableRow key={index} className={item.is_sub_item ? 'bg-muted/30' : ''}>
                  <TableCell className={item.is_sub_item ? 'pl-6' : ''}>
                    {item.is_sub_item && <CornerDownRight className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                    {getDisplaySerialNo(item, index)}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={item.description}
                      onChange={(e) => onItemChange(index, 'description', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Description (Shift+Enter for new line)"
                      rows={2}
                      className="min-h-[60px]"
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
                    <div className="flex gap-1">
                      {canHaveSubItems(item) && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => onAddSubItem(index)} title="Add Sub-Item">
                          <CornerDownRight className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
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
