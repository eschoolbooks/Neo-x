
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Shield, Users, BrainCircuit, FileQuestion, BarChart, Eye } from 'lucide-react';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getCountFromServer, Timestamp, collectionGroup } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

// This is basic client-side protection. For production, a proper admin auth system is recommended.
const ADMIN_PASSWORD = '1qaz';

type UserDoc = {
    id: string;
    name: string;
    email: string;
    createdAt: Timestamp;
}

const AdminStats = () => {
    const firestore = useFirestore();
    const [stats, setStats] = useState({ users: 0, predictions: 0, quizzes: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!firestore) return;
            try {
                const usersCol = collection(firestore, 'users');
                const analysesCol = collectionGroup(firestore, 'analyses');
                const quizzesCol = collectionGroup(firestore, 'quizzes');
                
                const usersSnap = await getCountFromServer(usersCol);
                const predictionsSnap = await getCountFromServer(analysesCol);
                const quizzesSnap = await getCountFromServer(quizzesCol);

                setStats({
                    users: usersSnap.data().count,
                    predictions: predictionsSnap.data().count,
                    quizzes: quizzesSnap.data().count,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [firestore]);
    
    const recentUsersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: recentUsers, isLoading: isLoadingUsers } = useCollection<UserDoc>(recentUsersQuery);

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <LoaderCircle className="animate-spin h-6 w-6"/> : stats.users}</div>
                        <p className="text-xs text-muted-foreground">Total registered users</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Predictions Generated</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <LoaderCircle className="animate-spin h-6 w-6"/> : stats.predictions}</div>
                        <p className="text-xs text-muted-foreground">Total exam predictions</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quizzes Created</CardTitle>
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <LoaderCircle className="animate-spin h-6 w-6"/> : stats.quizzes}</div>
                        <p className="text-xs text-muted-foreground">Total quizzes taken by users</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Google Analytics</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full">
                                <Eye className="mr-2 h-4 w-4" /> View on GA
                            </Button>
                        </a>
                        <p className="text-xs text-muted-foreground mt-2">View detailed traffic data.</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recent User Signups</CardTitle>
                    <CardDescription>A list of the latest users who have joined the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Joined On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingUsers && Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><LoaderCircle className="animate-spin"/></TableCell>
                                    <TableCell><LoaderCircle className="animate-spin"/></TableCell>
                                    <TableCell><LoaderCircle className="animate-spin"/></TableCell>
                                    <TableCell className="text-right"><LoaderCircle className="animate-spin"/></TableCell>
                                </TableRow>
                            ))}
                            {recentUsers?.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge>Active</Badge></TableCell>
                                    <TableCell className="text-right">{user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default function AdminDashboardPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Artificial delay for UX
        setTimeout(() => {
            if (password === ADMIN_PASSWORD) {
                setIsAuthenticated(true);
                toast({ title: "Access Granted", description: "Welcome, Admin!" });
            } else {
                toast({ title: "Access Denied", description: "Incorrect password.", variant: 'destructive' });
            }
            setIsLoading(false);
            setPassword('');
        }, 500);
    };

    if (!isAuthenticated) {
        return (
            <>
                <head>
                  <meta name="robots" content="noindex, nofollow" />
                </head>
                <div className="flex items-center justify-center min-h-screen bg-muted/40">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Shield /> Admin Access</CardTitle>
                            <CardDescription>This area is restricted. Please enter the password to continue.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Unlock
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
    
    return (
        <>
             <head>
                <title>Admin Dashboard</title>
                <meta name="robots" content="noindex, nofollow" />
            </head>
            <div className="flex flex-col min-h-screen bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-0">
                    <AdminStats />
                </main>
            </div>
        </>
    );
}

    