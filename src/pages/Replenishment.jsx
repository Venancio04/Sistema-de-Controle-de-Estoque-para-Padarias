import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, RefreshCw, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import SuggestionCard from "@/components/purchase/SuggestionCard";
import CreateOrderModal from "@/components/purchase/CreateOrderModal";
import PurchaseOrdersList from "@/components/purchase/PurchaseOrdersList";

// Calculates suggestions from products + movements
function buildSuggestions(products, movements) {
  const suggestions = [];
  const now = new Date();

  for (const product of products) {
    if (!product.is_active) continue;

    // Calc avg daily sales from last 30 days of 'saida' movements
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const productSales = movements.filter(
      m => m.product_id === product.id && m.type === "saida" && new Date(m.created_date) >= thirtyDaysAgo
    );
    const totalSold = productSales.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const avgDailySales = totalSold / 30;

    const currentStock = product.current_stock || 0;
    const minStock = product.min_stock || 5;

    // Days until empty (based on avg sales)
    const daysUntilEmpty = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : null;

    // Urgency logic
    let urgency = null;
    if (currentStock === 0 || currentStock < minStock * 0.5) {
      urgency = "critico";
    } else if (currentStock <= minStock) {
      urgency = "baixo";
    } else if (daysUntilEmpty !== null && daysUntilEmpty <= 7) {
      urgency = "projecao";
    }

    if (!urgency) continue;

    // Suggested quantity: cover 14 days of sales or at least (minStock * 2 - current)
    const coverageDays = 14;
    const qtyByHistory = Math.ceil(avgDailySales * coverageDays);
    const qtyByMin = Math.max(0, minStock * 2 - currentStock);
    const suggestedQty = Math.max(qtyByHistory, qtyByMin, 1);

    suggestions.push({
      product_id: product.id,
      product_name: product.name,
      unit: product.unit || "unidade",
      current_stock: currentStock,
      min_stock: minStock,
      avg_daily_sales: avgDailySales,
      days_until_empty: daysUntilEmpty,
      suggested_qty: suggestedQty,
      urgency,
      unit_cost: product.cost_price || 0
    });
  }

  // Sort: critico first, then baixo, then projecao
  const order = { critico: 0, baixo: 1, projecao: 2 };
  return suggestions.sort((a, b) => order[a.urgency] - order[b.urgency]);
}

export default function Replenishment() {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [suggestions, setSuggestions] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['movements-all'],
    queryFn: () => base44.entities.StockMovement.list('-created_date', 500)
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => base44.entities.PurchaseOrder.list('-created_date')
  });

  const computedSuggestions = useMemo(() => {
    if (!products.length) return [];
    return buildSuggestions(products, movements);
  }, [products, movements]);

  const displaySuggestions = suggestions ?? computedSuggestions;

  const toggleSelect = (productId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const updateQty = (productId, qty) => {
    setSuggestions(prev => {
      const list = prev ?? computedSuggestions;
      return list.map(s => s.product_id === productId ? { ...s, suggested_qty: qty } : s);
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === displaySuggestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displaySuggestions.map(s => s.product_id)));
    }
  };

  const selectedItems = displaySuggestions.filter(s => selectedIds.has(s.product_id));

  const criticalCount = displaySuggestions.filter(s => s.urgency === "critico").length;
  const lowCount = displaySuggestions.filter(s => s.urgency === "baixo").length;
  const projectionCount = displaySuggestions.filter(s => s.urgency === "projecao").length;

  const isLoading = loadingProducts || loadingMovements;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Reposição de Estoque</h1>
          <p className="text-slate-500 mt-1">Sugestões automáticas com base em histórico de vendas</p>
        </div>

        <Tabs defaultValue="suggestions">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="suggestions" className="flex-1 md:flex-none">
              Sugestões
              {displaySuggestions.length > 0 && (
                <Badge className="ml-2 bg-amber-600 text-white text-xs">{displaySuggestions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 md:flex-none">
              Pedidos
              {orders.filter(o => o.status === "rascunho").length > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white text-xs">{orders.filter(o => o.status === "rascunho").length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : displaySuggestions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Estoque em dia!</h3>
                <p className="text-slate-500 mt-1">Nenhum produto precisa ser reposto agora.</p>
              </div>
            ) : (
              <>
                {/* Summary badges */}
                <div className="flex flex-wrap gap-2">
                  {criticalCount > 0 && <Badge className="bg-red-100 text-red-700">{criticalCount} crítico{criticalCount > 1 ? 's' : ''}</Badge>}
                  {lowCount > 0 && <Badge className="bg-amber-100 text-amber-700">{lowCount} estoque baixo</Badge>}
                  {projectionCount > 0 && <Badge className="bg-blue-100 text-blue-700">{projectionCount} projeção de falta</Badge>}
                </div>

                {/* Bulk actions */}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={toggleAll} className="gap-2 text-slate-600">
                    {selectedIds.size === displaySuggestions.length
                      ? <><CheckSquare className="w-4 h-4" /> Desselecionar todos</>
                      : <><Square className="w-4 h-4" /> Selecionar todos</>
                    }
                  </Button>
                  {selectedIds.size > 0 && (
                    <Button
                      onClick={() => setShowOrderModal(true)}
                      className="bg-amber-600 hover:bg-amber-700 gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Criar Pedido ({selectedIds.size})
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {displaySuggestions.map(suggestion => (
                    <SuggestionCard
                      key={suggestion.product_id}
                      suggestion={suggestion}
                      selected={selectedIds.has(suggestion.product_id)}
                      onToggle={() => toggleSelect(suggestion.product_id)}
                      onQuantityChange={(qty) => updateQty(suggestion.product_id, qty)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            {loadingOrders ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : (
              <PurchaseOrdersList orders={orders} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateOrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        selectedItems={selectedItems}
        suppliers={suppliers}
        onOrderCreated={() => toast.success("Pedido criado com sucesso!")}
      />
    </div>
  );
}