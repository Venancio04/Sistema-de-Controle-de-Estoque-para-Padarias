import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/products/ProductCard";
import ProductForm from "@/components/products/ProductForm";
import StockMovementForm from "@/components/products/StockMovementForm";

const categories = [
  { value: "all", label: "Todas" },
  { value: "paes", label: "Pães" },
  { value: "bolos", label: "Bolos" },
  { value: "salgados", label: "Salgados" },
  { value: "doces", label: "Doces" },
  { value: "bebidas", label: "Bebidas" },
  { value: "lanches", label: "Lanches" },
  { value: "ingredientes", label: "Ingredientes" },
  { value: "outros", label: "Outros" }
];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showActive, setShowActive] = useState("active");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const createMovementMutation = useMutation({
    mutationFn: (data) => base44.entities.StockMovement.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movements'] })
  });

  const handleSaveProduct = async (data) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingProduct(null);
  };

  const handleSaveMovement = async (movementData, newStock) => {
    await createMovementMutation.mutateAsync(movementData);
    await updateMutation.mutateAsync({ 
      id: stockProduct.id, 
      data: { current_stock: newStock } 
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    const matchesActive = showActive === "all" || 
      (showActive === "active" && p.is_active !== false) ||
      (showActive === "inactive" && p.is_active === false);
    return matchesSearch && matchesCategory && matchesActive;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Produtos</h1>
            <p className="text-slate-500 mt-1">Gerencie seu catálogo de produtos</p>
          </div>
          <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={showActive} onValueChange={setShowActive}>
            <TabsList>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Nenhum produto encontrado</h3>
            <p className="text-slate-500 mt-1">Cadastre seu primeiro produto para começar</p>
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Produto
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
                onStock={(p) => setStockProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      <ProductForm 
        open={showForm}
        onClose={() => { setShowForm(false); setEditingProduct(null); }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <StockMovementForm 
        open={!!stockProduct}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
        onSave={handleSaveMovement}
      />
    </div>
  );
}