import { Card } from "@/components/ui/card";
console.log("Home component is rendering");

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Test Page
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            If you can see this, the app is working.
          </p>
        </div>
      </div>
    </div>
  );
}