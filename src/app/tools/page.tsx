import Link from "next/link";
import {
  FileJson,
  Key,
  Type,
  FileText,
  Code2,
  Search,
  ArrowLeft,
} from "lucide-react";

const tools = [
  {
    name: "JSON Tools",
    icon: FileJson,
    desc: "Format, Minify, Validate JSON",
    href: "/?tool=json",
  },
  {
    name: "JWT Debugger",
    icon: Key,
    desc: "Decode and Verify JWTs",
    href: "/?tool=jwt",
  },
  {
    name: "Regex Tester",
    icon: Search,
    desc: "Test Regular Expressions",
    href: "/?tool=regex",
  },
  {
    name: "Base64",
    icon: Type,
    desc: "Encode and Decode Base64",
    href: "/?tool=base64",
  },
  {
    name: "Scratchpad",
    icon: FileText,
    desc: "Simple text editor",
    href: "/?tool=text",
  },
  {
    name: "Code Snippet",
    icon: Code2,
    desc: "Share code",
    href: "/?tool=code",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Developer Tools</h1>
        <p className="text-zinc-500 mb-12">
          Select a tool to get started instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-300 flex flex-col items-start gap-4"
            >
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                <tool.icon
                  size={24}
                  className="text-zinc-400 group-hover:text-white"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold group-hover:text-white transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-zinc-500 group-hover:text-zinc-400">
                  {tool.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
