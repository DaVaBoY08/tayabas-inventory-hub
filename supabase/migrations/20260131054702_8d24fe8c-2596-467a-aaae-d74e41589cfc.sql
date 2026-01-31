-- Create department_requests table for request workflow
CREATE TABLE public.department_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  remarks TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create request_items table for multiple items per request
CREATE TABLE public.request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.department_requests(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PAR (Property Acknowledgement Receipt) table
CREATE TABLE public.property_acknowledgement_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  par_number TEXT NOT NULL UNIQUE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  custodian_id UUID NOT NULL REFERENCES public.custodians(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date_acquired DATE NOT NULL,
  property_number TEXT,
  location TEXT,
  condition TEXT DEFAULT 'Good' CHECK (condition IN ('Good', 'Fair', 'Poor', 'Unserviceable')),
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inspection table
CREATE TABLE public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_number TEXT NOT NULL UNIQUE,
  par_id UUID REFERENCES public.property_acknowledgement_receipts(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector_name TEXT NOT NULL,
  condition_before TEXT CHECK (condition_before IN ('Good', 'Fair', 'Poor', 'Unserviceable')),
  condition_after TEXT CHECK (condition_after IN ('Good', 'Fair', 'Poor', 'Unserviceable')),
  findings TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'follow_up_required')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.department_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_acknowledgement_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for department_requests
CREATE POLICY "Everyone can view requests" ON public.department_requests
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can insert requests" ON public.department_requests
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Manager and admin can update requests" ON public.department_requests
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admin can delete requests" ON public.department_requests
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for request_items
CREATE POLICY "Everyone can view request items" ON public.request_items
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can insert request items" ON public.request_items
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admin can delete request items" ON public.request_items
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for PAR
CREATE POLICY "Everyone can view PAR" ON public.property_acknowledgement_receipts
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can manage PAR" ON public.property_acknowledgement_receipts
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'staff')
  );

-- RLS Policies for inspections
CREATE POLICY "Everyone can view inspections" ON public.inspections
  FOR SELECT USING (true);

CREATE POLICY "Staff and above can manage inspections" ON public.inspections
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'staff')
  );

-- Add triggers for updated_at
CREATE TRIGGER update_department_requests_updated_at
  BEFORE UPDATE ON public.department_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_par_updated_at
  BEFORE UPDATE ON public.property_acknowledgement_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();