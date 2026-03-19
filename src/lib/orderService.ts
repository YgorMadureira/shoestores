import { supabaseERP, type Product } from '@/lib/supabase';
import type { CartItem } from '@/hooks/useCart';

const COMPANY_ID = 'default';

export type OrderData = {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerCep: string;
  shippingCost: number;
};

export async function createOrder(order: OrderData) {
  const errors: string[] = [];

  for (const item of order.items) {
    // 1. Get current stock
    const { data: product, error: fetchErr } = await supabaseERP
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product.id)
      .single();

    if (fetchErr || !product) {
      errors.push(`Produto ${item.product.name} não encontrado`);
      continue;
    }

    if (product.stock_quantity < item.quantity) {
      errors.push(`Estoque insuficiente para ${item.product.name} (disponível: ${product.stock_quantity})`);
      continue;
    }

    const quantityBefore = product.stock_quantity;
    const quantityAfter = quantityBefore - item.quantity;

    // 2. Insert sale record
    const { error: saleErr } = await supabaseERP.from('sales').insert({
      company_id: COMPANY_ID,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.unit_price,
      total_amount: item.product.unit_price * item.quantity,
      sale_date: new Date().toISOString(),
      status: 'pending',
      source: 'website',
    });

    if (saleErr) {
      errors.push(`Erro ao registrar venda de ${item.product.name}: ${saleErr.message}`);
      continue;
    }

    // 3. Update stock
    const { error: stockErr } = await supabaseERP
      .from('products')
      .update({ stock_quantity: quantityAfter })
      .eq('id', item.product.id);

    if (stockErr) {
      errors.push(`Erro ao atualizar estoque de ${item.product.name}: ${stockErr.message}`);
    }

    // 4. Insert inventory log
    const { error: logErr } = await supabaseERP.from('inventory_logs').insert({
      company_id: COMPANY_ID,
      product_id: item.product.id,
      type: 'sale',
      quantity_change: -item.quantity,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      justification: `Venda via website`,
    });

    if (logErr) {
      errors.push(`Erro ao registrar log de ${item.product.name}: ${logErr.message}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, errors: [] };
}
