import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, Loader2 } from "lucide-react";

const categories = [
  { value: "paes", label: "Pães" },
  { value: "bolos", label: "Bolos" },
  { value: "salgados", label: "Salgados" },
  { value: "doces", label: "Doces" },
  { value: "bebidas", label: "Bebidas" },
  { value: "lanches", label: "Lanches" },
  { value: "ingredientes", label: "Ingredientes" },
  { value: "outros", label: "Outros" }
];

const units = [
  { value: "unidade", label: "Unidade" },
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "litro", label: "Litro" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "pacote", label: "Pacote" },
  { value: "caixa", label: "Caixa" }
];

export default function ProductForm({ open, onClose, product, onSave }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "outros",
    unit: "unidade",
    cost_price: "",
    sale_price: "",
    min_stock: "5",
    is_active: true
  });

  const [targetMargin, setTargetMargin] = useState("50");

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        category: product.category || "outros",
        unit: product.unit || "unidade",
        cost_price: product.cost_price?.toString() || "",
        sale_price: product.sale_price?.toString() || "",
        min_stock: product.min_stock?.toString() || "5",
        is_active: product.is_active !== false
      });
    } else {
      setForm({
        name: "",
        category: "outros",
        unit: "unidade",
        cost_price: "",
        sale_price: "",
        min_stock: "5",
        is_active: true
      });
    }
  }, [product, open]);

  const calculateSuggestedPrice = () => {
    const cost = parseFloat(form.cost_price);
    const margin = parseFloat(targetMargin);
    if (cost && margin) {
      const suggested = cost * (1 + margin / 100);
      setForm({ ...form, sale_price: suggested.toFixed(2) });
    }
  };

  const currentMargin = () => {
    const cost = parseFloat(form.cost_price);
    const sale = parseFloat(form.sale_price);
    if (cost && sale) {
      return ((sale - cost) / cost * 100).toFixed(1);
    }
    return "0";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await onSave({
      ...form,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      min_stock: parseInt(form.min_stock) || 5,
      current_stock: product?.current_stock || 0
    });
    
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Produto *</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Pão Francês"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <p className="font-medium text-sm text-slate-700 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Precificação
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preço de Custo (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Preço de Venda (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs">Margem desejada (%)</Label>
                <Input 
                  type="number"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  className="h-8"
                />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={calculateSuggestedPrice} className="mt-5">
                Calcular
              </Button>
            </div>

            {form.cost_price && form.sale_price && (
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-xs text-slate-500">Margem atual</p>
                <p className="text-xl font-bold text-emerald-600">{currentMargin()}%</p>
              </div>
            )}
          </div>

          <div>
            <Label>Estoque Mínimo (alerta)</Label>
            <Input 
              type="number"
              min="0"
              value={form.min_stock}
              onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <Label className="cursor-pointer">Produto Ativo</Label>
            <Switch 
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}