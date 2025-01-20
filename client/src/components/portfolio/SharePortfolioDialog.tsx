import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Mail, Download } from "lucide-react";
import { SiWhatsapp, SiPinterest } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import * as htmlToImage from 'html-to-image';

interface SharePortfolioDialogProps {
  portfolioRef: React.RefObject<HTMLDivElement>;
}

export default function SharePortfolioDialog({ portfolioRef }: SharePortfolioDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Base URL for sharing (replace with your actual domain in production)
  const baseUrl = window.location.origin;
  const referralId = "USER_ID"; // Replace with actual user's referral ID
  const shareUrl = `${baseUrl}/portfolio?ref=${referralId}`;

  const handleGenerateSnapshot = async () => {
    if (!portfolioRef.current) return;

    try {
      setIsGenerating(true);
      const dataUrl = await htmlToImage.toPng(portfolioRef.current, {
        quality: 1.0,
        backgroundColor: '#18181b',
      });
      setImageUrl(dataUrl);
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

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `portfolio-snapshot-${new Date().toISOString().split('T')[0]}.png`;
    link.href = imageUrl;
    link.click();
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my crypto staking portfolio!')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out my crypto staking portfolio! ${shareUrl}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent('My Crypto Staking Portfolio')}`,
    email: `mailto:?subject=${encodeURIComponent('Check out my crypto staking portfolio!')}&body=${encodeURIComponent(`Take a look at my portfolio: ${shareUrl}`)}`
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (open) handleGenerateSnapshot();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Portfolio Snapshot</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          {isGenerating ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : imageUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-zinc-800">
                <img src={imageUrl} alt="Portfolio Snapshot" className="w-full" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </a>
                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </a>
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                >
                  <SiWhatsapp className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={shareUrls.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  <SiPinterest className="h-4 w-4" />
                  <span>Pinterest</span>
                </a>
                <a
                  href={shareUrls.email}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-600 hover:bg-zinc-700 text-white"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
                <Button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              </div>
              <p className="text-sm text-zinc-400 text-center">
                Share your portfolio with friends and earn rewards when they join!
              </p>
            </>
          ) : (
            <p className="text-zinc-400 text-center">Failed to generate snapshot</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}