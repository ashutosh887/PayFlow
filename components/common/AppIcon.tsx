import { Workflow } from "lucide-react";

type Props = {
  dimension: number;
};

export default function AppIcon({ dimension }: Props) {
  return (
    <Workflow 
      size={dimension}
      className="select-none pointer-events-none"
    />
  );
}
