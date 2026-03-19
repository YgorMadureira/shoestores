import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { calculateShipping, type ShippingOption } from '@/lib/shippingService';
import { createOrder } from '@/lib/orderService';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Truck, CheckCircle2, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingCalculated, setShippingCalculated] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const shippingCost = selectedShipping !== null ? shippingOptions[selectedShipping]?.price ?? 0 : 0;
  const grandTotal = totalPrice + shippingCost;

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setShippingCalculated(false);
    setSelectedShipping(null);
  };

  const handleCalculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error('Informe um CEP válido com 8 dígitos');
      return;
    }
    setLoadingShipping(true);
    const options = await calculateShipping(cleanCep);
    setShippingOptions(options);
    setShippingCalculated(true);
    if (options.length > 0) setSelectedShipping(0);
    setLoadingShipping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !cep || !address || !number || !city || !state) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (selectedShipping === null && shippingOptions.length > 0) {
      toast.error('Selecione uma opção de frete');
      return;
    }

    setSubmitting(true);
    const result = await createOrder({
      items,
      customerName: name,
      customerEmail: email,
      customerCep: cep.replace(/\D/g, ''),
      shippingCost,
    });

    if (result.success) {
      setOrderComplete(true);
      clearCart();
      toast.success('Pedido realizado com sucesso!');
    } else {
      result.errors.forEach((err) => toast.error(err));
    }
    setSubmitting(false);
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-20 text-center">
          <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="font-display text-2xl text-foreground mb-2">Carrinho vazio</h2>
          <p className="text-muted-foreground text-sm font-body mb-6">Adicione produtos antes de finalizar</p>
          <Link to="/shop">
            <Button variant="hero">Ir para a Loja</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
            <CheckCircle2 size={64} className="mx-auto text-gold mb-6" />
          </motion.div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">Pedido Confirmado!</h2>
          <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
            Obrigado pela sua compra. Você receberá um e-mail com os detalhes do pedido.
          </p>
          <Link to="/shop">
            <Button variant="hero">Continuar Comprando</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={14} /> Voltar ao Carrinho
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal info */}
                <section className="bg-card border border-border p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-5">Dados Pessoais</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Nome Completo *
                      </Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        E-mail *
                      </Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Telefone
                      </Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="bg-card border border-border p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-5">Endereço de Entrega</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cep" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        CEP *
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="cep"
                          value={cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCalculateShipping}
                          disabled={loadingShipping}
                          className="shrink-0"
                        >
                          {loadingShipping ? <Loader2 size={14} className="animate-spin" /> : 'Calcular'}
                        </Button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Endereço *
                      </Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="number" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Número *
                      </Label>
                      <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="complement" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Complemento
                      </Label>
                      <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Cidade *
                      </Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-xs font-body font-medium tracking-wide uppercase text-muted-foreground">
                        Estado *
                      </Label>
                      <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required className="mt-1.5" maxLength={2} placeholder="UF" />
                    </div>
                  </div>

                  {/* Shipping options */}
                  <AnimatePresence>
                    {shippingCalculated && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-5 border-t border-border"
                      >
                        <h3 className="text-xs font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3 flex items-center gap-2">
                          <Truck size={14} /> Opções de Frete
                        </h3>
                        {shippingOptions.length === 0 ? (
                          <p className="text-sm font-body text-muted-foreground">
                            Nenhuma opção de frete disponível para este CEP.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {shippingOptions.map((opt, i) => (
                              <label
                                key={i}
                                className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                                  selectedShipping === i
                                    ? 'border-gold bg-gold/5'
                                    : 'border-border hover:border-muted-foreground/30'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="shipping"
                                    checked={selectedShipping === i}
                                    onChange={() => setSelectedShipping(i)}
                                    className="accent-[hsl(var(--gold))]"
                                  />
                                  <div>
                                    <p className="text-sm font-body font-medium text-foreground">
                                      {opt.carrier_name || 'Transportadora'}
                                    </p>
                                    {opt.delivery_days && (
                                      <p className="text-xs font-body text-muted-foreground">
                                        {opt.delivery_days} dias úteis
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm font-body font-semibold text-foreground">
                                  {formatPrice(opt.price)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border p-6 sticky top-24">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-5">Seu Pedido</h2>

                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-14 h-18 bg-secondary shrink-0 overflow-hidden">
                          <img
                            src={item.product.image_url || item.product.images?.[0] || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-medium text-foreground truncate">{item.product.name}</p>
                          <p className="text-xs font-body text-muted-foreground">Qtd: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-body font-semibold text-foreground shrink-0">
                          {formatPrice(item.product.unit_price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-foreground">
                        {selectedShipping !== null ? formatPrice(shippingCost) : '—'}
                      </span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-display text-base font-semibold text-foreground">Total</span>
                      <span className="font-display text-xl font-bold text-foreground">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full mt-6"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Processando...
                      </span>
                    ) : (
                      'Finalizar Pedido'
                    )}
                  </Button>

                  <p className="text-[11px] font-body text-muted-foreground text-center mt-3">
                    Ao finalizar, você concorda com nossos termos de uso.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
