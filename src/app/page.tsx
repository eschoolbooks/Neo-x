import { EmaDashboard } from "@/components/ema/ema-dashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]">
       <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <EmaDashboard />
    </main>
  );
}
