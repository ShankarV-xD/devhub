"use client";

import { useState } from "react";
import {
  X,
  Lock,
  Unlock,
  Copy,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface EncryptionToolsProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
}

type Mode = "encrypt" | "decrypt";
type Algorithm = "AES-256";

const ALGORITHMS: Algorithm[] = ["AES-256"];

export function EncryptionTools({
  isOpen,
  onClose,
  initialContent = "",
}: EncryptionToolsProps) {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [algorithm] = useState<Algorithm>("AES-256");
  const [passphrase, setPassphrase] = useState("");
  const [inputText, setInputText] = useState(initialContent);
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text to process");
      return;
    }
    if (!passphrase.trim()) {
      toast.error("Please enter a passphrase");
      return;
    }

    setIsProcessing(true);

    try {
      const { default: CryptoJS } = await import("crypto-js");

      if (mode === "encrypt") {
        const encrypted = CryptoJS.AES.encrypt(
          inputText,
          passphrase
        ).toString();
        setOutputText(encrypted);
        toast.success("Text encrypted successfully");
      } else {
        try {
          const bytes = CryptoJS.AES.decrypt(inputText.trim(), passphrase);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (!decrypted) {
            toast.error(
              "Decryption failed — wrong passphrase or invalid ciphertext"
            );
            setOutputText("");
          } else {
            setOutputText(decrypted);
            toast.success("Text decrypted successfully");
          }
        } catch {
          toast.error(
            "Decryption failed — wrong passphrase or invalid ciphertext"
          );
          setOutputText("");
        }
      }
    } catch (err) {
      toast.error("Failed to process — check your input");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText("");
    setMode(mode === "encrypt" ? "decrypt" : "encrypt");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Encryption / Decryption
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                AES-256 symmetric encryption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Warning */}
        <div className="mx-5 mt-4 flex items-start gap-2.5 px-3 py-2.5 bg-amber-950/40 border border-amber-900/50 rounded-lg text-xs text-amber-400 shrink-0">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            <strong>Educational use only.</strong> Do not encrypt sensitive
            production secrets here. This runs client-side with no server
            communication, but is not a substitute for proper key management.
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-5 space-y-4">
          {/* Mode Toggle */}
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => {
                setMode("encrypt");
                setOutputText("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "encrypt"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Lock size={14} />
              Encrypt
            </button>
            <button
              onClick={() => {
                setMode("decrypt");
                setOutputText("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "decrypt"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Unlock size={14} />
              Decrypt
            </button>
          </div>

          {/* Algorithm Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Algorithm
            </label>
            <div className="relative flex items-center group h-9">
              <select
                value={algorithm}
                disabled
                className="appearance-none w-full h-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-8 text-sm text-zinc-400 cursor-not-allowed opacity-70"
              >
                {ALGORITHMS.map((a) => (
                  <option key={a} value={a}>
                    {a} (CBC)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-600 pointer-events-none" />
            </div>
          </div>

          {/* Passphrase */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Passphrase / Key
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter a strong passphrase..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
              spellCheck={false}
            />
          </div>

          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {mode === "encrypt" ? "Plaintext Input" : "Ciphertext Input"}
              </label>
              {inputText && (
                <button
                  onClick={() => handleCopy(inputText, "Input")}
                  className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <Copy size={10} /> Copy
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === "encrypt"
                  ? "Enter the text you want to encrypt..."
                  : "Paste the encrypted ciphertext here..."
              }
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono resize-none"
              spellCheck={false}
            />
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : mode === "encrypt" ? (
              <>
                <Lock size={14} /> Encrypt
              </>
            ) : (
              <>
                <Unlock size={14} /> Decrypt
              </>
            )}
          </button>

          {/* Output */}
          {outputText && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {mode === "encrypt" ? "Encrypted Output" : "Decrypted Output"}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSwap}
                    className="text-[10px] text-zinc-600 hover:text-violet-400 transition-colors"
                    title="Use output as input (swap mode)"
                  >
                    ↩ Use as input
                  </button>
                  <button
                    onClick={() =>
                      handleCopy(
                        outputText,
                        mode === "encrypt" ? "Ciphertext" : "Plaintext"
                      )
                    }
                    className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <Copy size={10} /> Copy
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={outputText}
                  readOnly
                  rows={5}
                  className="w-full bg-zinc-950/80 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-emerald-400 font-mono resize-none focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
