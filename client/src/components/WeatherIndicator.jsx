import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WeatherIndicator({ 
  title, 
  value, 
  description, 
  icon,
  color
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="border border-border p-4 flex items-center cursor-help">
            <span className={`material-icons text-2xl ${color} mr-3`}>{icon}</span>
            <div>
              <div className="text-sm text-muted-foreground">{title}</div>
              <div className="font-medium text-foreground">{value}</div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 