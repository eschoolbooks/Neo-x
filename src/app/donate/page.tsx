'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, Target, Lightbulb, Users, IndianRupee, HandHeart, BookHeart, School } from 'lucide-react';

export default function DonatePage() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [upiUrl, setUpiUrl] = useState('');
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleGenerateUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || Number(amount) <= 0) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your name and a valid donation amount.',
        variant: 'destructive',
      });
      return;
    }
    const upiLink = `upi://pay?pa=9946882478-2@ibl&pn=ESchoolBooks&am=${amount}&cu=INR&tn=Donation to ESB from ${encodeURIComponent(name)}`;
    setUpiUrl(upiLink);
  };

  const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="bg-card/50 p-6 rounded-lg border border-border/20 backdrop-blur-sm"
    >
      <div className="text-accent mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2">
            <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={40} height={40} className="rounded-full"/>
            <span className="font-bold text-xl text-foreground">E-SchoolBooks</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
             <a href="/" className="hover:text-primary transition-colors">Home</a>
          </div>
          <Button asChild className="rounded-full" onClick={handleScrollToForm}>
            <div className="cursor-pointer">
              Donate Now <Heart className="ml-2 h-4 w-4" />
            </div>
          </Button>
        </nav>
      </header>

      <main className="pt-20">
        {/* Donation Form Section */}
        <section ref={formRef} id="donate-form" className="py-20 lg:py-32 bg-grid">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-3xl">Support Our Mission</CardTitle>
                    <CardDescription>Your contribution can change a student's life. Please fill in your details to proceed.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGenerateUpi} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="amount">Donation Amount (INR)</Label>
                        <Input id="amount" type="number" placeholder="e.g., 500" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address (for invoice)</Label>
                        <Input id="email" type="email" placeholder="Optional: your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Optional: your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <Button type="submit" size="lg" className="w-full" disabled={!!upiUrl}>
                        {upiUrl ? 'QR Code Generated!' : 'Generate QR Code'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-col items-center justify-center text-center"
              >
                {upiUrl ? (
                  <div className="bg-card/80 p-6 md:p-8 rounded-xl shadow-2xl border border-border/20 backdrop-blur-sm flex flex-col items-center gap-4">
                    <h3 className="text-xl font-bold">Scan to Pay with UPI</h3>
                    <p className="text-muted-foreground text-sm">Use any UPI app like GPay, PhonePe, or Paytm.</p>
                    <div className="p-4 bg-white rounded-lg">
                      <QRCode value={upiUrl} size={192} />
                    </div>
                    <p className="font-bold text-lg">Amount: ₹{amount}</p>
                    <Button asChild size="lg">
                      <a href={upiUrl}>
                        Pay with UPI App
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-card/50 rounded-xl">
                     <HandHeart className="w-20 h-20 mx-auto text-primary animate-pulse" />
                     <h3 className="text-2xl font-bold mt-4">Thank You for Your Generosity</h3>
                     <p className="text-muted-foreground mt-2">Please fill out the form to generate a secure UPI payment QR code.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Funds Raised Section */}
        <section className="py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Funds Raised So Far</h2>
                    <p className="text-7xl font-extrabold text-primary mb-2">₹0</p>
                    <p className="max-w-2xl mx-auto text-muted-foreground">
                        We are just getting started and you can be among the first to contribute to our mission. Every single rupee counts!
                    </p>
                </motion.div>
            </div>
        </section>


        {/* Where your money goes */}
        <section className="py-20 lg:py-32 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Your Contribution Helps</h2>
              <p className="max-w-3xl mx-auto text-muted-foreground">
                We believe in complete transparency. Your donation directly fuels our initiatives to make education accessible and sustainable for every student.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InfoCard 
                icon={<BookHeart className="w-10 h-10"/>}
                title="Digitizing Textbooks"
                description="Your funds help us convert physical textbooks into high-quality, interactive digital formats, making them freely available to all students."
              />
              <InfoCard 
                icon={<School className="w-10 h-10"/>}
                title="Empowering Girl Students"
                description="A significant portion of our efforts is dedicated to providing girls with the resources and support they need to pursue their educational dreams."
              />
              <InfoCard 
                icon={<Users className="w-10 h-10"/>}
                title="Community Outreach"
                description="We run awareness programs in schools and communities to promote the benefits of digital education and sustainable learning practices."
              />
            </div>
          </div>
        </section>

        {/* Mission Vision Goal Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12 text-center">
            <InfoCard 
                icon={<Target className="w-10 h-10"/>}
                title="Our Mission"
                description="To make education accessible, eco-friendly, and burden-free for every student by providing free digital learning resources."
            />
            <InfoCard 
                icon={<Lightbulb className="w-10 h-10"/>}
                title="Our Vision"
                description="To create a self-learning ecosystem where students can choose their own future and build a great nation, unhindered by physical or financial boundaries."
            />
            <InfoCard 
                icon={<IndianRupee className="w-10 h-10"/>}
                title="Our Goal"
                description="To eliminate the need for heavy school bags, save millions of trees, and ensure every child, especially girls, has the tools to succeed."
            />
          </div>
        </section>
        
        {/* Footer */}
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={80} height={80} className="rounded-full mx-auto mb-4"/>
                <h2 className="text-2xl font-bold mb-2">Join Us on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="mt-8 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} E-SchoolBooks Project by Theo. All Rights Reserved.
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}
