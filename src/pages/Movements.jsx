import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Search, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PullToRefresh from "@/components/PullToRefresh";

const typeConfig = {
  entrada: { icon: ArrowUpCircle, color: "text-emerald-600", bg: "bg-emerald-100", label: "Entrada" },
  saida: { icon: ArrowDownCircle, color: "text-red-600", bg: "bg-red-100", label: "Saída" },
  ajuste: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100", label: "Ajuste" }
};

export default function Movements() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: () => base44.entities.StockMovement.list('-created_date', 100)
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.product_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const groupedMovements = filteredMovements.reduce((acc, m) => {
    const date = format(new Date(m.created_date), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {});

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Movimentações</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Histórico de entradas e saídas</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
                <SelectItem value="ajuste">Ajustes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Nenhuma movimentação</h3>
              <p className="text-slate-500 mt-1">As movimentações de estoque aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMovements).map(([date, dayMovements]) => (
                <div key={date}>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                    {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <Card className="divide-y dark:bg-slate-800 dark:border-slate-700">
                    {dayMovements.map(movement => {
                      const config = typeConfig[movement.type];
                      const Icon = config.icon;
                      return (
                        <div key={movement.id} className="flex items-center gap-4 p-4">
                          <div className={cn("p-3 rounded-xl", config.bg)}>
                            <Icon className={cn("w-5 h-5", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white">{movement.product_name}</p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(movement.created_date), "HH:mm")}
                              {movement.reason && ` • ${movement.reason}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={cn("text-sm", config.bg, config.color)}>
                              {movement.type === 'saida' ? '-' : movement.type === 'entrada' ? '+' : ''}{movement.quantity}
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">
                              {movement.previous_stock} → {movement.new_stock}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}