import AppIcon from "@/components/common/AppIcon";
import config from "@/config";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full flex justify-center">
        <div className="w-full max-w-7xl flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <AppIcon dimension={34} />
            <span className="text-base font-semibold tracking-tight">
              {config.appName}
            </span>
          </div>

          <Button variant="outline" className="rounded-full px-5">
            Connect Wallet
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-7xl text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              {config.appDescription}{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-amber-600 whitespace-nowrap">
                {config.appDescriptionSuffix}
              </span>
            </h1>

            <p className="text-lg text-muted-foreground">
              {config.appDetailedDescription.primary}
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8">
                Get Started
              </Button>

              <Button size="lg" variant="outline" className="rounded-full px-8">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center pb-8 px-6">
        <p className="max-w-3xl text-sm text-muted-foreground text-center">
          {config.appDetailedDescription.secondary}
        </p>
      </footer>
    </div>
  );
}
