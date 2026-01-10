export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          region: Database["public"]["Enums"]["region"]
          representative_name: string | null
          representative_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region: Database["public"]["Enums"]["region"]
          representative_name?: string | null
          representative_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region?: Database["public"]["Enums"]["region"]
          representative_name?: string | null
          representative_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_accounts: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          description: string | null
          e7_bank_transfer: number | null
          e7_cash: number | null
          entry_date: string
          expense_head: string | null
          id: string
          invoice_available: boolean | null
          invoice_date: string | null
          mode_of_payment: Database["public"]["Enums"]["payment_mode"] | null
          others: number | null
          person_responsible: string | null
          project_name: string | null
          region: Database["public"]["Enums"]["region"]
          remarks: string | null
          shaji_bank_transfer: number | null
          shaji_cash: number | null
          shaji_credit_card: number | null
          total: number | null
          updated_at: string
          vat: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          e7_bank_transfer?: number | null
          e7_cash?: number | null
          entry_date?: string
          expense_head?: string | null
          id?: string
          invoice_available?: boolean | null
          invoice_date?: string | null
          mode_of_payment?: Database["public"]["Enums"]["payment_mode"] | null
          others?: number | null
          person_responsible?: string | null
          project_name?: string | null
          region: Database["public"]["Enums"]["region"]
          remarks?: string | null
          shaji_bank_transfer?: number | null
          shaji_cash?: number | null
          shaji_credit_card?: number | null
          total?: number | null
          updated_at?: string
          vat?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          e7_bank_transfer?: number | null
          e7_cash?: number | null
          entry_date?: string
          expense_head?: string | null
          id?: string
          invoice_available?: boolean | null
          invoice_date?: string | null
          mode_of_payment?: Database["public"]["Enums"]["payment_mode"] | null
          others?: number | null
          person_responsible?: string | null
          project_name?: string | null
          region?: Database["public"]["Enums"]["region"]
          remarks?: string | null
          shaji_bank_transfer?: number | null
          shaji_cash?: number | null
          shaji_credit_card?: number | null
          total?: number | null
          updated_at?: string
          vat?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          emirates_id: string | null
          emirates_id_expiry: string | null
          emirates_id_image_url: string | null
          full_name: string
          id: string
          is_active: boolean | null
          passport_expiry: string | null
          passport_image_url: string | null
          passport_number: string | null
          phone: string | null
          position: string | null
          region: Database["public"]["Enums"]["region"]
          updated_at: string
          visa_expiry: string | null
          visa_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          emirates_id_image_url?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          passport_expiry?: string | null
          passport_image_url?: string | null
          passport_number?: string | null
          phone?: string | null
          position?: string | null
          region: Database["public"]["Enums"]["region"]
          updated_at?: string
          visa_expiry?: string | null
          visa_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          emirates_id_image_url?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          passport_expiry?: string | null
          passport_image_url?: string | null
          passport_number?: string | null
          phone?: string | null
          position?: string | null
          region?: Database["public"]["Enums"]["region"]
          updated_at?: string
          visa_expiry?: string | null
          visa_number?: string | null
        }
        Relationships: []
      }
      event_employees: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          employee_id: string
          event_id: string
          id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          employee_id: string
          event_id: string
          id?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          employee_id?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_employees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_materials: {
        Row: {
          created_at: string
          event_id: string
          id: string
          material_id: string
          quantity: number
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          material_id: string
          quantity?: number
          total_price?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          material_id?: string
          quantity?: number
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_materials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      event_vendors: {
        Row: {
          assigned_by: string | null
          created_at: string
          event_id: string
          id: string
          notes: string | null
          vendor_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          vendor_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_vendors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_id: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_end_date: string | null
          id: string
          location: string | null
          region: Database["public"]["Enums"]["region"]
          staff_count: number | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_end_date?: string | null
          id?: string
          location?: string | null
          region: Database["public"]["Enums"]["region"]
          staff_count?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_end_date?: string | null
          id?: string
          location?: string | null
          region?: Database["public"]["Enums"]["region"]
          staff_count?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number | null
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
          serial_no: number
          size: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          rate: number
          serial_no: number
          size?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
          serial_no?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequences: {
        Row: {
          current_number: number
          id: string
          prefix: string
          region: Database["public"]["Enums"]["region"]
        }
        Insert: {
          current_number?: number
          id?: string
          prefix?: string
          region: Database["public"]["Enums"]["region"]
        }
        Update: {
          current_number?: number
          id?: string
          prefix?: string
          region?: Database["public"]["Enums"]["region"]
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          balance: number | null
          client_id: string
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          net_amount: number
          notes: string | null
          quotation_id: string | null
          region: Database["public"]["Enums"]["region"]
          status: Database["public"]["Enums"]["document_status"]
          total_amount: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          amount_paid?: number
          balance?: number | null
          client_id: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          net_amount?: number
          notes?: string | null
          quotation_id?: string | null
          region: Database["public"]["Enums"]["region"]
          status?: Database["public"]["Enums"]["document_status"]
          total_amount?: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          amount_paid?: number
          balance?: number | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          net_amount?: number
          notes?: string | null
          quotation_id?: string | null
          region?: Database["public"]["Enums"]["region"]
          status?: Database["public"]["Enums"]["document_status"]
          total_amount?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          region: Database["public"]["Enums"]["region"]
          size: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region: Database["public"]["Enums"]["region"]
          size?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region?: Database["public"]["Enums"]["region"]
          size?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          received_by: string | null
          reference_number: string | null
          region: Database["public"]["Enums"]["region"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          received_by?: string | null
          reference_number?: string | null
          region: Database["public"]["Enums"]["region"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          received_by?: string | null
          reference_number?: string | null
          region?: Database["public"]["Enums"]["region"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          credit: number | null
          debit: number | null
          description: string
          entry_date: string
          id: string
          mode_of_payment: Database["public"]["Enums"]["payment_mode"] | null
          remarks: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credit?: number | null
          debit?: number | null
          description: string
          entry_date?: string
          id?: string
          mode_of_payment?: Database["public"]["Enums"]["payment_mode"] | null
          remarks?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credit?: number | null
          debit?: number | null
          description?: string
          entry_date?: string
          id?: string
          mode_of_payment?: Database["public"]["Enums"]["payment_mode"] | null
          remarks?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          amount: number | null
          created_at: string
          description: string
          id: string
          quantity: number
          quotation_id: string
          rate: number
          serial_no: number
          size: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quotation_id: string
          rate: number
          serial_no: number
          size?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quotation_id?: string
          rate?: number
          serial_no?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          element: string | null
          event_id: string | null
          id: string
          net_amount: number
          notes: string | null
          quotation_date: string
          quotation_number: string
          region: Database["public"]["Enums"]["region"]
          status: Database["public"]["Enums"]["document_status"]
          total_amount: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          element?: string | null
          event_id?: string | null
          id?: string
          net_amount?: number
          notes?: string | null
          quotation_date?: string
          quotation_number: string
          region: Database["public"]["Enums"]["region"]
          status?: Database["public"]["Enums"]["document_status"]
          total_amount?: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          element?: string | null
          event_id?: string | null
          id?: string
          net_amount?: number
          notes?: string | null
          quotation_date?: string
          quotation_number?: string
          region?: Database["public"]["Enums"]["region"]
          status?: Database["public"]["Enums"]["document_status"]
          total_amount?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          region: Database["public"]["Enums"]["region"]
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          region: Database["public"]["Enums"]["region"]
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          region?: Database["public"]["Enums"]["region"]
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          region: Database["public"]["Enums"]["region"]
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region: Database["public"]["Enums"]["region"]
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region?: Database["public"]["Enums"]["region"]
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          facilities_provided: string | null
          id: string
          notes: string | null
          region: Database["public"]["Enums"]["region"]
          representative_email: string | null
          representative_name: string | null
          representative_phone: string | null
          state: string | null
          status: string
          updated_at: string
          vendor_name: string
          vendor_type: Database["public"]["Enums"]["vendor_type"]
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          facilities_provided?: string | null
          id?: string
          notes?: string | null
          region: Database["public"]["Enums"]["region"]
          representative_email?: string | null
          representative_name?: string | null
          representative_phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          vendor_name: string
          vendor_type?: Database["public"]["Enums"]["vendor_type"]
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          facilities_provided?: string | null
          id?: string
          notes?: string | null
          region?: Database["public"]["Enums"]["region"]
          representative_email?: string | null
          representative_name?: string | null
          representative_phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          vendor_name?: string
          vendor_type?: Database["public"]["Enums"]["vendor_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_super_admins: { Args: never; Returns: number }
      get_next_invoice_number: {
        Args: { _region: Database["public"]["Enums"]["region"] }
        Returns: string
      }
      get_user_region: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["region"]
      }
      has_region_access: {
        Args: {
          _region: Database["public"]["Enums"]["region"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_manager_or_higher: { Args: { _user_id: string }; Returns: boolean }
      is_pending_user: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "manager"
        | "supervisor"
        | "accountant"
        | "staff"
        | "admin"
        | "pending"
      document_status: "draft" | "sent" | "approved" | "rejected"
      event_status: "pending" | "approved" | "rejected" | "completed"
      payment_mode:
        | "bank_transfer"
        | "cash"
        | "credit_card"
        | "cheque"
        | "other"
      region: "UAE" | "SAUDI"
      vendor_type:
        | "decor"
        | "catering"
        | "lighting"
        | "venue"
        | "security"
        | "audio_visual"
        | "photography"
        | "transportation"
        | "florist"
        | "furniture"
        | "staffing"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "manager",
        "supervisor",
        "accountant",
        "staff",
        "admin",
        "pending",
      ],
      document_status: ["draft", "sent", "approved", "rejected"],
      event_status: ["pending", "approved", "rejected", "completed"],
      payment_mode: ["bank_transfer", "cash", "credit_card", "cheque", "other"],
      region: ["UAE", "SAUDI"],
      vendor_type: [
        "decor",
        "catering",
        "lighting",
        "venue",
        "security",
        "audio_visual",
        "photography",
        "transportation",
        "florist",
        "furniture",
        "staffing",
        "other",
      ],
    },
  },
} as const
