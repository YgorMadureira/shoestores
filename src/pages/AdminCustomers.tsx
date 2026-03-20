import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';

type Customer = {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  phone: string | null;
  created_at: string;
};

export default function AdminCustomers() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/admin');
  }, [user, isAdmin, authLoading, navigate]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    // As per migrations, admins have read access to all customers
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      setCustomers(data as Customer[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && isAdmin) fetchCustomers();
  }, [user, isAdmin, fetchCustomers]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center h-16 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="font-display text-lg font-bold">Gestão de Clientes</h1>
        </div>
      </header>

      <main className="flex-1 container py-8">
        {loading ? (
          <div className="space-y-4">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-16 rounded" />
             ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-muted-foreground text-sm font-body">
              Os usuários que se cadastrarem no site aparecerão aqui.
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left font-body">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nome</th>
                    <th className="px-6 py-4 font-medium">E-mail</th>
                    <th className="px-6 py-4 font-medium">CPF</th>
                    <th className="px-6 py-4 font-medium">Telefone</th>
                    <th className="px-6 py-4 font-medium text-right">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{c.full_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {c.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{c.phone || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground text-right">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
