import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShoppingCart, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreateOrderModal({ open, onClose, selectedItems, suppliers, onOrderCreated }) {
  const [supplierId, setSupplierId] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [addingNewSupplier, setAddingNewSupplier] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const totalEstimated = selectedItems.reduce((acc, item) => 
    acc + (item.suggested_qty * (item.unit_cost || 0)), 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalSupplierId = supplierId;
    let finalSupplierName = "";

    if (addingNewSupplier && newSupplierName) {
      const newSupplier = await base44.entities.Supplier.create({ name: newSupplierName });
      finalSupplierId = newSupplier.id;
      finalSupplierName = newSupplierName;
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    } else {
      const supplier = suppliers.find(s => s.id === supplierId);
      finalSupplierName = supplier?.name || "";
    }

    const order = await base44.entities.PurchaseOrder.create({
      supplier_id: finalSupplierId,
      supplier_name: finalSupplierName,
      status: "rascunho",
      items: selectedItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.suggested_qty,
        unit: item.unit,
        unit_cost: item.unit_cost || 0
      })),
      notes,
      total_estimated: totalEstimated
    });

    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    setLoading(false);
    onOrderCreated(order);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            Criar Pedido de Compra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier */}
          <div>
            <Label>Fornecedor</Label>
            {!addingNewSupplier ? (
              <div className="flex gap-2 mt-1">
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setAddingNewSupplier(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Nome do novo fornecedor"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setAddingNewSupplier(false)}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* Items Summary */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-2">
            <p className="text-sm font-medium text-slate-700">Itens do pedido ({selectedItems.length})</p>
            {selectedItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.product_name}</span>
                <span className="font-medium">{item.suggested_qty} {item.unit}</span>
              </div>
            ))}
            {totalEstimated > 0 && (
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total estimado</span>
                <span className="text-amber-700">R$ {totalEstimated.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções de entrega, prazo, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              disabled={loading || (!supplierId && !newSupplierName) || selectedItems.length === 0}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Rascunho
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}