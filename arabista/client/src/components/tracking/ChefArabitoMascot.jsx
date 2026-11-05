import React from 'react';
import { Sparkles, Coffee, Flame, CheckCircle, Clock } from 'lucide-react';

/**
 * Chef Arabito illustrated mascot component
 * Exclusively styled using the 5 Arabista palette colours:
 * Forest Green #173D32, Warm Ivory #F6F1E7, Sage #A5AF96, Coffee Tan #B78B59, Charcoal #242321
 */
export default function ChefArabitoMascot({ status, orderType, tableNumber }) {
  // Dialogue and messages dynamically tailored per order status
  const mascotContent = {
    PLACED: {
      tag: 'Ticket Received',
      tagIcon: Clock,
      title: 'Ahlan wa Sahlan! I have your ticket.',
      message:
        'Chef Arabito has pinned your order to our live station. Single-origin Arabica beans and fresh farm ingredients are being weighed and staged.',
      note:
        orderType === 'DINE_IN'
          ? `We'll bring everything over to Table ${tableNumber || 'your table'} fresh from the pass.`
          : 'Your takeaway ticket is in queue. We will package it piping fresh for you.',
      quote: '“Every artisanal recipe begins with mindful preparation.”',
      expression: 'welcoming',
    },
    PREPARING: {
      tag: 'Cooking & Pulling Espresso',
      tagIcon: Flame,
      title: 'In the Zone & Sizzling!',
      message:
        orderType === 'DINE_IN'
          ? `Chef Arabito is currently working on your creations. Sauces are simmering, and 48-hour fermented sourdough is baking on stone decks.`
          : 'Our baristas and line chefs are crafting your order right now with calibrated extraction pressure and freshly ground beans.',
      note:
        orderType === 'DINE_IN'
          ? `Table ${tableNumber || 'your table'} is about to experience genuine Surat hospitality.`
          : 'Hold tight at the front counter—your fresh packaging is coming together.',
      quote: '“Patience brews the most memorable cups.”',
      expression: 'cooking',
    },
    READY: {
      tag: 'Freshly Plated & Ready',
      tagIcon: CheckCircle,
      title: 'Delizioso! Your order is ready!',
      message:
        orderType === 'DINE_IN'
          ? `Garnished with fresh herbs and poured to perfection. Our café staff is carrying it straight over to Table ${tableNumber || 'your table'}.`
          : 'Your artisan order is neatly boxed and sitting warm at the Arabista front counter. Please present your order code to collect.',
      note: 'Please savor while hot and let us know if you need anything else!',
      quote: '“Made with passion, served with pride.”',
      expression: 'celebrating',
    },
    COMPLETED: {
      tag: 'Order Fulfilled',
      tagIcon: Sparkles,
      title: 'Hope you loved every bite & sip!',
      message:
        'Chef Arabito and the whole Arabista family thank you for joining us today. We hope our flavours brought joy to your table.',
      note: 'We look forward to welcoming you back for another artisanal ritual soon.',
      quote: '“Until next time, may your days be aromatic.”',
      expression: 'grateful',
    },
    CANCELLED: {
      tag: 'Order Cancelled',
      tagIcon: Clock,
      title: 'Order has been cancelled',
      message:
        'This ticket was marked cancelled. If this was an accident or you require assistance, please speak with our counter staff.',
      note: 'Our team is always ready to assist you.',
      quote: '“We are here to help whenever you need.”',
      expression: 'neutral',
    },
  };

  const current = mascotContent[status] || mascotContent.PLACED;
  const TagIcon = current.tagIcon;

  return (
    <div className="rounded-3xl bg-ivory border-2 border-sage/40 shadow-soft p-6 sm:p-8 overflow-hidden relative">
      {/* Background Subtle Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-forest pointer-events-none">
        <Coffee className="w-56 h-56" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Chef Arabito Mascot SVG Avatar (Strictly 5 Palette Colours) */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-sage/20 border-2 border-forest/30 flex items-center justify-center p-2 shadow-inner-soft">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-sm select-none"
              aria-label="Chef Arabito Mascot"
            >
              {/* Soft background aura */}
              <circle cx="100" cy="100" r="90" fill="#A5AF96" fillOpacity="0.25" />

              {/* Chef Arabito Body / Coat (#173D32 Forest Green) */}
              <path
                d="M 45 190 Q 50 135 100 135 Q 150 135 155 190 Z"
                fill="#173D32"
              />

              {/* White/Ivory Double-breasted Fold (#F6F1E7) */}
              <path
                d="M 82 135 L 118 135 L 112 190 L 88 190 Z"
                fill="#F6F1E7"
              />

              {/* Chef Coat Buttons (#B78B59 Coffee Tan) */}
              <circle cx="93" cy="150" r="2.5" fill="#B78B59" />
              <circle cx="107" cy="150" r="2.5" fill="#B78B59" />
              <circle cx="93" cy="165" r="2.5" fill="#B78B59" />
              <circle cx="107" cy="165" r="2.5" fill="#B78B59" />

              {/* Sage Neckerchief (#A5AF96) */}
              <polygon points="100,140 86,128 114,128" fill="#A5AF96" />
              <polygon points="100,140 94,148 106,148" fill="#8C977B" />

              {/* Neck (#B78B59 Coffee Tan) */}
              <rect x="91" y="118" width="18" height="15" rx="3" fill="#B78B59" />

              {/* Face (#B78B59 Coffee Tan Warm Tone) */}
              <circle cx="100" cy="98" r="32" fill="#B78B59" />

              {/* Ears */}
              <circle cx="68" cy="98" r="6" fill="#9E7444" />
              <circle cx="132" cy="98" r="6" fill="#9E7444" />

              {/* Cheeks / Warm Blush (#A5AF96 Sage Tint) */}
              <ellipse cx="80" cy="105" rx="5" ry="3" fill="#A5AF96" fillOpacity="0.4" />
              <ellipse cx="120" cy="105" rx="5" ry="3" fill="#A5AF96" fillOpacity="0.4" />

              {/* Eyes (#242321 Charcoal) */}
              {status === 'READY' || status === 'COMPLETED' ? (
                // Happy curved eyes
                <>
                  <path
                    d="M 82 92 Q 87 86 92 92"
                    stroke="#242321"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 108 92 Q 113 86 118 92"
                    stroke="#242321"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </>
              ) : (
                // Friendly round eyes with shine
                <>
                  <circle cx="87" cy="91" r="3" fill="#242321" />
                  <circle cx="88" cy="90" r="1" fill="#F6F1E7" />
                  <circle cx="113" cy="91" r="3" fill="#242321" />
                  <circle cx="114" cy="90" r="1" fill="#F6F1E7" />
                </>
              )}

              {/* Eyebrows (#242321) */}
              <path
                d="M 80 84 Q 87 81 94 85"
                stroke="#242321"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 106 85 Q 113 81 120 84"
                stroke="#242321"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Friendly Nose */}
              <circle cx="100" cy="97" r="3" fill="#9E7444" />

              {/* Chef Arabito Iconic Gentleman Mustache (#242321 Charcoal) */}
              <path
                d="M 100 102 C 90 98 80 103 76 109 C 84 109 94 106 100 106 C 106 106 116 109 124 109 C 120 103 110 98 100 102 Z"
                fill="#242321"
              />

              {/* Warm Smile (#F6F1E7) */}
              <path
                d="M 92 111 Q 100 119 108 111"
                stroke="#242321"
                strokeWidth="2"
                strokeLinecap="round"
                fill="#F6F1E7"
              />

              {/* Chef Hat Brim (#173D32 Forest Green) */}
              <rect x="68" y="70" width="64" height="10" rx="4" fill="#173D32" />

              {/* Toque / Tall Chef Hat Pouf (#F6F1E7 Warm Ivory) */}
              <path
                d="M 72 70 C 65 50 68 32 90 30 C 95 24 105 24 110 30 C 132 32 135 50 128 70 Z"
                fill="#F6F1E7"
                stroke="#A5AF96"
                strokeWidth="1.5"
              />

              {/* Hat Pleats (#A5AF96) */}
              <path d="M 88 38 Q 89 54 87 69" stroke="#A5AF96" strokeWidth="1" strokeLinecap="round" fill="none" />
              <path d="M 100 30 Q 100 52 100 69" stroke="#A5AF96" strokeWidth="1" strokeLinecap="round" fill="none" />
              <path d="M 112 38 Q 111 54 113 69" stroke="#A5AF96" strokeWidth="1" strokeLinecap="round" fill="none" />

              {/* Dynamic Status Prop Overlay */}
              {status === 'PREPARING' && (
                // Sizzling pan / steam bubbles
                <g>
                  <circle cx="145" cy="140" r="14" fill="#242321" />
                  <rect x="155" y="145" width="22" height="4" rx="2" fill="#B78B59" transform="rotate(-15 155 145)" />
                  {/* Steam curls */}
                  <path d="M 140 120 Q 143 110 138 102" stroke="#B78B59" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M 148 116 Q 152 106 146 98" stroke="#B78B59" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              )}

              {status === 'READY' && (
                // Cloche serving dome with sparkles
                <g>
                  <path d="M 130 150 Q 150 125 170 150 Z" fill="#F6F1E7" stroke="#B78B59" strokeWidth="1.5" />
                  <circle cx="150" cy="125" r="3" fill="#B78B59" />
                  <line x1="125" y1="151" x2="175" y2="151" stroke="#173D32" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Sparkle */}
                  <polygon points="172,118 175,123 180,123 176,126 177,131 172,128 167,131 169,126 164,123 170,123" fill="#B78B59" />
                </g>
              )}

              {(status === 'PLACED' || status === 'COMPLETED' || status === 'CANCELLED') && (
                // Signature Arabista warm cup
                <g>
                  <path d="M 140 148 C 140 162 160 162 160 148 Z" fill="#F6F1E7" stroke="#173D32" strokeWidth="1.5" />
                  <path d="M 160 151 C 165 151 165 157 160 157" stroke="#173D32" strokeWidth="1.5" fill="none" />
                  <path d="M 148 140 Q 150 132 147 126" stroke="#B78B59" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </g>
              )}
            </svg>
          </div>

          <span className="text-[11px] font-serif font-bold text-forest tracking-widest uppercase mt-2.5">
            Chef Arabito
          </span>
        </div>

        {/* Mascot Speech Dialogue Bubble */}
        <div className="flex-1 space-y-3 text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-forest text-ivory text-xs font-semibold uppercase tracking-wider shadow-sm">
            <TagIcon className="w-3.5 h-3.5 text-coffee" />
            <span>{current.tag}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest leading-tight">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-charcoal/80 font-sans leading-relaxed">
            {current.message}
          </p>

          <div className="p-3.5 rounded-2xl bg-sage/15 border border-sage/30 text-xs text-charcoal/90 font-medium">
            <p>{current.note}</p>
          </div>

          <p className="text-[11px] font-serif italic text-coffee">
            {current.quote}
          </p>
        </div>
      </div>
    </div>
  );
}
