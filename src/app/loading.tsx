import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <LoaderCircle className="w-16 h-16 animate-spin text-primary" />
    </div>
  );
}
