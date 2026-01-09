import AppIcon from "@/components/common/AppIcon";
import config from "@/config";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <AppIcon dimension={100} />
      <h1 className="text-4xl font-bold">{config.appName}</h1>
      <p className="text-lg text-gray-500">{config.appDescription} <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-amber-600 whitespace-nowrap">{config.appDescriptionSuffix}</span></p>
    </div>
  );
}
