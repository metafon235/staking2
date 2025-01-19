import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WalletInfoProps {
  address: string;
  amount: string;
}

export default function WalletInfo({ address, amount }: WalletInfoProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address has been copied to clipboard"
    });
  };

  return (
    <div className="space-y-4 p-4 bg-zinc-800 rounded-lg">
      <div className="text-center space-y-2">
        <p className="text-sm text-zinc-400">Send {amount} ETH to this address:</p>
        <div className="flex items-center justify-between bg-zinc-900 p-2 rounded">
          <code className="text-xs text-purple-400 break-all">{address}</code>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center bg-white p-4 rounded-lg">
        <QRCodeSVG 
          value={address}
          size={200}
          level="H"
          includeMargin
        />
      </div>
      
      <p className="text-xs text-zinc-400 text-center">
        Scan this QR code with your wallet app or copy the address above
      </p>
    </div>
  );
}
