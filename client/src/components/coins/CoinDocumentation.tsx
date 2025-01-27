import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CoinDocumentationProps {
  symbol: string;
  technicalDetails: {
    consensus: string;
    blockTime: string;
    maxSupply: string;
    features: string[];
  };
  stakingDetails: {
    minStake: string;
    apy: number;
    lockupPeriod?: string;
    rewards: string;
  };
  documentation: Array<{
    question: string;
    answer: string;
  }>;
}

export default function CoinDocumentation({
  symbol,
  technicalDetails,
  stakingDetails,
  documentation,
}: CoinDocumentationProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Technische Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Konsensus-Mechanismus</p>
              <p className="text-lg font-semibold text-white">
                {technicalDetails.consensus}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Blockzeit</p>
              <p className="text-lg font-semibold text-white">
                {technicalDetails.blockTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Maximale Anzahl</p>
              <p className="text-lg font-semibold text-white">
                {technicalDetails.maxSupply}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-zinc-400 mb-2">Hauptfunktionen</p>
            <ul className="list-disc list-inside text-white space-y-1">
              {technicalDetails.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Staking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Mindestbetrag</p>
              <p className="text-lg font-semibold text-white">
                {stakingDetails.minStake} {symbol}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Jährliche Rendite</p>
              <p className="text-lg font-semibold text-purple-400">
                {stakingDetails.apy}% APY
              </p>
            </div>
            {stakingDetails.lockupPeriod && (
              <div>
                <p className="text-sm text-zinc-400">Sperrfrist</p>
                <p className="text-lg font-semibold text-white">
                  {stakingDetails.lockupPeriod}
                </p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-sm text-zinc-400 mb-2">Belohnungsdetails</p>
              <p className="text-white">{stakingDetails.rewards}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">FAQ & Dokumentation</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {documentation.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-white hover:text-purple-400">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
