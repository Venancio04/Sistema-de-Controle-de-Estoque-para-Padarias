import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeConfig = {
  entrada: { icon: ArrowUpCircle, color: "text-emerald-600", bg: "bg-emerald-100", label: "Entrada" },
  saida: { icon: ArrowDownCircle, color: "text-red-600", bg: "bg-red-100", label: "Saída" },
  ajuste: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100", label: "Ajuste" }
};

export default function RecentMovements({ movements }) {
  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-slate-500">Nenhuma movimentação registrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Movimentações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {movements.slice(0, 5).map(movement => {
          const config = typeConfig[movement.type];
          const Icon = config.icon;
          
          return (
            <div key={movement.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{movement.product_name}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(movement.created_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={config.color}>
                  {movement.type === 'saida' ? '-' : '+'}{movement.quantity}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}