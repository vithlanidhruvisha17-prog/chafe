import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Instagram, ArrowUpRight } from 'lucide-react';
import Container from '../common/Container';

export default function Footer() {
  return (
    <footer className="bg-forest text-ivory mt-auto border-t border-forest-light">
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Discover */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-ivory mb-5 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coffee" />
              Discover
            </h4>
            <ul className="space-y-3 text-sm text-ivory/80">
              <li>
                <Link to="/menu" className="hover:text-coffee transition-colors inline-flex items-center gap-1">
                  Visual Menu
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/menu?signature=true" className="hover:text-coffee transition-colors">
                  Signature Specials
                </Link>
              </li>
              <li>
                <Link to="/menu?category=the-pour" className="hover:text-coffee transition-colors">
                  The Pour &bull; Brew Bar
                </Link>
              </li>
              <li>
                <Link to="/menu?category=pastas" className="hover:text-coffee transition-colors">
                  Pasta Lab Specials
                </Link>
              </li>
              <li>
                <Link to="/story" className="hover:text-coffee transition-colors">
                  Our Story &bull; Surat Origins
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-coffee transition-colors">
                  Live Order Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Visit ARABISTA */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-ivory mb-5 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coffee" />
              Visit ARABISTA
            </h4>
            <div className="space-y-3.5 text-sm text-ivory/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-coffee mt-1 shrink-0" />
                <div className="leading-relaxed">
                  <p className="font-medium text-ivory">Piplod &ndash; Vesu Main Road</p>
                  <p className="text-xs text-ivory/70 mt-0.5">
                    Opp. Reliance Mall, Piplod
                  </p>
                  <p className="text-xs text-ivory/70">
                    Surat, Gujarat &ndash; 395007
                  </p>
                </div>
              </div>
              <p className="text-xs text-sage leading-relaxed pt-2 border-t border-forest-light">
                Convenient valet parking, garden outdoor deck, and pet-friendly seating available.
              </p>
            </div>
          </div>

          {/* Column 3: Opening Hours */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-ivory mb-5 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coffee" />
              Opening Hours
            </h4>
            <div className="space-y-3.5 text-sm text-ivory/80">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-coffee mt-1 shrink-0" />
                <div className="leading-relaxed">
                  <p className="font-medium text-ivory">Monday &ndash; Sunday</p>
                  <p className="text-xs text-coffee mt-0.5 font-medium">10:00 AM &ndash; 11:30 PM</p>
                  <p className="text-[11px] text-ivory/60 mt-1">
                    Last kitchen order taken at 11:00 PM
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-forest-light text-xs text-ivory/70">
                <p className="font-medium text-ivory">Dine-In &bull; Takeaway</p>
                <p className="text-[11px] text-sage mt-0.5">Freshly pulled all day</p>
              </div>
            </div>
          </div>

          {/* Column 4: Connect With Us */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-ivory mb-5 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coffee" />
              Connect With Us
            </h4>
            <div className="space-y-3 text-sm text-ivory/80">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 hover:text-coffee transition-colors"
              >
                <Phone className="w-4 h-4 text-coffee shrink-0" />
                <span>+91 98765 43210</span>
              </a>

              <a
                href="mailto:hello@arabista.in"
                className="flex items-center gap-2.5 hover:text-coffee transition-colors"
              >
                <Mail className="w-4 h-4 text-coffee shrink-0" />
                <span>hello@arabista.in</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-coffee transition-colors"
              >
                <Instagram className="w-4 h-4 text-coffee shrink-0" />
                <span>@arabista.surat</span>
              </a>

              <div className="pt-4 border-t border-forest-light">
                <Link
                  to="/admin"
                  className="text-xs text-ivory/60 hover:text-coffee transition-colors inline-flex items-center gap-1 font-medium"
                >
                  Staff Portal Sign In &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Tagline */}
        <div className="mt-14 pt-8 border-t border-forest-light flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/60">
          <p>
            &copy; {new Date().getFullYear()} ARABISTA. All rights reserved. Surat, Gujarat.
          </p>
          <p className="font-serif text-ivory/75 italic">
            Where Artisanal Brews Meet Conscious Living
          </p>
        </div>
      </Container>
    </footer>
  );
}
