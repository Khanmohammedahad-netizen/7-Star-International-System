import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientCombobox } from '@/components/ClientCombobox';
import { Client } from '@/hooks/useClients';

interface EventFormData {
  title: string;
  description: string;
  client_id: string;
  event_date: string;
  event_end_date: string;
  location: string;
  staff_count: number;
  region: string;
}

interface EventFormFieldsProps {
  formData: EventFormData;
  onFieldChange: (field: keyof EventFormData, value: string | number) => void;
  clients: Client[] | undefined;
  isSuperAdmin: boolean;
}

export function EventFormFields({ formData, onFieldChange, clients, isSuperAdmin }: EventFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Event Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
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
          <Label>Event Date *</Label>
          <Input
            type="date"
            value={formData.event_date}
            onChange={(e) => onFieldChange('event_date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.event_end_date}
            onChange={(e) => onFieldChange('event_end_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Staff Count</Label>
          <Input
            type="number"
            value={formData.staff_count}
            onChange={(e) => onFieldChange('staff_count', parseInt(e.target.value) || 0)}
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
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
        />
      </div>
    </div>
  );
}
