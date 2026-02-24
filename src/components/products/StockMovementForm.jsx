import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StockMovementForm({ open, onClose, product, onSave }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("entrada");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const qty = parseInt(quantity);
    const previousStock = product.current_stock || 0;
    let newStock = previousStock;
    
    if (type === "entrada") {
      newStock = previousStock + qty;
    } else if (type === "saida") {
      newStock = Math.max(0, previousStock - qty);
    } else {
      newStock = qty;
    }

    await onSave({
      product_id: product.id,
      product_name: product.name,
      type,
      quantity: qty,
      reason,
      previous_stock: previousStock,
      new_stock: newStock
    }, newStock);
    
    setLoading(false);
    setQuantity("");
    setReason("");
    setType("entrada");
    onClose();
  };

  const previewStock = () => {
    const qty = parseInt(quantity) || 0;
    const current = product?.current_stock || 0;
    
    if (type === "entrada") return current + qty;
    if (type === "saida") return Math.max(0, current - qty);
    return qty;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Movimentar Estoque</DialogTitle>
        </DialogHeader>
        
        {product && (
          <div className="p-3 bg-slate-50 rounded-lg text-center mb-2">
            <p className="font-semibold text-slate-800">{product.name}</p>
            <p className="text-sm text-slate-500">Estoque atual: {product.current_stock || 0} {product.unit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-3 gap-2">
            <div>
              <RadioGroupItem value="entrada" id="entrada" className="peer sr-only" />
              <Label 
                htmlFor="entrada" 
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  type === "entrada" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <ArrowUpCircle className={cn("w-6 h-6 mb-1", type === "entrada" ? "text-emerald-600" : "text-slate-400")} />
                <span className="text-sm font-medium">Entrada</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="saida" id="saida" className="peer sr-only" />
              <Label 
                htmlFor="saida"
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  type === "saida" ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <ArrowDownCircle className={cn("w-6 h-6 mb-1", type === "saida" ? "text-red-600" : "text-slate-400")} />
                <span className="text-sm font-medium">Saída</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="ajuste" id="ajuste" className="peer sr-only" />
              <Label 
                htmlFor="ajuste"
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  type === "ajuste" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <RefreshCw className={cn("w-6 h-6 mb-1", type === "ajuste" ? "text-blue-600" : "text-slate-400")} />
                <span className="text-sm font-medium">Ajuste</span>
              </Label>
            </div>
          </RadioGroup>

          <div>
            <Label>
              {type === "ajuste" ? "Novo valor do estoque" : "Quantidade"}
            </Label>
            <Input 
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          {quantity && (
            <div className="p-3 bg-slate-100 rounded-lg text-center">
              <p className="text-sm text-slate-500">Novo estoque</p>
              <p className="text-2xl font-bold text-slate-800">{previewStock()} {product?.unit}</p>
            </div>
          )}

          <div>
            <Label>Motivo (opcional)</Label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Compra do fornecedor, venda, quebra..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !quantity} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}