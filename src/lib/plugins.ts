/**
 * AR6: Plugin / Extension System
 *
 * Provides a lightweight, type-safe plugin registry that allows third-party
 * tools (or future internal extensions) to register:
 *   - Custom tools (with their own UI component and optional detector)
 *   - Custom content detectors
 *   - Custom content transforms
 *
 * Usage:
 *   import { pluginRegistry } from '@/lib/plugins';
 *
 *   pluginRegistry.registerTool({
 *     id: 'my-tool',
 *     name: 'My Tool',
 *     icon: <WrenchIcon />,
 *     component: MyToolComponent,
 *     detector: (content) => content.startsWith('MY_'),
 *   });
 */

import { ComponentType, ReactElement } from "react";
import { ContentType } from "./detector";

// ─────────────────────────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────────────────────────

/** Configuration for a plugin-provided tool */
export interface ToolConfig {
  /** Unique identifier for the tool (kebab-case recommended) */
  id: string;
  /** Human-readable display name in the sidebar and error messages */
  name: string;
  /** Icon element rendered in the toolbar */
  icon: ReactElement;
  /** The React component to render as the tool's UI */
  component: ComponentType<ToolComponentProps>;
  /**
   * Optional content detector — returns true when this tool
   * should be automatically suggested for a given content string.
   */
  detector?: DetectorFunction;
  /** Optional category for grouping tools in the sidebar */
  category?: string;
  /** Optional keyboard shortcut to activate this tool (e.g. "ctrl+shift+m") */
  shortcut?: string;
}

/** Props passed to every plugin tool component */
export interface ToolComponentProps {
  content: string;
  setContent: (value: string) => void;
  contentType: ContentType;
}

/**
 * A detector function examines a content string and returns true
 * if the plugin tool should be offered for that content.
 */
export type DetectorFunction = (content: string) => boolean;

/**
 * A transform function takes content, applies a transformation,
 * and returns the transformed string.
 */
export type TransformFunction = (content: string) => string | Promise<string>;

/** A named transform that can appear in the command palette */
export interface TransformConfig {
  id: string;
  name: string;
  fn: TransformFunction;
  /** Which content types this transform applies to; omit for all types */
  appliesTo?: ContentType[];
}

// ─────────────────────────────────────────────────────────────────
// Public Plugin API contract
// ─────────────────────────────────────────────────────────────────

export interface PluginAPI {
  /** Register a new tool panel */
  registerTool(config: ToolConfig): void;
  /** Register a content detector that auto-suggests a tool */
  registerDetector(id: string, fn: DetectorFunction): void;
  /** Register a named content transform (shown in command palette) */
  registerTransform(config: TransformConfig): void;
}

// ─────────────────────────────────────────────────────────────────
// Registry implementation
// ─────────────────────────────────────────────────────────────────

class PluginRegistry implements PluginAPI {
  private tools = new Map<string, ToolConfig>();
  private detectors = new Map<string, DetectorFunction>();
  private transforms = new Map<string, TransformConfig>();
  private initialized = false;

  /** Register a tool. Throws if the ID is already taken. */
  registerTool(config: ToolConfig): void {
    if (this.tools.has(config.id)) {
      console.warn(
        `[PluginRegistry] Tool "${config.id}" is already registered. Skipping.`,
      );
      return;
    }
    this.tools.set(config.id, config);

    // If the tool provides its own detector, auto-register it
    if (config.detector) {
      this.detectors.set(config.id, config.detector);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[PluginRegistry] Registered tool: "${config.name}"`);
    }
  }

  /** Register a standalone detector (used to auto-suggest tools) */
  registerDetector(id: string, fn: DetectorFunction): void {
    if (this.detectors.has(id)) {
      console.warn(
        `[PluginRegistry] Detector "${id}" is already registered. Skipping.`,
      );
      return;
    }
    this.detectors.set(id, fn);
  }

  /** Register a named transform function */
  registerTransform(config: TransformConfig): void {
    if (this.transforms.has(config.id)) {
      console.warn(
        `[PluginRegistry] Transform "${config.id}" is already registered. Skipping.`,
      );
      return;
    }
    this.transforms.set(config.id, config);
  }

  /** Unregister a tool (useful for hot-reload / testing) */
  unregisterTool(id: string): void {
    this.tools.delete(id);
    this.detectors.delete(id);
  }

  // ── Getters ─────────────────────────────────────────────────────

  /** All registered tools in insertion order */
  getTools(): ToolConfig[] {
    return Array.from(this.tools.values());
  }

  /** A specific tool by ID, or undefined */
  getTool(id: string): ToolConfig | undefined {
    return this.tools.get(id);
  }

  /** All registered detectors */
  getDetectors(): Map<string, DetectorFunction> {
    return new Map(this.detectors);
  }

  /** All registered transforms, optionally filtered by content type */
  getTransforms(forType?: ContentType): TransformConfig[] {
    const all = Array.from(this.transforms.values());
    if (!forType) return all;
    return all.filter(
      (t) => !t.appliesTo || t.appliesTo.includes(forType),
    );
  }

  /**
   * Run all registered detectors against a content string and return
   * the IDs of matching tools.
   */
  detectMatchingTools(content: string): string[] {
    const matches: string[] = [];
    for (const [id, fn] of this.detectors) {
      try {
        if (fn(content)) matches.push(id);
      } catch {
        // Detectors must never crash the main detector pipeline
      }
    }
    return matches;
  }

  /** Mark the registry as initialized (called once at app startup) */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[PluginRegistry] Initialized with ${this.tools.size} tools, ${this.detectors.size} detectors, ${this.transforms.size} transforms.`,
      );
    }
  }

  get isInitialized(): boolean {
    return this.initialized;
  }
}

// ─────────────────────────────────────────────────────────────────
// Singleton export
// ─────────────────────────────────────────────────────────────────

/** Global plugin registry — import this to extend DevHub */
export const pluginRegistry = new PluginRegistry();
