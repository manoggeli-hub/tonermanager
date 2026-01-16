import React from 'react';
import { motion } from 'framer-motion';
import { Printer, ChevronRight, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function PrinterSelector({ printers, onSelect, searchValue, onSearchChange }) {
  const filteredPrinters = printers.filter(p => 
    p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.model.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Drucker suchen..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-lg bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        {filteredPrinters.map((printer, index) => (
          <motion.button
            key={printer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(printer)}
            className={cn(
              "w-full p-4 rounded-xl bg-white border-2 border-slate-100",
              "flex items-center gap-4 text-left",
              "hover:border-indigo-300 hover:shadow-md transition-all duration-200",
              "active:scale-[0.98]"
            )}
          >
            {printer.image_url ? (
              <img src={printer.image_url} alt={printer.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Printer className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{printer.name}</h3>
              <p className="text-sm text-slate-500 truncate">{printer.model}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </motion.button>
        ))}

        {filteredPrinters.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Printer className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Drucker gefunden</p>
          </div>
        )}
      </div>
    </div>
  );
}