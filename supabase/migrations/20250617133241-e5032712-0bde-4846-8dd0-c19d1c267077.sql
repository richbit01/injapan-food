
-- Create table for application settings
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default referral commission rate
INSERT INTO public.app_settings (id, value, description) 
VALUES ('referral_commission_rate', '{"rate": 3}', 'Referral commission rate in percentage');

-- Create table for settings change history
CREATE TABLE public.settings_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;

-- Create policies for app_settings (only admins can modify)
CREATE POLICY "Anyone can view app settings" 
  ON public.app_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can update app settings" 
  ON public.app_settings 
  FOR UPDATE 
  USING (public.is_admin());

-- Create policies for settings_history (only admins can view)
CREATE POLICY "Only admins can view settings history" 
  ON public.settings_history 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Only admins can create settings history" 
  ON public.settings_history 
  FOR INSERT 
  WITH CHECK (public.is_admin());

-- Create trigger to update updated_at on app_settings
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
