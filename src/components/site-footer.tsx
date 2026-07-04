import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-onyx/60 mt-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <h4 className="font-display text-xl gold-gradient-text mb-3">AURELIA MOTORS</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A private atelier of the world's most exceptional automobiles.
            Curated for connoisseurs, delivered globally.
          </p>
        </div>
        <div>
          <h5 className="text-sm tracking-widest text-primary mb-3">EXPLORE</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/cars" className="hover:text-primary">Collection</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm tracking-widest text-primary mb-3">CONCIERGE</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="https://wa.me/201221996350?text=Hello%20Osama%2C%20I%27m%20interested%20in%20a%20car%20from%20your%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                +20 122 199 6350 (WhatsApp)
              </a>
            </li>
            <li>concierge@osama.co</li>

            <li>By appointment only</li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm tracking-widest text-primary mb-3">FOLLOW</h5>
          <div className="flex gap-3">
            <a href="#" className="p-2 rounded-full gold-border hover:bg-primary/10"><Instagram className="size-4"/></a>
            <a href="#" className="p-2 rounded-full gold-border hover:bg-primary/10"><Twitter className="size-4"/></a>
            <a href="#" className="p-2 rounded-full gold-border hover:bg-primary/10"><Youtube className="size-4"/></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} OSAMA. All rights reserved.
      </div>
    </footer>
  );
}
