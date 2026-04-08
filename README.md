# 🚀 DevHub - Developer Tools & Utilities

> **Smart developer tools hub with intelligent auto-detection**

DevHub is a modern, fast, and intuitive developer tools platform that automatically detects content type and provides relevant tools. No more switching between multiple websites or tools—everything you need is in one place.

![DevHub](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🔍 Smart Auto-Detection

Paste any content and DevHub automatically detects its type:

- **JSON** - Format, minify, validate, tree/table view
- **JWT** - Decode/encode tokens, view payload, **verify signatures (HS256)** ⭐
- **Base64** - Bidirectional encode/decode
- **Regular Expressions** - Test matches in real-time
- **SQL** - Format and minify queries
- **URLs** - Parse parameters, encode/decode
- **Colors** - Preview, convert (Hex/RGB/HSL), color picker
- **HTML** - Live preview with syntax highlighting
- **Markdown** - Rendered preview
- **YAML** - Parse and convert to/from JSON
- **Cron** - Human-readable schedule explanations
- **Code** - Syntax highlighting with Monaco Editor
- **UUIDs** - Validate and generate
- **Hashes** - Generate SHA-1, SHA-256, SHA-512

### 🛠️ Additional Tools

- **Todo List** - Clean task management with persistence
- **Diff Viewer** - Side-by-side text comparison
- **Generators** - UUID, Lorem Ipsum, Hashes
- **Text Transforms** - Uppercase, lowercase, title case, slugify

### 🎨 User Experience

- **URL State Persistence** - Share links to your content
- **Dark Mode** - Easy on the eyes
- **Mobile Responsive** - Hamburger menu, slide-in sidebar ⭐
- **Keyboard Shortcuts** - `Ctrl+J` (JSON), `Ctrl+S` (SQL), `Ctrl+D` (Download), `Ctrl+Shift+C` (Copy)
- **Copy to Clipboard** - One-click copy
- **Error Boundaries** - Graceful error handling
- **Loading Skeletons** - Professional loading animations ⭐
- **Zero Configuration** - Just paste and go

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/devhub.git
   cd devhub
   ```

2. **Install dependencies**

   ```bash
   cd devhub-frontend
   pnpm install
   ```

3. **Run development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 📖 Usage Examples

### Format JSON

```
1. Paste JSON content
2. Auto-detected as JSON
3. Click "Format JSON" or press Ctrl+J
4. Switch between Raw/Tree/Table views
```

### Decode JWT

```
1. Paste JWT token
2. Auto-detected as JWT
3. Click "Decode Payload"
4. View decoded JSON payload
5. Click "Encode Payload" to restore
```

### Test Regex

```
1. Paste regex pattern (e.g., /\d+/g)
2. Auto-detected as Regex
3. Type test string in the input
4. See match results instantly
```

### Generate Hash

```
1. Type or paste any text
2. Click SHA-256, SHA-512, or SHA-1
3. Hash generated instantly
4. Copy hash to clipboard
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action                    |
| -------------- | ------------------------- |
| `Ctrl+J`       | Format JSON               |
| `Ctrl+S`       | Format SQL                |
| `Ctrl+Shift+C` | Copy content to clipboard |
| `Ctrl+C`       | Copy selected text        |
| `Escape`       | Clear/Exit                |

---

## 🏗️ Project Structure

```
devhub-frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout with metadata
│   │   ├── page.tsx      # Home page
│   │   └── tools/        # Tools listing page
│   ├── components/       # React components
│   │   ├── SmartInput.tsx       # Main input component
│   │   ├── JsonViewer.tsx       # Interactive JSON tree
│   │   ├── JsonTable.tsx        # JSON table view
│   │   ├── TodoTool.tsx         # Todo list
│   │   ├── DiffViewer.tsx       # Diff comparison
│   │   └── Tooltip.tsx          # Tooltip component
│   ├── lib/              # Utilities and helpers
│   │   ├── detector.ts          # Content type detection
│   │   ├── generators.ts        # UUID, Hash, Lorem generators
│   │   ├── constants.ts         # App constants
│   │   └── examples.ts          # Example data
│   └── hooks/            # Custom React hooks
│       └── useUrlState.ts       # URL state management
├── public/               # Static assets
└── package.json          # Dependencies
```

---

---

## 🏗️ Technical Improvements (v0.1.0)

### Architecture

- **State Management** - Zustand for global state
- **Component Extraction** - Modular, reusable components (EditorHeader, ToolButton, MobileSidebar)
- **Error Boundaries** - Graceful error handling throughout the app
- **Type Safety** - Zero `any` types, full TypeScript coverage

### Validation & Security

- **5 New Validators** - URL, Email, Hex Color, UUID, Credit Card (Luhn)
- **JWT Verification** - Client-side signature validation (HS256/RS256)
- **Input Sanitization** - DOMPurify for XSS protection

### Testing

- **44 Tests Passing** - Comprehensive test coverage
- **Multiple Test Suites** - Validation, JWT, Store, Detector
- **Testing Infrastructure** - Vitest + React Testing Library

### UX Enhancements

- **Loading Skeletons** - Professional loading animations
- **Mobile Responsive** - Hamburger menu with slide-in sidebar
- **Keyboard Shortcuts** - 5 shortcuts for common actions
- **Error Recovery** - User-friendly error messages with suggestions

---

## 🔧 Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** - React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[Lucide Icons](https://lucide.dev/)** - Icon library
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering
- **[Yjs](https://yjs.dev/)** - Real-time collaboration (coming soon)

### Tools & Libraries

- **sql-formatter** - SQL formatting
- **colord** - Color manipulation
- **cronstrue** - Cron expression parser
- **yaml** - YAML parser
- **lz-string** - URL compression
- **zustand** - State management

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write meaningful commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

---

## 🗺️ Roadmap

- [x] Auto-detection for 15+ content types
- [x] JSON tree and table views
- [x] Todo list with persistence
- [x] Diff viewer
- [ ] Collaborative editing (Yjs integration)
- [ ] User accounts and cloud sync
- [ ] Plugin system
- [ ] More hash algorithms (MD5)
- [ ] CSV/XML support
- [ ] API testing tool
- [ ] Dark/Light theme toggle
- [ ] Keyboard-first navigation
- [ ] Accessibility improvements (WCAG 2.1 AA)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for inspiration
- All amazing open-source libraries used in this project

---

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

**Made with ❤️ for developers, by developers**

---

## 🌟 Star History

If you find DevHub useful, please consider giving it a star ⭐

---

_DevHub - Making developer workflows faster, one tool at a time._
