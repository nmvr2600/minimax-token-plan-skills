# MiniMax Token Plan Skills

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

- [Bun](https://bun.sh) >= 1.0.0
- MiniMax Token Plan subscription with API Key ([Get one here](https://www.minimaxi.com))

## Installation

### Global Installation (Available in all projects)

```bash
ln -s /Users/meng/workspace/minimax-token-plan-skills ~/.claude/skills/minimax-token-plan-skills
```

### Project-level Installation (Current project only)

```bash
ln -s /Users/meng/workspace/minimax-token-plan-skills /path/to/your/project/.claude/skills/minimax-token-plan-skills
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

## Usage Examples

Once installed, simply use natural language in Claude Code, or run the scripts directly:

### Image Generation (minimax-image)

Generate high-quality images from text descriptions.

**Natural language:**
```
"Draw a cyberpunk city at night with neon lights"
"Generate an image of a cat flying through space"
```

**Direct script usage:**
```bash
# Basic usage - 1:1 square image
bun run skills/minimax-image/scripts/generate.ts "a cute cat sitting on a windowsill"

# Specify aspect ratio (16:9 for desktop wallpaper)
bun run skills/minimax-image/scripts/generate.ts "futuristic city skyline" --aspect-ratio 16:9

# Batch generate 4 images
bun run skills/minimax-image/scripts/generate.ts "dreamy forest scene" -n 4 --output-dir ./outputs

# Custom filename prefix
bun run skills/minimax-image/scripts/generate.ts "sunset over mountains" --prefix "mountain_sunset"
```

**Supported aspect ratios:** `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9`

**Example outputs:**

| Prompt | Output |
|--------|--------|
| "a cat flying through space, comic style" | ![Cat Flying](samples/cat_flying_space_comic.jpeg) |
| "cute cat poses, multiple angles" | ![Cute Cats](samples/cute_cat_poses_0.jpeg) |
| "herdsman pointing to Xinghua village, traditional Chinese ink wash painting style" | ![Ink Wash](samples/herdsman_pointing_xinghua_village_ink_wash.jpeg) |

### Text-to-Speech (minimax-speech)

Convert text to natural-sounding speech using MiniMax's async TTS API.

**Natural language:**
```
"Convert this paragraph to speech"
"Read this text aloud with a gentle female voice"
```

**Direct script usage:**
```bash
# Basic usage with default voice (female-tianmei)
bun run skills/minimax-speech/scripts/tts.ts "Welcome to our service!"

# Specify voice and output file
bun run skills/minimax-speech/scripts/tts.ts "Chapter 1: The beginning of the story" \
  --voice female-yujie \
  --output story_chapter_1.mp3

# Adjust speed and volume
bun run skills/minimax-speech/scripts/tts.ts "Emergency announcement" \
  --voice male-qn-qingse \
  --speed 1.2 \
  --vol 8 \
  --output announcement.mp3
```

**Available voices:**
- `female-tianmei` - Sweet female voice (default)
- `female-yujie` - Mature female voice, good for storytelling
- `female-shaonv` - Young female voice
- `male-qn-qingse` - Young male voice
- `male-jieshuo` - Narrator male voice
- `Chinese (Mandarin)_News_Anchor` - News anchor style
- `Chinese (Mandarin)_Gentleman` - Gentleman style

**Example output:**
- [Sample TTS Output](samples/tts_output.mp3)

**Features:**
- Multiple voice options (327 voices available)
- Adjustable speed (0.5-2.0), volume (0-10), pitch (0.5-2.0)
- Supports long text up to 100,000 characters
- HD quality audio output

### Web Search (minimax-search)

Search the web for real-time information.

**Natural language:**
```
"Search for the latest AI developments"
"Look up information about quantum computing"
```

**Direct script usage:**
```bash
# Basic search
bun run skills/minimax-search/scripts/search.ts "Python best practices"

# Search returns JSON with organic results and related searches
bun run skills/minimax-search/scripts/search.ts "2024 AI trends"
```

**Output format:**
```json
{
  "organic": [
    {
      "title": "Search result title",
      "link": "https://example.com",
      "snippet": "Result summary...",
      "date": "2024-03-15"
    }
  ],
  "related_searches": [
    {"query": "related search term"}
  ]
}
```

### Image Analysis (minimax-image-analysis)

Analyze images and extract information including OCR.

**Natural language:**
```
"Analyze this image and describe what's in it"
"Extract the text from this screenshot"
"What does this chart show?"
```

**Direct script usage:**
```bash
# Analyze with default prompt (comprehensive analysis + OCR)
bun run skills/minimax-image-analysis/scripts/analyze.ts "photo.jpg"

# Extract text only
bun run skills/minimax-image-analysis/scripts/analyze.ts "document.jpg" "Extract all text from this image"

# Analyze UI screenshot
bun run skills/minimax-image-analysis/scripts/analyze.ts "screenshot.png" "Describe this interface and its features"

# Analyze chart/data visualization
bun run skills/minimax-image-analysis/scripts/analyze.ts "chart.png" "Analyze the data trends in this chart"

# Use URL instead of local file
bun run skills/minimax-image-analysis/scripts/analyze.ts "https://example.com/image.jpg"
```

**Supported formats:** JPEG, PNG, WebP (max 10MB)

### Usage Query (minimax-usage)

Monitor your MiniMax Token Plan quota and usage.

**Natural language:**
```
"Check my MiniMax Token Plan quota"
"How much quota do I have left?"
```

**Direct script usage:**
```bash
# Check usage for all models
bun run skills/minimax-usage/scripts/query.ts
```

**Sample output:**
```
================================
    Minimax Account Usage
================================

Model: abab6.5s-chat
--------------------------------
  Period:         2024-03-01 00:00 to 2024-03-31 23:59
  Quota:          10000 requests
  Used:           2345 requests (23.5%)
  Remaining:      7655 requests
  Resets In:      5d 12h 30m

================================
Query Time: 2024-03-25 14:30:00
================================
```

## Shortcut Commands

You can also use the shortcut commands defined in `package.json`:

```bash
bun run image "a cute cat"              # Image generation
bun run tts "Hello world"               # Text-to-speech
bun run search "AI news"                # Web search
bun run analyze "photo.jpg"             # Image analysis
bun run usage                           # Usage query
```

## Troubleshooting

### MINIMAX_API_KEY not set

Make sure you've exported your API key:
```bash
export MINIMAX_API_KEY="your-api-key-here"
```

### Real-name authentication required (Error 2038)

MiniMax Token Plan requires real-name authentication. Please complete the verification in your MiniMax account dashboard.

### Bun not found

Install Bun first:
```bash
curl -fsSL https://bun.sh/install | bash
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
