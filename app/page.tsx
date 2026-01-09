import config from "@/config";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Image src="/logo.png" alt="PayFlow Logo" width={100} height={100} className="select-none pointer-events-none" />
      <h1 className="text-4xl font-bold">{config.appName}</h1>
      <p className="text-lg text-gray-500">{config.appDescription}</p>
    </div>
  );
}
