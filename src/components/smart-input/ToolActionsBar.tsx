import { ContentType } from "@/lib/detector";
import { Base64Tools } from "./tools/Base64Tools";
import { Base64ImageTools } from "./tools/Base64ImageTools";
import { JsonTools } from "./tools/JsonTools";
import { SqlTools } from "./tools/SqlTools";
import { ColorTools } from "./tools/ColorTools";
import { YamlTools } from "./tools/YamlTools";
import { CsvTools } from "./tools/CsvTools";
import { TimestampTools } from "./tools/TimestampTools";
import { XmlTools } from "./tools/XmlTools";
import { GraphqlTools } from "./tools/GraphqlTools";
import { UrlTools } from "./tools/UrlTools";
import { CssTools } from "./tools/CssTools";
import { HtmlTools } from "./tools/HtmlTools";
import { MarkdownTools } from "./tools/MarkdownTools";
import { CodeTools } from "./tools/CodeTools";
import { TextTools } from "./tools/TextTools";
import { Key } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "./ToolButton";

interface ToolActionsBarProps {
  type: ContentType;
  content: string;
  setContent: (value: string) => void;
  setViewMode?: (mode: "raw" | "tree" | "table") => void;
  setLastTransform?: (val: any) => void;
  lastTransform?: any;
  setType?: (type: any) => void;
  jwtOriginal?: any;
  setJwtOriginal?: (val: any) => void;
}

export function ToolActionsBar({
  type,
  content,
  setContent,
  setViewMode,
  setLastTransform,
  lastTransform,
  setType,
  jwtOriginal,
  setJwtOriginal,
}: ToolActionsBarProps) {
  // Don't render if no content
  if (!content) return null;

  return (
    <div className="border-t border-zinc-900/50 bg-zinc-950/50">
      {/* M1: Horizontal scrolling container — min-h ensures touch-friendly row height */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max min-h-[44px]">
          {/* Text Tools — shown in bottom bar like all other types */}
          {type === "text" && setLastTransform && (
            <TextTools
              content={content}
              setContent={setContent}
              lastTransform={lastTransform ?? null}
              setLastTransform={setLastTransform}
              searchTerm=""
            />
          )}
          {/* Base64 Text Tools */}
          {type === "base64" && !content.startsWith("data:image/") && (
            <Base64Tools
              content={content}
              setContent={setContent}
              searchTerm=""
            />
          )}

          {/* Base64 Image Tools */}
          {type === "base64" && content.startsWith("data:image/") && (
            <Base64ImageTools
              content={content}
              setContent={setContent}
              searchTerm=""
            />
          )}

          {/* JSON Tools */}
          {type === "json" && setViewMode && setLastTransform && (
            <JsonTools
              content={content}
              setContent={setContent}
              setViewMode={setViewMode}
              setLastTransform={setLastTransform}
              searchTerm=""
            />
          )}

          {/* SQL Tools */}
          {type === "sql" && setLastTransform && (
            <SqlTools
              content={content}
              setContent={setContent}
              setLastTransform={setLastTransform}
              searchTerm=""
            />
          )}

          {/* Color Tools */}
          {type === "color" && <ColorTools content={content} searchTerm="" />}

          {/* YAML Tools */}
          {type === "yaml" && setLastTransform && (
            <YamlTools
              content={content}
              setContent={setContent}
              setLastTransform={setLastTransform}
              searchTerm=""
            />
          )}

          {/* CSV Tools */}
          {type === "csv" && (
            <CsvTools content={content} setContent={setContent} searchTerm="" />
          )}

          {/* Timestamp Tools */}
          {type === "timestamp" && (
            <TimestampTools content={content} setContent={setContent} />
          )}

          {/* XML Tools */}
          {type === "xml" && (
            <XmlTools content={content} setContent={setContent} searchTerm="" />
          )}

          {/* CSS Tools */}
          {type === "css" && (
            <CssTools content={content} setContent={setContent} />
          )}

          {/* Code Tools */}
          {type === "code" && (
            <CodeTools content={content} setContent={setContent} />
          )}

          {/* HTML Tools */}
          {type === "html" && (
            <HtmlTools content={content} setContent={setContent} />
          )}

          {/* Markdown Tools */}
          {type === "markdown" && (
            <MarkdownTools content={content} setContent={setContent} />
          )}

          {/* GraphQL Tools */}
          {type === "graphql" && (
            <GraphqlTools
              content={content}
              setContent={setContent}
              searchTerm=""
            />
          )}

          {/* URL Tools */}
          {type === "url" && setViewMode && setLastTransform && setType && (
            <UrlTools
              content={content}
              setContent={setContent}
              setType={setType}
              setViewMode={setViewMode}
              setLastTransform={setLastTransform}
              searchTerm=""
            />
          )}

          {/* JWT Tools */}
          {type === "jwt" && setJwtOriginal && (
            <>
              <ToolButton
                icon={<Key size={16} />}
                label={jwtOriginal ? "Encode Payload" : "Decode Payload"}
                onClick={() => {
                  if (jwtOriginal) {
                    setContent(jwtOriginal);
                    setJwtOriginal(null);
                    setViewMode?.("raw");
                  } else {
                    try {
                      const parts = content.split(".");
                      if (parts.length < 2) throw new Error("Invalid JWT");
                      const payload = atob(parts[1]);
                      JSON.parse(payload);
                      setJwtOriginal(content);
                      setContent(JSON.stringify(JSON.parse(payload), null, 4));
                      setViewMode?.("raw");
                    } catch {
                      toast.error("Invalid JWT");
                    }
                  }
                }}
              />
              {/* JWT Verify Signature */}
              {!jwtOriginal && (
                <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    ⚠️ Verify:
                  </span>
                  <input
                    type="text"
                    placeholder="Secret key (Enter)"
                    className="w-36 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                    aria-label="JWT secret key"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const secret = e.currentTarget.value;
                        if (secret && content) {
                          import("@/lib/jwtVerify").then(({ verifyJWT }) => {
                            verifyJWT(content, secret, "HS256").then(
                              (result) => {
                                if (!result.valid) {
                                  toast.error(result.error);
                                } else {
                                  toast.success("✓ Valid signature");
                                }
                              }
                            );
                          });
                        }
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Regex Tools */}
          {type === "regex" && (
            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                Test:
              </span>
              <input
                type="text"
                placeholder="Type to test match..."
                className="w-48 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-900"
                aria-label="Test string for regex"
                onChange={(e) => {
                  try {
                    const lastSlash = content.lastIndexOf("/");
                    const pattern = content.slice(1, lastSlash);
                    const flags = content.slice(lastSlash + 1);
                    const re = new RegExp(
                      pattern,
                      flags.includes("g") ? flags : flags + "g"
                    );
                    const matches = e.target.value.match(re);
                    const count = matches ? matches.length : 0;

                    if (e.target.value && count > 0) {
                      toast.success(
                        `${count} match${count === 1 ? "" : "es"} found`
                      );
                    } else if (e.target.value) {
                      toast.error("No matches");
                    }
                  } catch {
                    toast.error("Invalid Regex");
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
