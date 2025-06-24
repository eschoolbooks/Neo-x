'use client';

import { useState, useEffect } from 'react';
import type { SVGProps } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ESchoolBookLogo } from '@/components/icons';
import { ArrowRight, Book, Heart, Leaf, Mail, Phone, Users, Zap } from 'lucide-react';
import CountUp from 'react-countup';

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
      <div className="text-primary mx-auto mb-4">{icon}</div>
      <div className="text-4xl md:text-5xl font-extrabold text-foreground">
        {didAnimate && <CountUp end={value} duration={duration} separator="," />}
        {suffix}
      </div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);
    
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
            }}
            className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/20"
        >
            <div className="text-accent mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </motion.div>
    );
};

export default function Home() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2">
            <ESchoolBookLogo className="h-10 w-10 text-primary" />
            <span className="font-bold text-xl text-foreground">E-SchoolBooks</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#vision" className="hover:text-primary transition-colors">Our Vision</a>
            <a href="#impact" className="hover:text-primary transition-colors">Impact</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <Button asChild className="rounded-full animate-pulse-strong">
            <a href="#donate">
              Donate Now <Heart className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-indigo-950/20 to-background opacity-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <ESchoolBookLogo className="h-32 w-32 text-primary mx-auto mb-6 animate-float" />
            </motion.div>
            <motion.h1 
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              Lighten Their Bags.
              <br />
              <span className="text-primary">Brighten Their Future.</span>
            </motion.h1>
            <motion.p 
                className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
              We're on a mission to save students from back pain and save nature through digital books. Join us in rewriting the future of education.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Button size="lg" asChild className="rounded-full text-lg px-10 py-6">
                    <a href="#donate">
                        Support Our Mission <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                </Button>
            </motion.div>
          </div>
        </section>

        {/* The Problem & Solution Section */}
        <section className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Image src="https://placehold.co/600x400.png" alt="Student with heavy backpack" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="child sad backpack" />
                        <h2 className="text-3xl font-bold mt-6 mb-3 text-red-400">The Unseen Burden</h2>
                        <p className="text-muted-foreground">Millions of students suffer from chronic back pain, shoulder, and spinal cord issues from carrying heavy backpacks daily. This physical strain hinders their ability to learn and thrive.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <Image src="https://placehold.co/600x400.png" alt="Student learning with a tablet" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="child happy tablet" />
                        <h2 className="text-3xl font-bold mt-6 mb-3 text-accent">A Lighter Path Forward</h2>
                        <p className="text-muted-foreground">E-SchoolBooks provides a simple, powerful solution: free digital textbooks. We eliminate heavy loads, promote better health, and create a more sustainable, eco-friendly learning environment for all.</p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 lg:py-32">
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

        {/* Vision Section */}
        <section id="vision" className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Vision for a Better World</h2>
                    <p className="max-w-3xl mx-auto text-muted-foreground">
                        At E-SchoolBooks, we believe education is the cornerstone of a bright future. Our vision is to bridge the gap between students and learning resources, ensuring every child has access to quality educational materials.
                    </p>
                </div>
                 <div className="grid md:grid-cols-3 gap-8 text-center">
                    <FeatureCard icon={<Zap className="w-10 h-10"/>} title="Innovative Learning" description="We create an interactive digital experience that mirrors physical books, making learning more engaging and accessible." delay={0} />
                    <FeatureCard icon={<Leaf className="w-10 h-10"/>} title="Sustainable Edge" description="By reducing the demand for printed textbooks, we champion an eco-friendly approach, saving countless trees." delay={0.2} />
                    <FeatureCard icon={<Heart className="w-10 h-10"/>} title="Empowering Students" description="Currently serving Kerala students, we are dedicated to fostering a love for learning and creating a generation of confident individuals." delay={0.4} />
                 </div>
            </div>
        </section>

        {/* Donate Section */}
        <section id="donate" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground rounded-2xl p-8 md:p-16 text-center shadow-2xl">
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
                        <Button variant="secondary" size="lg" asChild className="rounded-full text-lg px-10 py-6 bg-white text-primary hover:bg-gray-200">
                           <a href="#">
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
                        <Image
                            key={i}
                            src={`https://placehold.co/100x100.png`}
                            alt={`Team member ${i + 1}`}
                            width={100}
                            height={100}
                            className="rounded-full border-4 border-background"
                             data-ai-hint="person portrait"
                        />
                    ))}
                </div>
            </div>
        </section>

        {/* Contact Section */}
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <ESchoolBookLogo className="h-20 w-20 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Join Us on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="flex justify-center items-center gap-6 text-muted-foreground">
                    <a href="mailto:info@e-schoolbooks.in" className="flex items-center gap-2 hover:text-primary"><Mail className="h-5 w-5" /> info@e-schoolbooks.in</a>
                    <a href="tel:+919946882478" className="flex items-center gap-2 hover:text-primary"><Phone className="h-5 w-5" /> +91 9946882478</a>
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
