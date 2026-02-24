import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

export default function LowStockAlert({ products }) {
  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock && p.is_active);

  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-emerald-700 font-medium">Estoque em dia!</p>
          <p className="text-emerald-600 text-sm mt-1">Todos os produtos estão com estoque adequado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
          Estoque Baixo ({lowStockProducts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lowStockProducts.slice(0, 5).map(product => (
          <Link 
            key={product.id} 
            to={createPageUrl("Products")}
            className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-800">{product.name}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {categoryLabels[product.category]}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-600">{product.current_stock}</p>
              <p className="text-xs text-slate-500">mín: {product.min_stock}</p>
            </div>
          </Link>
        ))}
        {lowStockProducts.length > 5 && (
          <p className="text-sm text-center text-slate-500">
            +{lowStockProducts.length - 5} produtos
          </p>
        )}
      </CardContent>
    </Card>
  );
}