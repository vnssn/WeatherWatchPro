import { Card } from "@/components/ui/card";

export default function DeviceInfo({ title, value }) {
  return (
    <Card className="border border-border p-4 hover:shadow-md transition-shadow">
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="font-medium text-foreground">{value}</div>
    </Card>
  );
} 