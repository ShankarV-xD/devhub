import { useState } from "react";
import { MapPin, Globe, Building, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface IpToolsProps {
  content: string;
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

export function IpTools({ content }: IpToolsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpApiResponse | null>(null);

  const lookupIp = async () => {
    const ip = content.trim();

    if (!ip) {
      toast.error("No IP address to lookup");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data: IpApiResponse = await response.json();

      if (data.error) {
        toast.error(data.reason || "Invalid IP address");
        setIpInfo(null);
      } else {
        setIpInfo(data);
        toast.success("IP info retrieved");
      }
    } catch (error) {
      console.error("IP lookup error:", error);
      toast.error("Failed to lookup IP address");
      setIpInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="space-y-3">
      {/* Lookup Button */}
      <button
        onClick={lookupIp}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Looking up...
          </>
        ) : (
          <>
            <MapPin size={16} />
            Lookup IP Info
          </>
        )}
      </button>

      {/* IP Info Card */}
      {ipInfo && !ipInfo.error && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
          {/* IP Address Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <span className="text-2xl">{getCountryFlag(ipInfo.country)}</span>
            <span className="text-lg font-semibold text-zinc-100">
              {ipInfo.ip}
            </span>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin size={14} />
              <span className="text-xs font-medium">Location</span>
            </div>
            <div className="text-sm text-zinc-300 pl-5">
              {[ipInfo.city, ipInfo.region, ipInfo.country_name]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <Globe size={14} />
              <span className="text-xs font-medium">Coordinates</span>
            </div>
            <div className="text-sm text-zinc-300 pl-5 font-mono">
              {ipInfo.latitude?.toFixed(4)}, {ipInfo.longitude?.toFixed(4)}
            </div>
          </div>

          {/* Organization/ISP */}
          {ipInfo.org && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Building size={14} />
                <span className="text-xs font-medium">Organization</span>
              </div>
              <div className="text-sm text-zinc-300 pl-5">{ipInfo.org}</div>
            </div>
          )}

          {/* Timezone */}
          {ipInfo.timezone && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock size={14} />
                <span className="text-xs font-medium">Timezone</span>
              </div>
              <div className="text-sm text-zinc-300 pl-5">
                {ipInfo.timezone}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
