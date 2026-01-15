import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PrinterSelector from '@/components/printer/PrinterSelector';
import ShelfGrid from '@/components/shelf/ShelfGrid';
import TonerCard from '@/components/toner/TonerCard';

export default function Home() {
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const { data: printers = [], isLoading: loadingPrinters } = useQuery({
    queryKey: ['printers'],
    queryFn: () => base44.entities.Printer.list()
  });

  const { data: toners = [], isLoading: loadingToners } = useQuery({
    queryKey: ['toners'],
    queryFn: () => base44.entities.Toner.list()
  });

  const { data: shelfConfigs = [] } = useQuery({
    queryKey: ['shelfConfig'],
    queryFn: () => base44.entities.ShelfConfig.list()
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: () => base44.entities.ShelfPosition.list()
  });

  const shelfConfig = shelfConfigs[0] || { rows: 4, columns: 6 };
  
  const selectedToner = selectedPrinter?.toner_id 
    ? toners.find(t => t.id === selectedPrinter.toner_id)
    : null;

  const tonerPosition = selectedToner 
    ? positions.find(p => p.toner_id === selectedToner.id)
    : null;

  const isLoading = loadingPrinters || loadingToners;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Toner-Lager</h1>
          <p className="text-slate-500 mt-1">Finde den richtigen Toner für deinen Drucker</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedPrinter ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <PrinterSelector
                printers={printers}
                onSelect={setSelectedPrinter}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Button
                variant="ghost"
                onClick={() => setSelectedPrinter(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Auswahl
              </Button>

              {/* Ausgewählter Drucker */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">Dein Drucker</div>
                <div className="font-semibold text-lg text-slate-800">{selectedPrinter.name}</div>
                <div className="text-sm text-slate-600">{selectedPrinter.model}</div>
              </div>

              {/* Toner Info */}
              {selectedToner ? (
                <>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Toner gefunden!
                    </motion.div>
                  </div>

                  <TonerCard 
                    toner={selectedToner} 
                    position={tonerPosition}
                    isHighlighted 
                  />

                  {/* Regal-Ansicht */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-3 text-center">
                      Position im Regal
                    </h3>
                    <ShelfGrid
                      rows={shelfConfig.rows}
                      columns={shelfConfig.columns}
                      positions={positions}
                      toners={toners}
                      highlightTonerId={selectedToner.id}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Kein Toner für diesen Drucker hinterlegt</p>
                  <p className="text-sm text-slate-400 mt-1">Bitte kontaktiere den Admin</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}