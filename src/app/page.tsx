
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Heart, Leaf, Mail, Phone, Users } from 'lucide-react';
import CountUp from 'react-countup';
import { useUser } from '@/firebase';
import { useTheme } from 'next-themes';


const StatCard = ({ icon, value, label, suffix, duration = 2 }: { icon: React.ReactNode; value: number; label: string; suffix?: string; duration?: number }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const [didAnimate, setDidAnimate] = useState(false);

  useEffect(() => {
    if (inView && !didAnimate) {
      controls.start("visible");
      setDidAnimate(true);
    }
  }, [controls, inView, didAnimate]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="text-center"
    >
      <div className="text-primary mx-auto mb-4 flex justify-center">{icon}</div>
      <div className="text-4xl md:text-5xl font-extrabold text-foreground">
        {didAnimate && <CountUp end={value} duration={duration} separator="," />}
        {suffix}
      </div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  );
};


export default function Home() {
  const { user } = useUser();
  const { resolvedTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/NeoX_Logo_Light.svg');

  useEffect(() => {
    setLogoSrc(resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg');
  }, [resolvedTheme]);
  
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2">
            {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={32} height={32} className="sm:h-10 sm:w-10" priority />}
            <span className="font-bold text-lg sm:text-xl text-foreground">Neo X</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="/ai-hub" className="hover:text-primary transition-colors">AI Hub</a>
            <a href="/donate" className="hover:text-primary transition-colors">Donate</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
                <Button asChild className="rounded-full">
                    <a href="/ai-hub">Go to AI Hub <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
            ) : (
                <Button asChild className="rounded-full" variant="secondary">
                  <a href="/auth">Sign In</a>
                </Button>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-indigo-950/20 to-background opacity-50"></div>
            <div className="absolute inset-0 bg-grid-slow"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6">
                        Taking Education<br /><span className="text-primary">beyond Boundaries</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                        A mission to make students able to self-learn, choose their own future, and build a great nation by helping today's generation find their pathway.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" asChild className="rounded-full text-lg px-10 py-6" variant="default">
                            <a href="/auth">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                        <Button size="lg" asChild className="rounded-full text-lg px-10 py-6" variant="secondary">
                           <a href="#contact">Join Our Mission</a>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Vision Section */}
        <section id="vision" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl sm:text-4xl font-bold mb-4"
                    >
                        Our Vision for a Better World
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-3xl mx-auto text-muted-foreground"
                    >
                        "At E-SchoolBooks, we believe education is the cornerstone of a bright future. We strive to bridge the gap between students and learning resources, ensuring every child has access to quality educational materials. We stand for saving our earth through nature-blended education beyond boundaries. Our vision is to make students able to self-learn, choose their own future, and build a great nation by empowering today’s generation to find their own pathway—leading to the next society."
                    </motion.p>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="max-w-3xl mx-auto text-muted-foreground mt-4 font-semibold italic"
                    >
                        - Founder Kevin Anjo
                    </motion.p>
                </div>
            </div>
        </section>


        {/* AI Hub Section */}
        <section id="ai-hub" className="py-20 lg:py-32 bg-grid">
             <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 pt-10">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                        <span className="text-primary">NEO X</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                        The most powerful and accurate question prediction AI.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" asChild className="rounded-full text-lg px-8 py-6" variant="secondary">
                        <a href="/donate">Exam Predictor</a>
                        </Button>
                        <Button size="lg" asChild className="rounded-full text-lg px-8 py-6" variant="default">
                            <a href="/ai-hub">
                                Try Beta <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        {/* New "Lighten their bags" section */}
        <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-6">
                        Lighten their bags.<br/>
                        <span className="text-primary">Brighten their Future.</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                        Join our mission to provide free digital textbooks, reduce the physical burden on students, and create an innovative, eco-friendly learning ecosystem for the next generation.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" asChild className="rounded-full text-lg px-10 py-6" variant="default">
                            <a href="/ai-hub">
                                Explore AI Hub <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                        <Button size="lg" asChild className="rounded-full text-lg px-10 py-6" variant="secondary">
                           <a href="#contact">Join Our Mission</a>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Impact, By the Numbers</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-16">
                    Every contribution, big or small, helps us grow our reach and transform more lives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard icon={<Users className="w-12 h-12" />} value={15} label="Passionate Team Members" />
                    <StatCard icon={<Book className="w-12 h-12" />} value={5000} suffix="+" label="Free Textbooks Provided" />
                    <StatCard icon={<Leaf className="w-12 h-12" />} value={1000} suffix="+" label="Trees Saved" />
                </div>
            </div>
        </section>
        
        {/* The Problem & Solution Section */}
        <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Image src="/img/lighten the bag.png" alt="Student with heavy backpack" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="child sad backpack" />
                        <h2 className="text-3xl font-bold mt-6 mb-3 text-destructive">The Unseen Burden</h2>
                        <p className="text-muted-foreground">Millions of students suffer from chronic back pain and spinal issues from carrying heavy backpacks. This physical strain hinders their ability to learn and thrive.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <Image src="/img/Flipbook Online.png" alt="FLipbook View from a desktop" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="child happy tablet" />
                        <h2 className="text-3xl font-bold mt-6 mb-3 text-accent">A Lighter Path Forward</h2>
                        <p className="text-muted-foreground">E-SchoolBooks provides free digital textbooks. We eliminate heavy loads, promote better health, and create a more sustainable, eco-friendly learning environment for all.</p>
                    </motion.div>
                </div>
            </div>
        </section>
        
        {/* Donate Section */}
        <section id="donate" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-orange-500 text-primary-foreground rounded-2xl p-8 md:p-16 text-center shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold mb-4">Even ₹1 Can Rewrite a Future.</h2>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
                            Your small contribution has a massive impact. It helps us digitize another book, save another tree, and ease the burden for another child. Join the movement.
                        </p>
                        <Button variant="secondary" size="lg" asChild className="rounded-full text-lg px-10 py-6 bg-white text-primary hover:bg-gray-200 inline-flex items-center justify-center mx-auto">
                           <a href="/donate">
                             Donate Securely <Heart className="ml-2 h-5 w-5 fill-current"/>
                           </a>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Team Section */}
        <section className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet the Hearts Behind the Mission</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-12">
                    E-SchoolBooks is a project by <strong className="text-primary">"Theo,"</strong> a non-profit founded by Kevin Anjo. We are a passionate force of 15 educators, technologists, and dreamers united for change.
                </p>
                <div className="flex justify-center -space-x-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Image
                                src={`https://picsum.photos/seed/${i+10}/100/100`}
                                alt={`Team member ${i + 1}`}
                                width={100}
                                height={100}
                                className="rounded-full border-4 border-background"
                                data-ai-hint="person portrait"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>


        {/* Contact Section */}
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={80} height={80} className="mx-auto mb-4"/>}
                <h2 className="text-2xl font-bold mb-2">Join Us on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-muted-foreground">
                    <a href="mailto:info@e-schoolbooks.in" className="flex items-center gap-2 hover:text-primary"><Mail className="h-5 w-5" /> info@e-schoolbooks.in</a>
                    <a href="tel:+918281543610" className="flex items-center gap-2 hover:text-primary"><Phone className="h-5 w-5" /> +91-8281543610</a>
                </div>
                <div className="mt-8 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} E-SchoolBooks Project by Theo. All Rights Reserved.
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}
