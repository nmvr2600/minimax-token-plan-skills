# MiniMax Token Plan Skills

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![MiniMax](https://img.shields.io/badge/MiniMax-API-green)](https://www.minimaxi.com)

[English](README.md) | [中文](README_CN.md)

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

Once installed, you can use these skills in two ways:

1. **Natural Language** - Just describe what you want in Claude Code
2. **Slash Commands** - Use `/skill-name` for direct access

> **Note:** Direct script execution (`bun run skills/...`) is also supported but primarily intended for Claude Code internal use.

### Image Generation (minimax-image)

Generate high-quality images from text descriptions.

**Natural language:**
```
"Draw a cyberpunk city at night with neon lights"
"Generate an image of a cat flying through space"
```

**Slash command:**
```
/minimax-image "futuristic city skyline at night, cyberpunk style, neon lights"
```

**Parameters:**
- `--aspect-ratio` or `-r`: Aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 21:9)
- `--n`: Number of images (1-9)
- `--output-dir` or `-o`: Output directory
- `--prefix` or `-p`: Filename prefix

**Supported aspect ratios:** `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9`

**Example outputs:**

> "a cat flying through space, comic style"

![Cat Flying](https://raw.githubusercontent.com/nmvr2600/minimax-token-plan-skills/main/samples/cat_flying_space_comic.jpeg)

> "cute cat poses, multiple angles"

![Cute Cats](https://raw.githubusercontent.com/nmvr2600/minimax-token-plan-skills/main/samples/cute_cat_poses_0.jpeg)

> "herdsman pointing to Xinghua village, traditional Chinese ink wash painting style"

![Ink Wash](https://raw.githubusercontent.com/nmvr2600/minimax-token-plan-skills/main/samples/herdsman_pointing_xinghua_village_ink_wash.jpeg)

### Text-to-Speech (minimax-speech)

Convert text to natural-sounding speech using MiniMax's async TTS API.

**Natural language:**
```
"Convert this paragraph to speech"
"Read this text aloud with a gentle female voice"
```

**Slash command:**
```
/minimax-speech "Chapter 1: The beginning of the story" --voice female-yujie --output story_chapter_1.mp3
```

**Parameters:**
- `--voice` or `-v`: Voice ID (female-tianmei, female-yujie, male-qn-qingse, etc.)
- `--speed` or `-s`: Speech speed 0.5-2.0
- `--vol`: Volume 0-10
- `--pitch` or `-p`: Pitch 0.5-2.0
- `--output` or `-o`: Output filename

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

**Slash command:**
```
/minimax-search "Python best practices 2024"
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

**Slash command:**
```
/minimax-image-analysis "screenshot.png" "Describe this interface and its features"
/minimax-image-analysis "https://example.com/image.jpg"
```

**Parameters:**
- First argument: Image path or URL
- Second argument (optional): Custom analysis prompt

**Supported formats:** JPEG, PNG, WebP (max 10MB)

**Supported formats:** JPEG, PNG, WebP (max 10MB)

### Usage Query (minimax-usage)

Monitor your MiniMax Token Plan quota and usage.

**Natural language:**
```
"Check my MiniMax Token Plan quota"
"How much quota do I have left?"
```

**Slash command:**
```
/minimax-usage
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

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- Powered by [MiniMax Token Plan](https://www.minimaxi.com)
- Built for [Claude Code](https://claude.ai/code)
