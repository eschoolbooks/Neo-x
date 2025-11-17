
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, Target, Lightbulb, IndianRupee, HandHeart, BookHeart, School, Users, ArrowDown, CheckCircle, MessageCircle } from 'lucide-react';
import CountUp from 'react-countup';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { FeedbackDialog } from '@/components/feedback-dialog';

export default function DonatePage() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [upiUrl, setUpiUrl] = useState('');
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [logoSrc] = useState('/ESBlogo.png'); // E-SchoolBooks Logo
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const upiLink = `upi://pay?pa=9946882478@ibl&pn=ESchoolBooks&am=${amount}&cu=INR&tn=Donation from ${encodeURIComponent(name)}`;
    setUpiUrl(upiLink);
  };

  const InfoCard = ({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card/50 p-6 rounded-lg border border-border/20 backdrop-blur-sm"
    >
      <div className="text-orange-500 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${hasScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border/20' : 'bg-transparent'}`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2">
            {logoSrc && <Image src={logoSrc} alt="E-SchoolBooks Logo" width={40} height={40} className="sm:h-10 sm:w-10 bg-white rounded-full shadow-2xl p-1" priority />} 
            <span className="font-bold text-lg sm:text-xl text-foreground">ESchoolBooks</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
             <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
             <a href="/ai-hub" className="hover:text-orange-500 transition-colors">AI Hub</a>
             <a href="/donate" className="hover:text-orange-500 transition-colors">Donate</a>
             <a href="#contact" className="hover:text-orange-500 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white" onClick={handleScrollToForm}>
                Donate Now <Heart className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-orange-950/20 to-background opacity-50"></div>
            <div className="absolute inset-0 bg-grid-slow"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.3),rgba(255,255,255,0))]"></div>
            <div className="container relative z-10 px-4">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter mb-6">
                        Your Contribution,<br /> <span className="text-orange-500">Their Tomorrow.</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                        Even the smallest donation can rewrite a child's future. Join us in making education accessible, sustainable, and burden-free for every student.
                    </p>
                    <Button size="lg" className="rounded-full text-lg px-10 py-6 bg-orange-500 hover:bg-orange-600 text-white" onClick={handleScrollToForm}>
                       Make a Donation <HandHeart className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <ArrowDown className="w-6 h-6 animate-bounce" />
                </motion.div>
            </div>
        </section>

        {/* Donation Form Section */}
        <section ref={formRef} id="donate-form" className="py-20 lg:py-32 bg-grid">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
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
                        <Input id="phone" type="tel" placeholder="+91-9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <Button type="submit" size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={!!upiUrl}>
                        {upiUrl ? 'QR Code Generated!' : 'Generate QR Code to Pay'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
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
                    <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <a href={upiUrl}>
                        Pay with UPI App
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-card/50 rounded-xl">
                     <HandHeart className="w-20 h-20 mx-auto text-orange-500 animate-pulse" />
                     <h3 className="text-2xl font-bold mt-4">Your Generosity Matters</h3>
                     <p className="text-muted-foreground mt-2">Fill out the form to generate a secure UPI payment QR code and make a difference.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Funds Raised Section */}
        <section id="impact" className="py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Funds Raised So Far</h2>
                    <p className="text-7xl font-extrabold text-orange-500 mb-2">
                        <CountUp end={28639} duration={2} separator="," prefix="₹" />
                    </p>
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
                delay={0}
              />
              <InfoCard 
                icon={<School className="w-10 h-10"/>}
                title="Empowering Girl Students"
                description="A significant portion of our efforts is dedicated to providing girls with the resources and support they need to pursue their educational dreams."
                delay={0.2}
              />
              <InfoCard 
                icon={<Users className="w-10 h-10"/>}
                title="Community Outreach"
                description="We run awareness programs in schools and communities to promote the benefits of digital education and sustainable learning practices."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Mission, Vision, Goal Sections */}
        <section id="mission" className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7 }}
              >
                  <Target className="w-16 h-16 text-orange-500 mb-4"/>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground">To make education accessible, eco-friendly, and burden-free for every student by providing free digital learning resources. We strive to create a future where knowledge has no price tag.</p>
              </motion.div>
              <motion.div
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, amount: 0.5 }}
                 transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Image src="/img/Our mission.png" alt="Students collaborating" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="students collaborating" />
              </motion.div>
            </div>
          </div>
        </section>
        
        <section id="vision" className="py-20 lg:py-32 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <motion.div
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, amount: 0.5 }}
                 transition={{ duration: 0.7 }}
                 className="md:order-2"
              >
                <Image src="/img/Our-Vision.png" alt="Student looking towards future" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="student future" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                 className="md:order-1"
              >
                  <Lightbulb className="w-16 h-16 text-orange-500 mb-4"/>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Vision</h2>
                  <p className="text-lg text-muted-foreground">To create a self-learning ecosystem where students can choose their own future and build a great nation, unhindered by physical or financial boundaries. A world where curiosity is the only currency.</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="goal" className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7 }}
              >
                  <CheckCircle className="w-16 h-16 text-orange-500 mb-4"/>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Goal</h2>
                  <p className="text-lg text-muted-foreground">To eliminate the need for heavy school bags, save millions of trees by promoting digital resources, and ensure every child—especially girls—has the tools and opportunities to succeed and lead.</p>
              </motion.div>
              <motion.div
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, amount: 0.5 }}
                 transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Image src="/img/Our_goal.png" alt="Happy girl student" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="happy girl student" />
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {logoSrc && <Image src={logoSrc} alt="E-SchoolBooks Logo" width={80} height={80} className="mx-auto mb-4 bg-white rounded-full shadow-2xl p-2"/>}
                <h2 className="text-2xl font-bold mb-2">Join Us on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground mb-8">
                     <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-orange-500 transition-colors flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Give Feedback
                    </button>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-orange-500">Terms & Conditions</Link>
                    <span>•</span>
                    <Link href="/privacy" className="hover:text-orange-500">Privacy Policy</Link>
                </div>
                <div className="mt-8 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} E-SchoolBooks Project by Theo. All Rights Reserved.
                </div>
            </div>
        </footer>
      </main>
      <FeedbackDialog isOpen={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </div>
  );
}

    