import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/common/BackButton';
import { SignUpForm } from '@/components/sign-up-form';
import { safeNextPath } from '@/lib/auth/safeNext';
import { authBackHref } from '@/lib/auth/authBack';
import { AuthPage } from '@/components/auth/AuthShell';

export default async function SignUp(props: { searchParams: Promise<{ next?: string }> }) {
    const searchParams = await props.searchParams;
    const next = safeNextPath(searchParams.next);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect(next);

    return (
        <AuthPage back={<BackButton href={authBackHref(searchParams.next)} testId="auth-back" />}>
            <SignUpForm />
        </AuthPage>
    );
}
