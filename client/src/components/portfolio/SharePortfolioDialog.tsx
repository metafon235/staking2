import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as htmlToImage from 'html-to-image';

interface SharePortfolioDialogProps {
  portfolioRef: React.RefObject<HTMLDivElement>;
}

export default function SharePortfolioDialog({ portfolioRef }: SharePortfolioDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleShareSnapshot = async () => {
    if (!portfolioRef.current) return;
    
    try {
      setIsGenerating(true);
      const dataUrl = await htmlToImage.toPng(portfolioRef.current, {
        quality: 1.0,
        backgroundColor: '#18181b',
      });
      
      // Create a download link
      const link = document.createElement('a');
      link.download = `portfolio-snapshot-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Snapshot Generated",
        description: "Your portfolio snapshot has been downloaded."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate snapshot",
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Portfolio Snapshot</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-400">
            Generate a snapshot of your current portfolio status to share or save.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleShareSnapshot}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Download Snapshot"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
