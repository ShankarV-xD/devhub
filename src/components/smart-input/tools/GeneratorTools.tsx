import React from "react";

import { generateUUID, type HashAlgorithm } from "@/lib/generators";
import { toast } from "sonner";
import { LoremIpsumTools } from "./LoremIpsumTools";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

import { AsciiArtTools } from "./AsciiArtTools";

// Note: Generator logic is mostly button clicks.

interface GeneratorToolsProps {
  content: string;
  setContent: (value: string) => void;
  setActiveView: (view: "editor" | "todo" | "api") => void;
  // setMsg: (msg: { text: string; type: "success" | "error" }) => void; // REMOVED
  setHashes: (hashes: Record<HashAlgorithm, string>) => void;
  setShowHashes: (show: boolean) => void;
}

export const GeneratorTools: React.FC<GeneratorToolsProps> = ({
  content,
  setContent,
  setActiveView,
  // setMsg,
  setHashes,
  setShowHashes,
}) => {
  const [isHashing, setIsHashing] = React.useState(false);
  const [showLoremModal, setShowLoremModal] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showAsciiModal, setShowAsciiModal] = React.useState(false);

  return (
    <>
      <div className="mt-1 pt-1 border-t border-zinc-900/50">
        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 px-1">
          Generators
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setActiveView("editor");
              setContent(generateUUID());
            }}
            aria-label="Generate UUID"
            className="cursor-pointer px-2 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors w-full"
          >
            UUID
          </button>

          <button
            onClick={() => setShowLoremModal(true)}
            aria-label="Generate Lorem Ipsum"
            className="cursor-pointer px-2 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors w-full"
          >
            Lorem
          </button>

          <button
            onClick={() => {
              if (isHashing) return;
              if (!content) {
                toast.error("Enter some text to hash");
                return;
              }

              setIsHashing(true);
              const toastId = toast.loading("Generating hashes...");

              const algorithms: HashAlgorithm[] = [
                "MD5",
                "SHA-1",
                "SHA-256",
                "SHA-384",
                "SHA-512",
              ];

              const worker = new Worker(
                new URL("@/workers/hash.worker.ts", import.meta.url)
              );

              const hashResults: Record<string, string> = {};
              let completed = 0;

              worker.onmessage = (e) => {
                const { algorithm, hash, error } = e.data;
                if (error) {
                  console.error(`Error hashing ${algorithm}:`, error);
                  toast.error(`Error hashing ${algorithm}`);
                } else {
                  hashResults[algorithm] = hash;
                }

                completed++;
                if (completed === algorithms.length) {
                  setHashes(hashResults as Record<HashAlgorithm, string>);
                  setShowHashes(true);
                  toast.dismiss(toastId);
                  toast.success("Hashes Generated");
                  setIsHashing(false);
                  worker.terminate();
                }
              };

              algorithms.forEach((algo) => {
                worker.postMessage({ text: content, algorithm: algo });
              });
            }}
            aria-label="Generate Hash"
            disabled={isHashing}
            className={`cursor-pointer px-2 py-2 border border-zinc-800 rounded text-xs transition-colors w-full ${
              isHashing
                ? "bg-zinc-900/20 text-zinc-600 cursor-not-allowed"
                : "bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {isHashing ? "..." : "Hash"}
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            aria-label="Generate QR Code"
            className="cursor-pointer px-2 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors w-full"
          >
            QR
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            aria-label="Password Strength Meter"
            className="cursor-pointer px-2 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors w-full"
          >
            Password
          </button>

          <button
            onClick={() => setShowAsciiModal(true)}
            aria-label="Generate ASCII Art"
            className="cursor-pointer px-2 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors w-full"
          >
            ASCII
          </button>
        </div>
      </div>

      {/* Lorem Ipsum Modal */}
      <LoremIpsumTools
        isOpen={showLoremModal}
        onClose={() => setShowLoremModal(false)}
        onGenerate={(text) => {
          setActiveView("editor");
          setContent(text);
        }}
      />

      {/* QR Code Generator Modal */}
      <QRCodeGenerator
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        initialText={content}
      />

      {/* Password Strength Meter Modal */}
      <PasswordStrengthMeter
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <AsciiArtTools
        isOpen={showAsciiModal}
        onClose={() => setShowAsciiModal(false)}
        onInsert={(text) => {
          setActiveView("editor");
          setContent(text);
        }}
        initialText={content}
      />
    </>
  );
};
