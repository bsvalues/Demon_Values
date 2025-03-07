export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          subscription_status: string;
          subscription_end_date: string | null;
          settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      users_profile: {
        Row: {
          id: string;
          full_name: string | null;
          organization: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users_profile']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users_profile']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          address: string;
          value: number;
          latitude: number;
          longitude: number;
          cluster: string;
          created_at: string;
          updated_at: string;
          details: Record<string, any> | null;
          market_trends: Record<string, any> | null;
          school_data: Record<string, any> | null;
          demographics: Record<string, any> | null;
          zoning: Record<string, any> | null;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      districts: {
        Row: {
          id: string;
          name: string;
          population: number;
          residential_properties: number;
          created_at: string;
          updated_at: string;
          min_latitude: number | null;
          max_latitude: number | null;
          min_longitude: number | null;
          max_longitude: number | null;
        };
        Insert: Omit<Database['public']['Tables']['districts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['districts']['Insert']>;
      };
      comp_grids: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          subject_property_id: string | null;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['comp_grids']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comp_grids']['Insert']>;
      };
      comp_properties: {
        Row: {
          id: string;
          grid_id: string;
          property_id: string | null;
          order_index: number;
          is_subject: boolean;
          details: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comp_properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comp_properties']['Insert']>;
      };
      comp_adjustments: {
        Row: {
          id: string;
          grid_id: string;
          property_id: string;
          category: string;
          adjustment_type: 'flat' | 'percentage';
          amount: number;
          description: string | null;
          ai_generated: boolean;
          confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comp_adjustments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comp_adjustments']['Insert']>;
      };
      comp_analysis: {
        Row: {
          id: string;
          grid_id: string;
          analysis_type: string;
          findings: Record<string, any>;
          confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comp_analysis']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comp_analysis']['Insert']>;
      };
    };
    Views: {
      property_analytics_view: {
        Row: {
          id: string;
          address: string;
          value: number;
          latitude: number;
          longitude: number;
          cluster: string;
          square_footage: string;
          bedrooms: string;
          bathrooms: string;
          year_built: string;
          quarterly_growth: string;
          yearly_growth: string;
          median_income: string;
          population_density: string;
          school_rating: string;
          zoning_type: string;
          district_name: string;
          district_population: number;
        };
      };
    };
    Functions: {
      calculate_market_trends: {
        Args: Record<string, never>;
        Returns: Record<string, any>;
      };
    };
    Enums: Record<string, never>;
  };
}