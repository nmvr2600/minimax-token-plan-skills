# MiniMax Skills for Claude Code

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![MiniMax](https://img.shields.io/badge/MiniMax-API-green)](https://www.minimaxi.com)

A collection of Claude Code skills for MiniMax Token Plan subscribers. Generate images, synthesize speech, search the web, analyze images, and monitor your API quota — all through natural language commands.

> **Note:** These skills require an active MiniMax Token Plan subscription.

## Features

| Skill | Description | Trigger Phrases |
|-------|-------------|-----------------|
| `minimax-image` | Text-to-Image & Image-to-Image | "generate an image", "create a picture", "draw" |
| `minimax-speech` | Text-to-Speech (TTS) | "convert to speech", "generate audio", "read this text" |
| `minimax-search` | Web Search | "search for", "look up", "find information" |
| `minimax-image-analysis` | Image Analysis & OCR | "analyze image", "extract text from image", "describe this picture" |
| `minimax-usage` | Token Quota Query | "check usage", "token balance", "quota remaining" |

## Prerequisites

- Python 3.x
- MiniMax Token Plan subscription with API Key ([Get one here](https://www.minimaxi.com))

## Installation

### Global Installation (Available in all projects)

```bash
ln -s /Users/meng/workspace/minimax-skills ~/.claude/skills/minimax-skills
```

### Project-level Installation (Current project only)

```bash
ln -s /Users/meng/workspace/minimax-skills /path/to/your/project/.claude/skills/minimax-skills
```

## Configuration

Set your MiniMax Token Plan API Key as an environment variable:

```bash
export MINIMAX_API_KEY="your-api-key-here"
```

### Optional: Custom API Host

To use MiniMax's international endpoint or a custom domain:

```bash
export MINIMAX_API_HOST="https://api.minimaxi.com"  # Default
# or
export MINIMAX_API_HOST="https://api.minimax.chat"  # Alternative
```

## Usage

Once installed, simply use natural language in Claude Code:

### Image Generation
```
"Draw a cyberpunk city at night with neon lights"
"Generate an image of a cat flying through space"
```

### Text-to-Speech
```
"Convert this paragraph to speech"
"Read this text aloud"
```

### Web Search
```
"Search for the latest AI developments"
"Look up information about quantum computing"
```

### Image Analysis
```
"Analyze this image and describe what's in it"
"Extract the text from this screenshot"
```

### Usage Query
```
"Check my MiniMax Token Plan quota"
"How much quota do I have left?"
```

## Project Structure

```
minimax-skills/
├── skills/
│   ├── minimax-image/           # Image generation skill
│   │   ├── scripts/
│   │   │   └── generate_image.py
│   │   └── SKILL.md
│   ├── minimax-speech/          # Text-to-speech skill
│   │   ├── scripts/
│   │   └── SKILL.md
│   ├── minimax-search/          # Web search skill
│   │   ├── scripts/
│   │   │   └── standalone_search.py
│   │   └── SKILL.md
│   ├── minimax-image-analysis/  # Image analysis skill
│   │   ├── scripts/
│   │   │   └── image_analysis.py
│   │   └── SKILL.md
│   └── minimax-usage/           # Usage query skill
│       ├── scripts/
│       │   └── query.sh
│       └── SKILL.md
├── README.md
└── README_CN.md                 # 中文文档
```

## Skill Details

### minimax-image

Generate high-quality images from text descriptions.

**Features:**
- Text-to-Image with multiple aspect ratios (1:1, 16:9, 9:16, etc.)
- Image-to-Image for maintaining character/object consistency
- Batch generation (up to 9 images per request)
- Custom filename prefixes to avoid overwriting

**Example:**
```bash
python skills/minimax-image/scripts/generate_image.py \
  "a serene mountain landscape at sunrise" \
  --aspect-ratio 16:9 \
  --prefix "mountain_sunrise_landscape"
```

### minimax-speech

Convert text to natural-sounding speech using MiniMax's async TTS API.

**Features:**
- Multiple voice options
- HD quality audio output
- Supports long text (batch processing)

### minimax-search

Search the web for real-time information.

**Features:**
- Natural language queries
- Structured search results
- Integration with MiniMax's search API

### minimax-image-analysis

Analyze images and extract information.

**Features:**
- Image description and understanding
- OCR text extraction
- Visual content analysis

### minimax-usage

Monitor your MiniMax Token Plan quota and usage.

**Features:**
- Check remaining token quota for each model
- View token consumption statistics
- Track billing cycle

## Development

### Code Formatting

This project uses `ruff` for Python code formatting:

```bash
ruff format skills/
```

### Adding a New Skill

1. Create a new directory under `skills/`
2. Add a `SKILL.md` with skill metadata and documentation
3. Add executable scripts under `scripts/`
4. Update this README

## Troubleshooting

### MINIMAX_API_KEY not set

Make sure you've exported your API key:
```bash
export MINIMAX_API_KEY="your-api-key-here"
```

### Real-name authentication required (Error 2038)

MiniMax Token Plan requires real-name authentication. Please complete the verification in your MiniMax account dashboard.

### Permission denied when running scripts

Make scripts executable:
```bash
chmod +x skills/*/scripts/*.py skills/*/scripts/*.sh
```

## Documentation

- [English Documentation](README.md) (This file)
- [中文文档](README_CN.md)

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- Powered by [MiniMax Token Plan](https://www.minimaxi.com)
- Built for [Claude Code](https://claude.ai/code)
