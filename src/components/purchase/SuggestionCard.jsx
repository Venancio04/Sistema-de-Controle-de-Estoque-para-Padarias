import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertTriangle, TrendingDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const urgencyConfig = {
  critico: { color: "border-red-300 bg-red-50", badge: "bg-red-100 text-red-700", label: "Crítico", icon: AlertTriangle },
  baixo: { color: "border-amber-300 bg-amber-50", badge: "bg-amber-100 text-amber-700", label: "Baixo", icon: TrendingDown },
  projecao: { color: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700", label: "Projeção", icon: Package }
};

export default function SuggestionCard({ suggestion, selected, onToggle, onQuantityChange }) {
  const config = urgencyConfig[suggestion.urgency];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl border-2 p-4 transition-all", config.color, selected && "ring-2 ring-amber-500")}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800">{suggestion.product_name}</p>
            <Badge className={cn("text-xs", config.badge)}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-xs text-slate-500">Atual</p>
              <p className="font-semibold text-slate-700">{suggestion.current_stock} {suggestion.unit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Mínimo</p>
              <p className="font-semibold text-slate-700">{suggestion.min_stock} {suggestion.unit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Venda/dia</p>
              <p className="font-semibold text-slate-700">~{suggestion.avg_daily_sales.toFixed(1)}</p>
            </div>
          </div>
          {suggestion.days_until_empty !== null && (
            <p className="text-xs text-slate-500 mt-2">
              ⏱ Estoque acaba em aprox. <strong>{suggestion.days_until_empty} dias</strong>
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <p className="text-sm text-slate-600 whitespace-nowrap">Qtd. sugerida:</p>
            <Input
              type="number"
              min="1"
              value={suggestion.suggested_qty}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="h-8 w-24"
            />
            <span className="text-sm text-slate-500">{suggestion.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}