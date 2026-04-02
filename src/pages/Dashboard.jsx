import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/dashboard/StatsCard";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import RecentMovements from "@/components/dashboard/RecentMovements";
import PullToRefresh from "@/components/PullToRefresh";

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['movements'],
    queryFn: () => base44.entities.StockMovement.list('-created_date', 10)
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const activeProducts = products.filter(p => p.is_active);
  const lowStockCount = activeProducts.filter(p => p.current_stock <= p.min_stock).length;

  const totalStockValue = activeProducts.reduce((acc, p) =>
    acc + ((p.current_stock || 0) * (p.cost_price || 0)), 0
  );

  const avgMargin = activeProducts.length > 0
    ? activeProducts.reduce((acc, p) => {
        if (p.sale_price && p.cost_price) {
          return acc + ((p.sale_price - p.cost_price) / p.cost_price * 100);
        }
        return acc;
      }, 0) / activeProducts.filter(p => p.sale_price && p.cost_price).length
    : 0;

  const isLoading = loadingProducts || loadingMovements;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Visão geral do seu negócio</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (
              <>
                <StatsCard title="Produtos Ativos" value={activeProducts.length} icon={Package} variant="default" />
                <StatsCard title="Valor em Estoque" value={`R$ ${totalStockValue.toFixed(2)}`} icon={DollarSign} variant="success" />
                <StatsCard title="Estoque Baixo" value={lowStockCount} icon={AlertTriangle} variant={lowStockCount > 0 ? "warning" : "default"} />
                <StatsCard title="Margem Média" value={`${avgMargin.toFixed(1)}%`} icon={TrendingUp} variant={avgMargin >= 50 ? "success" : avgMargin >= 30 ? "warning" : "danger"} />
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </>
            ) : (
              <>
                <LowStockAlert products={products} />
                <RecentMovements movements={movements} />
              </>
            )}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}