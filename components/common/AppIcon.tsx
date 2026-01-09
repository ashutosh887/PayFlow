import Image from "next/image";
import config from "@/config";

type Props = {
  dimension: number;
};

export default function AppIcon({ dimension }: Props) {
  return (
    <Image
      src={config.appLogo}
      alt={config.appLogoAlt}
      width={dimension}
      height={dimension}
      className="select-none pointer-events-none"
    />
  );
}
