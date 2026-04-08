import { useState } from "react";
import { X, CheckCircle, AlertCircle, FileJson } from "lucide-react";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { toast } from "sonner";

interface JsonSchemaValidatorProps {
  initialData?: string;
  onClose: () => void;
}

interface ValidationError {
  instancePath: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const EXAMPLE_DATA = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}`;

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 0 },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      },
      "required": ["street", "city"]
    }
  },
  "required": ["name", "email"]
}`;

export function JsonSchemaValidator({
  initialData,
  onClose,
}: JsonSchemaValidatorProps) {
  const [jsonData, setJsonData] = useState(initialData || "");
  const [schema, setSchema] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const handleValidate = () => {
    try {
      // Parse JSON data
      const parsedData = JSON.parse(jsonData);

      // Parse schema
      const parsedSchema = JSON.parse(schema);

      // Create Ajv instance with formats
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);

      // Compile and validate
      const validate = ajv.compile(parsedSchema);
      const valid = validate(parsedData);

      if (valid) {
        setValidationResult({ valid: true, errors: [] });
        toast.success("✓ JSON is valid!");
      } else {
        const errors = (validate.errors || []).map((err) => ({
          instancePath: err.instancePath || "/",
          message: err.message || "Validation error",
        }));
        setValidationResult({ valid: false, errors });
        toast.error(`✗ ${errors.length} validation error(s)`);
      }
    } catch (error: any) {
      if (error.message.includes("JSON")) {
        toast.error("Invalid JSON syntax");
      } else {
        toast.error("Validation error: " + error.message);
      }
      setValidationResult(null);
    }
  };

  const loadExampleData = () => {
    setJsonData(EXAMPLE_DATA);
    toast.success("Loaded example data");
  };

  const loadExampleSchema = () => {
    setSchema(EXAMPLE_SCHEMA);
    toast.success("Loaded example schema");
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-100">
            JSON Schema Validator
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Split view editors */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Left: JSON Data */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                JSON Data
              </label>
              <button
                onClick={loadExampleData}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="custom-scrollbar flex-1 bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-200 font-mono resize-none focus:outline-none focus:border-emerald-800"
              placeholder="Paste your JSON data here..."
            />
          </div>

          {/* Right: JSON Schema */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                JSON Schema
              </label>
              <button
                onClick={loadExampleSchema}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Load Example Schema
              </button>
            </div>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="custom-scrollbar flex-1 bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-200 font-mono resize-none focus:outline-none focus:border-emerald-800"
              placeholder="Paste your JSON Schema here..."
            />
          </div>
        </div>

        {/* Validate Button */}
        <div className="px-4 pb-4 shrink-0">
          <button
            onClick={handleValidate}
            disabled={!jsonData || !schema}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-2"
          >
            <FileJson size={18} />
            Validate
          </button>
        </div>

        {/* Results Panel */}
        {validationResult && (
          <div className="px-4 pb-4 shrink-0">
            <div
              className={`border rounded p-4 ${
                validationResult.valid
                  ? "border-emerald-800 bg-emerald-950/30"
                  : "border-red-800 bg-red-950/30"
              }`}
            >
              {validationResult.valid ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={20} />
                  <span className="font-medium">JSON is valid!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-400 mb-3">
                    <AlertCircle size={20} />
                    <span className="font-medium">
                      Validation Errors ({validationResult.errors.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {validationResult.errors.map((err, idx) => (
                      <div key={idx} className="text-sm text-zinc-300 pl-7">
                        <span className="text-red-400 font-mono">
                          {err.instancePath || "/"}
                        </span>
                        {" • "}
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
