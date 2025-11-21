import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Users, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface ShareViewProps {
  url: string;
  onBack: () => void;
}

export function ShareView({ url, onBack }: ShareViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="p-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-gray-100">
          <ArrowLeft className="size-6 text-gray-600" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full -mt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 relative"
        >
          <div className="bg-red-50 p-8 rounded-full relative z-10">
            <Users className="size-16 text-red-600" />
          </div>
          <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 border-2 border-dashed border-red-200 rounded-full scale-150"
          />
          <div className="absolute -right-2 -bottom-2 bg-green-500 p-2 rounded-full border-4 border-white z-20 shadow-sm">
             <Check className="size-4 text-white" />
          </div>
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          Share with friends
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 mb-8 max-w-xs mx-auto"
        >
          Send this link to your group to start voting on where to eat!
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-4"
        >
          <div className="relative">
            <Input 
              value={url} 
              readOnly 
              className="pr-12 h-14 text-lg bg-gray-50 border-gray-200 text-gray-600" 
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className={`hover:bg-gray-200 ${copied ? "text-green-600" : "text-gray-500"}`}
              >
                {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
              </Button>
            </div>
          </div>

          <Button 
            className="w-full h-14 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 rounded-xl gap-2"
            onClick={handleCopy}
          >
            <Share2 className="size-5" />
            {copied ? 'Copied Link!' : 'Copy Link'}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
