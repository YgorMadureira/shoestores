import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-4">ShoeStore</h3>
            <p className="text-sm font-body text-primary-foreground/60 leading-relaxed">
              Moda com elegância e sofisticação. Peças selecionadas para quem valoriza estilo e qualidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
              Navegação
            </h4>
            <ul className="space-y-2">
              {['Início', 'Loja', 'Categorias', 'Sobre Nós'].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm font-body text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-body text-primary-foreground/70">
                <Phone size={14} className="text-gold shrink-0" />
                (11) 99999-0000
              </li>
              <li className="flex items-center gap-2 text-sm font-body text-primary-foreground/70">
                <Mail size={14} className="text-gold shrink-0" />
                contato@shoestore.com
              </li>
              <li className="flex items-start gap-2 text-sm font-body text-primary-foreground/70">
                <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                São Paulo, SP – Brasil
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
              Redes Sociais
            </h4>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-gold hover:border-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-gold hover:border-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center">
          <p className="text-xs font-body text-primary-foreground/40">
            © {new Date().getFullYear()} ShoeStore. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
