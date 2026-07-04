import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 3400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] overflow-hidden bg-onyx"
        >
          {/* Radial glow floor */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(201,168,76,0.25),transparent_60%)]" />

          {/* Speed lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                style={{
                  top: `${8 + i * 6}%`,
                  width: `${30 + Math.random() * 40}%`,
                }}
                initial={{ x: "-40%", opacity: 0 }}
                animate={{ x: "140%", opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.9 + Math.random() * 0.6,
                  delay: 0.2 + i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Road line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute bottom-[30%] left-0 right-0 h-px origin-left bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          {/* Headlight glow trailing the car */}
          <motion.div
            initial={{ x: "-60vw", opacity: 0 }}
            animate={{ x: ["-60vw", "20vw", "120vw"], opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, ease: [0.65, 0, 0.35, 1], times: [0, 0.5, 1] }}
            className="absolute bottom-[18%] h-[380px] w-[520px] rounded-full bg-primary/40 blur-3xl"
          />

          {/* The car */}
          <motion.img
            src="/cars/lamborghini.jpg"
            alt=""
            initial={{ x: "-80vw", rotate: -1, opacity: 0 }}
            animate={{
              x: ["-80vw", "18vw", "120vw"],
              opacity: [0, 1, 1, 0],
              rotate: [-1, 0, 0, 1],
            }}
            transition={{
              duration: 2.8,
              ease: [0.7, 0, 0.3, 1],
              times: [0, 0.45, 0.75, 1],
            }}
            className="absolute bottom-[14%] left-0 h-[38vh] max-h-[420px] w-auto object-contain drop-shadow-[0_30px_60px_rgba(201,168,76,0.5)]"
          />

          {/* Brand reveal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0.6em" }}
                transition={{ delay: 1.4, duration: 0.9 }}
                className="text-[10px] md:text-xs text-primary tracking-[0.6em]"
              >
                MAISON D'AUTOMOBILE · EST. MMXXV
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.35em" }}
                transition={{ delay: 1.7, duration: 1, ease: "easeOut" }}
                className="mt-5 font-display text-6xl md:text-8xl font-bold gold-gradient-text tracking-[0.35em]"
              >
                OSAMA
              </motion.h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
                className="mx-auto mt-6 h-px w-48 origin-left bg-gradient-to-r from-transparent via-primary to-transparent"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.7 }}
                className="mt-5 text-xs md:text-sm text-muted-foreground tracking-[0.3em] uppercase"
              >
                The World's Finest Automobiles
              </motion.p>
            </div>
          </div>


          {/* Final black wipe */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 2.9, duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-background"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
