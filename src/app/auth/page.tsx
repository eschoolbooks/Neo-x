'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';
import { FirebaseClientProvider, useAuth, useUser } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { ThemeToggle } from '@/components/theme-toggle';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.638,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

function AuthForm() {
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [nameSignUp, setNameSignUp] = useState('');
  const [emailSignUp, setEmailSignUp] = useState('');
  const [passwordSignUp, setPasswordSignUp] = useState('');
  const [isLoading, setIsLoading] = useState<null | 'google' | 'email' | 'signup' | 'reset'>(null);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user profile in Firestore if it's a new user
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      toast({
        title: 'Signed In',
        description: `Welcome back, ${result.user.displayName}!`,
      });
      router.push('/ai-hub');
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    try {
      const result = await signInWithEmailAndPassword(auth, emailLogin, passwordLogin);
      toast({
        title: 'Signed In',
        description: `Welcome back, ${result.user.displayName || result.user.email}!`,
      });
      router.push('/ai-hub');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('signup');
    try {
      const result = await createUserWithEmailAndPassword(auth, emailSignUp, passwordSignUp);
      await updateProfile(result.user, { displayName: nameSignUp });

       // Create user profile in Firestore
      const userRef = doc(firestore, 'users', result.user.uid);
      await setDoc(userRef, {
        id: result.user.uid,
        name: nameSignUp,
        email: emailSignUp,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Account Created',
        description: 'Welcome! You have been successfully signed up.',
      });
       router.push('/ai-hub');
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!emailLogin) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address in the login form to reset your password.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading('reset');
    try {
      await sendPasswordResetEmail(auth, emailLogin);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox for instructions to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Password Reset Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-grid">
       <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={32} height={32} className="rounded-full"/>
            E-SchoolBooks
          </CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" placeholder="m@example.com" value={emailLogin} onChange={e => setEmailLogin(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" type="password" value={passwordLogin} onChange={e => setPasswordLogin(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={!!isLoading}>
                  {isLoading === 'email' && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={!!isLoading}>
                {isLoading === 'google' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Sign in with Google
              </Button>
              <div className="mt-4 text-center text-sm">
                <button onClick={handlePasswordReset} className="underline" disabled={isLoading === 'reset'}>
                    {isLoading === 'reset' ? 'Sending...' : 'Forgot your password?'}
                </button>
              </div>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Full Name</Label>
                  <Input id="name-signup" type="text" placeholder="John Doe" value={nameSignUp} onChange={e => setNameSignUp(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input id="email-signup" type="email" placeholder="m@example.com" value={emailSignUp} onChange={e => setEmailSignUp(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" type="password" required value={passwordSignUp} onChange={e => setPasswordSignUp(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={!!isLoading}>
                   {isLoading === 'signup' && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/ai-hub');
        }
    }, [user, isUserLoading, router]);

    // Render a loading state while checking for user, or the form if no user.
    if (isUserLoading || user) {
       return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <LoaderCircle className="w-10 h-10 animate-spin text-primary" />
        </div>
       )
    }

    return (
        <FirebaseClientProvider>
            <AuthForm />
        </FirebaseClientProvider>
    );
}
