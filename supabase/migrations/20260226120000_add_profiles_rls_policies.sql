-- RLS policies for profiles table
-- RLS was enabled but had no policies, causing all profile reads to return null
-- and defaulting every authenticated user to role 'member'.

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
