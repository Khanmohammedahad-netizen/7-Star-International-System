export interface Client {
  id: string;
  org_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}
