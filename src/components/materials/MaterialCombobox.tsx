import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Material {
  id: string;
  name: string;
  size?: string | null;
  unit_price?: number | null;
  description?: string | null;
}

interface MaterialComboboxProps {
  materials: Material[] | undefined;
  value: string;
  onValueChange: (value: string) => void;
  onCreateNew?: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MaterialCombobox({
  materials,
  value,
  onValueChange,
  onCreateNew,
  placeholder = 'Search or type material...',
  disabled = false,
}: MaterialComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMaterial = useMemo(() => {
    return materials?.find((m) => m.id === value);
  }, [materials, value]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    if (!searchValue) return materials;
    const search = searchValue.toLowerCase();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search) ||
        m.size?.toLowerCase().includes(search)
    );
  }, [materials, searchValue]);

  const showCreateOption = useMemo(() => {
    if (!searchValue.trim() || !onCreateNew) return false;
    const exists = materials?.some(
      (m) => m.name.toLowerCase() === searchValue.toLowerCase()
    );
    return !exists;
  }, [materials, searchValue, onCreateNew]);

  const handleSelect = useCallback(
    (materialId: string) => {
      onValueChange(materialId);
      setOpen(false);
      setSearchValue('');
    },
    [onValueChange]
  );

  const handleCreateNew = useCallback(() => {
    if (onCreateNew && searchValue.trim()) {
      onCreateNew(searchValue.trim());
      setSearchValue('');
      setOpen(false);
    }
  }, [onCreateNew, searchValue]);

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedMaterial ? (
            <span className="truncate">
              {selectedMaterial.name}
              {selectedMaterial.size && ` (${selectedMaterial.size})`}
              {selectedMaterial.unit_price != null && ` - ${selectedMaterial.unit_price}`}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0 z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Type to search or add..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {showCreateOption ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 p-2 text-sm hover:bg-accent cursor-pointer"
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4" />
                  Create "{searchValue}"
                </button>
              ) : (
                'No materials found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredMaterials.map((material) => (
                <CommandItem
                  key={material.id}
                  value={material.id}
                  onSelect={() => handleSelect(material.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === material.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{material.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {material.size && `Size: ${material.size}`}
                      {material.size && material.unit_price != null && ' • '}
                      {material.unit_price != null && `Price: ${material.unit_price}`}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && filteredMaterials.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchValue}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
