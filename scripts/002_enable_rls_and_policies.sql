-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors can view patient profiles they have appointments with
CREATE POLICY "Doctors can view patient profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles doctor_profile
      WHERE doctor_profile.id = auth.uid() 
      AND doctor_profile.role = 'doctor'
    ) AND (
      role = 'patient' AND EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE doctor_id = auth.uid() AND patient_id = profiles.id
      )
    )
  );

-- Wallet policies
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Family members policies
CREATE POLICY "Patients can manage their family members" ON public.family_members
  FOR ALL USING (auth.uid() = patient_id);

-- Doctor specializations policies
CREATE POLICY "Doctors can manage their specializations" ON public.doctor_specializations
  FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Everyone can view doctor specializations" ON public.doctor_specializations
  FOR SELECT USING (true);

-- Appointments policies
CREATE POLICY "Patients can view their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Prescriptions policies
CREATE POLICY "Patients can view their prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage prescriptions they created" ON public.prescriptions
  FOR ALL USING (auth.uid() = doctor_id);

-- Doctor schedules policies
CREATE POLICY "Doctors can manage their schedules" ON public.doctor_schedules
  FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Everyone can view doctor schedules" ON public.doctor_schedules
  FOR SELECT USING (true);
