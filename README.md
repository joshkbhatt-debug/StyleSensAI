# StyleSensAI

An AI-powered writing assistant that transforms text to match selected styles while preserving your unique voice.

## Features

- **10 Writing Styles**: Choose from Formal, Casual, Technical, Creative, Persuasive, Narrative, Academic, Journalistic, Descriptive, or Concise
- **Toggle Selection**: Click any style to select/deselect it
- **Chrome Extension**: Use StyleSensAI on any website
- **Real-time Processing**: Get instant AI-powered text improvements
- **Detailed Explanations**: See why changes were made
- **No API Keys Required**: Extension works with our secure backend

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o
- **Authentication**: Supabase (optional)
- **Extension**: Chrome Extension Manifest V3

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stylesensai.git
   cd stylesensai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Web App
1. Enter your text in the editor
2. Select a writing style
3. Click "Finish" to transform your text
4. View the improved text and explanations

### Chrome Extension
1. Download the extension from `/extension`
2. Install in Chrome (Developer Mode)
3. Click the extension icon on any website
4. Select style and paste text
5. Get instant improvements

## API Endpoints

- `POST /api/analysis` - Main text processing endpoint
- `GET /api/health` - Health check
- `GET /api/extension-download` - Download Chrome extension

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url (optional)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
NEXT_PUBLIC_CHROME_WEBSTORE_URL=your_extension_store_url (optional)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@stylesensai.com or open an issue on GitHub. 