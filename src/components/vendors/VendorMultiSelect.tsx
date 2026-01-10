import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Vendor, VENDOR_TYPE_LABELS } from '@/types/database';

interface VendorMultiSelectProps {
  vendors: Vendor[] | undefined;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function VendorMultiSelect({
  vendors,
  selectedIds,
  onSelectionChange,
  placeholder = 'Select vendors...',
  disabled = false,
}: VendorMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedVendors = vendors?.filter((v) => selectedIds.includes(v.id)) || [];

  const toggleVendor = (vendorId: string) => {
    if (selectedIds.includes(vendorId)) {
      onSelectionChange(selectedIds.filter((id) => id !== vendorId));
    } else {
      onSelectionChange([...selectedIds, vendorId]);
    }
  };

  const removeVendor = (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedIds.filter((id) => id !== vendorId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
            disabled={disabled}
          >
            <span className="text-muted-foreground">
              {selectedIds.length === 0 ? placeholder : `${selectedIds.length} vendor(s) selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search vendors..." />
            <CommandList>
              <CommandEmpty>No vendors found.</CommandEmpty>
              <CommandGroup>
                {vendors?.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={`${vendor.vendor_name} ${VENDOR_TYPE_LABELS[vendor.vendor_type]}`}
                    onSelect={() => toggleVendor(vendor.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedIds.includes(vendor.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{vendor.vendor_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {VENDOR_TYPE_LABELS[vendor.vendor_type]}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected vendors badges */}
      {selectedVendors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedVendors.map((vendor) => (
            <Badge key={vendor.id} variant="secondary" className="gap-1">
              <Store className="h-3 w-3" />
              {vendor.vendor_name}
              <button
                type="button"
                onClick={(e) => removeVendor(vendor.id, e)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
