import React from "react";
import { useClientValue } from "@/lib/use-client-value";

const EMPTY_STORAGE: Record<string, string> = {};

const readStorage = (): Record<string, string> => {
  const items: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      items[key] = localStorage.getItem(key) || "";
    }
  }
  return items;
};

const LocalStorageDebugger: React.FC = () => {
  const storage = useClientValue(readStorage, EMPTY_STORAGE);

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-card rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold mb-2">Local Storage Debug</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(storage, null, 2)}
      </pre>
    </div>
  );
};

export default LocalStorageDebugger;
