import { LegiscribeClientPage } from "@/app/legiscribe-client-page";
import Header from "@/components/layout/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <LegiscribeClientPage />
      </main>
    </div>
  );
}
