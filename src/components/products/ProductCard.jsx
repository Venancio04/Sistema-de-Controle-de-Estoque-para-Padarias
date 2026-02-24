import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, TrendingUp, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels = {
  paes: "Pães",
  bolos: "Bolos",
  salgados: "Salgados",
  doces: "Doces",
  bebidas: "Bebidas",
  lanches: "Lanches",
  ingredientes: "Ingredientes",
  outros: "Outros"
};

const categoryColors = {
  paes: "bg-amber-100 text-amber-800",
  bolos: "bg-pink-100 text-pink-800",
  salgados: "bg-orange-100 text-orange-800",
  doces: "bg-purple-100 text-purple-800",
  bebidas: "bg-blue-100 text-blue-800",
  lanches: "bg-green-100 text-green-800",
  ingredientes: "bg-slate-100 text-slate-800",
  outros: "bg-gray-100 text-gray-800"
};

export default function ProductCard({ product, onEdit, onStock }) {
  const margin = product.sale_price && product.cost_price 
    ? ((product.sale_price - product.cost_price) / product.cost_price * 100).toFixed(0)
    : null;

  const isLowStock = product.current_stock <= product.min_stock;

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      isLowStock && "border-amber-300 bg-amber-50/50"
    )}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-slate-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
              <Badge className={cn("text-xs mt-1", categoryColors[product.category])}>
                {categoryLabels[product.category]}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="flex-shrink-0">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Custo</p>
              <p className="font-medium">R$ {(product.cost_price || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Venda</p>
              <p className="font-semibold text-emerald-600">R$ {(product.sale_price || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Margem</p>
              <p className={cn("font-medium flex items-center gap-1", margin >= 50 ? "text-emerald-600" : margin >= 30 ? "text-amber-600" : "text-red-600")}>
                <TrendingUp className="w-3 h-3" />
                {margin || 0}%
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              isLowStock ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-700"
            )}>
              Estoque: {product.current_stock} {product.unit}
            </div>
            <Button size="sm" variant="outline" onClick={() => onStock(product)}>
              Movimentar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}