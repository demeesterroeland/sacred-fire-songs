import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/common/BackButton';
import { LoginForm } from '@/components/login-form';

export default async function Login() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/');

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4">
            <BackButton />
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
