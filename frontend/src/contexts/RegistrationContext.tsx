import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface UploadsData {
  livePhoto: File | null;
  video: File | null;
  qrCode: File | null;
}

interface RegistrationContextType {
  uploads: UploadsData;
  setUploads: (uploads: UploadsData) => void;
  clearUploads: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadsData>({
    livePhoto: null,
    video: null,
    qrCode: null,
  });

  const clearUploads = () => {
    setUploads({
      livePhoto: null,
      video: null,
      qrCode: null,
    });
  };

  return (
    <RegistrationContext.Provider value={{ uploads, setUploads, clearUploads }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within RegistrationProvider");
  }
  return context;
}
