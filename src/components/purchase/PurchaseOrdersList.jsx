import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  rascunho: { label: "Rascunho", class: "bg-slate-100 text-slate-700" },
  enviado: { label: "Enviado", class: "bg-blue-100 text-blue-700" },
  recebido: { label: "Recebido", class: "bg-emerald-100 text-emerald-700" },
  cancelado: { label: "Cancelado", class: "bg-red-100 text-red-700" }
};

export default function PurchaseOrdersList({ orders }) {
  const [expanded, setExpanded] = useState(null);
  const queryClient = useQueryClient();

  const updateStatus = async (orderId, status) => {
    await base44.entities.PurchaseOrder.update(orderId, { status });
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum pedido criado ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const statusCfg = statusConfig[order.status];
        const isExpanded = expanded === order.id;

        return (
          <Card key={order.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
              onClick={() => setExpanded(isExpanded ? null : order.id)}
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {order.supplier_name || "Fornecedor não definido"}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • {order.items?.length || 0} itens
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusCfg.class}>{statusCfg.label}</Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t bg-slate-50 p-4 space-y-3">
                <div className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.product_name}</span>
                      <span className="font-medium">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
                {order.total_estimated > 0 && (
                  <p className="text-sm font-semibold text-amber-700">
                    Total estimado: R$ {order.total_estimated.toFixed(2)}
                  </p>
                )}
                {order.notes && <p className="text-sm text-slate-500 italic">{order.notes}</p>}
                {order.status === "rascunho" && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, "enviado")}>
                      Marcar como Enviado
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus(order.id, "cancelado")}>
                      Cancelar
                    </Button>
                  </div>
                )}
                {order.status === "enviado" && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(order.id, "recebido")}>
                    Marcar como Recebido
                  </Button>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}