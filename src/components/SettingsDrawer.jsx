import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/components/theme-provider';

const SettingsDrawer = ({ onOpenSettings, fontSize, setFontSize, highlightSeg, setHighlightSeg, autoExplain, setAutoExplain }) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);


  const backdropRef = useRef(null);
  const close = () => setOpen(false);



  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (backdropRef.current && e.target === backdropRef.current) close();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <Button variant="ghost" size="icon" className="p-0" onClick={() => setOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              ref={backdropRef}
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 bg-card text-card-foreground shadow-xl rounded-r-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={close}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Theme Toggle */}
                <div className="space-y-2">
                  <h3 className="font-medium">Theme</h3>
                  <div className="flex items-center gap-4">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                      Light
                    </Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                      Dark
                    </Button>
                  </div>
                </div>

                {/* Font Size Slider */}
                <div className="space-y-2">
                  <h3 className="font-medium">Font Size</h3>
                  <Slider
                    min={0}
                    max={3}
                    step={1}
                    value={[fontSize]}
                    onValueChange={([v]) => setFontSize(v)}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{['S', 'M', 'L', 'XL'][fontSize]}</div>
                </div>

                {/* Highlight Segments Switch */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Highlight Segments</span>
                  <Switch checked={highlightSeg} onCheckedChange={setHighlightSeg} />
                </div>

                {/* Auto Explain Switch */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Auto-explain EDI codes</span>
                  <Switch checked={autoExplain} onCheckedChange={setAutoExplain} />
                </div>

                {/* Advanced Settings Button */}
                <div className="border-t pt-4">
                  <Button variant="secondary" className="w-full" onClick={() => {
                    onOpenSettings();
                    close();
                  }}>
                    API & Profile Settings
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsDrawer;
