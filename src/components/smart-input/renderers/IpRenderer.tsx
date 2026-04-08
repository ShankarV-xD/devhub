import { useState, useEffect } from "react";
import { MapPin, Globe, Building, Clock, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

interface IpRendererProps {
  content: string;
  setContent?: (value: string) => void;
  children?: React.ReactNode; // The original editor if we want to fallback
}

interface IpApiResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  org: string;
  postal?: string;
  error?: boolean;
  reason?: string;
}

// setContent is optional/unused if we rely on children editor
export function IpRenderer({ content, children }: IpRendererProps) {
  const [ipInfo, setIpInfo] = useState<IpApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-lookup when content is a valid IP
  useEffect(() => {
    const ip = content.trim();
    if (!ip) return;

    // Basic IP validation regex (IPv4 or IPv6)
    const isIp =
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip) ||
      /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip);

    if (!isIp) {
      setIpInfo(null);
      setError(null);
      return;
    }

    const fetchIpInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();

        if (data.error) {
          setError(data.reason || "Invalid IP address");
          setIpInfo(null);
        } else {
          setIpInfo(data);
        }
      } catch (err) {
        console.error("IP lookup error:", err);
        setError("Failed to fetch IP info");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce lookup
    const timer = setTimeout(fetchIpInfo, 500);
    return () => clearTimeout(timer);
  }, [content]);

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleCopyJson = () => {
    if (!ipInfo) return;
    navigator.clipboard.writeText(JSON.stringify(ipInfo, null, 2));
    toast.success("IP info copied to clipboard");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Editor Section (Input) */}
      <div className="border-b border-zinc-800 p-4 bg-zinc-900/30">
        <label className="text-xs font-medium text-zinc-400 mb-2 block uppercase tracking-wider">
          IP Address
        </label>
        {/* We use the Monaco Editor (children) but limit its height or style it? 
            Actually, let's just render the children (Editor) in a container.
            This allows user to edit the IP using the robust editor. 
        */}
        <div className="h-12 border border-zinc-800 rounded overflow-hidden">
          {children}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Enter an IPv4 or IPv6 address to lookup details automatically.
        </p>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Fetching IP details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <div className="bg-red-950/20 border border-red-900/50 p-4 rounded text-red-400">
              {error}
            </div>
          </div>
        ) : ipInfo ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl text-zinc-200">
                  {getCountryFlag(ipInfo.country)}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">
                    {ipInfo.ip}
                  </h2>
                  <div className="flex items-center gap-2 text-zinc-400 mt-1">
                    <MapPin size={14} />
                    <span>
                      {[ipInfo.city, ipInfo.region, ipInfo.country_name]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCopyJson}
                className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
                title="Copy JSON"
              >
                <Copy size={16} />
              </button>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coordinates */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Globe size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Coordinates
                  </span>
                </div>
                <div className="font-mono text-xl text-zinc-200">
                  {ipInfo.latitude}, {ipInfo.longitude}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${ipInfo.latitude},${ipInfo.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-500 hover:text-emerald-400 mt-2 inline-block"
                >
                  View on Google Maps →
                </a>
              </div>

              {/* Organization */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Building size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    ISP / Organization
                  </span>
                </div>
                <div className="text-lg text-zinc-200">
                  {ipInfo.org || "N/A"}
                </div>
              </div>

              {/* Timezone */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Clock size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Timezone
                  </span>
                </div>
                <div className="text-lg text-zinc-200">
                  {ipInfo.timezone || "N/A"}
                </div>
              </div>

              {/* Postal */}
              {ipInfo.postal && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <MapPin size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Postal Code
                    </span>
                  </div>
                  <div className="text-lg text-zinc-200">{ipInfo.postal}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Globe className="w-12 h-12 mb-4 opacity-20" />
            <p>Results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
