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

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => base44.entities.Manufacturer.list()
  });

  const { data: printerModels = [] } = useQuery({
    queryKey: ['printerModels'],
    queryFn: () => base44.entities.PrinterModel.list()
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

  // Get toners for selected printer via PrinterModel
  const getTonersForPrinter = (printer) => {
    const printerModel = printerModels.find((m) => m.id === printer?.printer_model_id);
    if (!printerModel?.toner_ids || printerModel.toner_ids.length === 0) return [];
    return printerModel.toner_ids.map((id) => toners.find((t) => t.id === id)).filter(Boolean);
  };

  // Get display info for printer
  const getPrinterDisplayInfo = (printer) => {
    const printerModel = printerModels.find((m) => m.id === printer?.printer_model_id);
    const manufacturer = manufacturers.find((m) => m.id === printerModel?.manufacturer_id);
    return {
      modelName: printerModel?.name || '',
      manufacturerName: manufacturer?.name || ''
    };
  };

  // Prepare printers with display info for selector
  const printersWithInfo = printers.map((p) => {
    const info = getPrinterDisplayInfo(p);
    const printerModel = printerModels.find((m) => m.id === p.printer_model_id);
    return {
      ...p,
      model: `${info.manufacturerName} ${info.modelName}`.trim(),
      image_url: printerModel?.image_url
    };
  });

  const selectedToners = selectedPrinter ? getTonersForPrinter(selectedPrinter) : [];

  const getTonerPosition = (toner) => positions.find((p) => p.toner_id === toner?.id);

  const highlightTonerIds = selectedToners.map((t) => t.id);

  const isLoading = loadingPrinters || loadingToners;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>);

  }

  const selectedPrinterInfo = selectedPrinter ? getPrinterDisplayInfo(selectedPrinter) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Toner-Lager</h1>
          <p className="text-slate-500 mt-1">Finde den richtigen Toner für deinen Drucker</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedPrinter ?
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}>

              <PrinterSelector
              printers={printersWithInfo}
              onSelect={setSelectedPrinter}
              searchValue={searchValue}
              onSearchChange={setSearchValue} />

            </motion.div> :

          <motion.div
            key="result"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6">

              <Button
              variant="ghost"
              onClick={() => setSelectedPrinter(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800">

                <ArrowLeft className="w-4 h-4" />
                Zurück zur Auswahl
              </Button>

              {/* Ausgewählter Drucker */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">Dein Drucker</div>
                <div className="font-semibold text-lg text-slate-800">{selectedPrinter.name}</div>
                <div className="text-sm text-slate-600">
                  {selectedPrinterInfo?.manufacturerName} {selectedPrinterInfo?.modelName}
                </div>
              </div>

              {/* Toner Info */}
              {selectedToners.length > 0 ?
            <>
                  <div className="text-center">
                    <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">

                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {selectedToners.length === 1 ? 'Toner gefunden!' : `${selectedToners.length} Toner gefunden!`}
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    {selectedToners.map((toner, index) =>
                <TonerCard
                  key={toner.id}
                  toner={toner}
                  position={getTonerPosition(toner)}
                  isHighlighted />

                )}
                  </div>

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
                  highlightTonerIds={highlightTonerIds} />

                  </div>
                </> :

            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Kein Toner für diesen Drucker hinterlegt</p>
                  <p className="text-sm text-slate-400 mt-1">Bitte kontaktiere den Admin</p>
                </div>
            }
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}