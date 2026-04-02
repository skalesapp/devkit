# AI Provider Setup Guide

This guide covers all 11 supported AI providers in Skales. Each provider offers different models and capabilities. Configure providers in **Settings → Providers**.

---

## 1. OpenRouter

**Overview**: Access 200+ models through a single unified API key.

**Getting Started**:
- Visit [openrouter.ai/keys](https://openrouter.ai/keys)
- Create or copy your API key
- In Skales: **Settings → Providers → OpenRouter → Paste API Key**

**Available Models**:
- GPT-4o (OpenAI)
- Claude Sonnet 4 (Anthropic)
- Gemini 2.0 Flash (Google)
- Llama 3.3 (Meta)
- DeepSeek V3
- Mistral Large

**Why Use It**: One API key gives you access to hundreds of models from different providers, making it easy to compare and switch between models.

---

## 2. Ollama (Local)

**Overview**: Run AI models locally on your machine with no API key required.

**Getting Started**:
1. Install Ollama from [ollama.com](https://ollama.com)
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama (runs on `localhost:11434` by default)
4. Skales auto-detects the running Ollama instance

**Available Models**:
- Llama 3.2
- Mistral
- Mixtral
- CodeLlama
- DeepSeek Coder V2
- Phi-3
- Gemma 2

**Why Use It**: Complete privacy—models run on your device with no data sent to external servers. Great for testing and development.

**Configuration**: No API key needed. Skales automatically detects Ollama at `localhost:11434`. If running on a different host, update the endpoint in **Settings → Providers → Ollama**.

---

## 3. Custom (OpenAI-Compatible)

**Overview**: Connect any OpenAI-compatible endpoint for maximum flexibility.

**Getting Started**:
1. Have an OpenAI-compatible endpoint ready
2. In Skales: **Settings → Providers → Custom**
3. Set Base URL (e.g., `http://localhost:8000/v1`)
4. Paste API key if required (optional)

**Supported Endpoints**:
- **LM Studio**: Local GUI for running open-source models
- **vLLM**: High-throughput, low-latency LLM inference server
- **llama.cpp**: Lightweight C++ inference engine
- **koboldcpp**: Browser-based frontend for llama.cpp

**Why Use It**: Connect to any LLM infrastructure that follows OpenAI's API specification. Perfect for self-hosted deployments and custom model servers.

**Testing Your Connection**: Use the "Test Connection" button in the provider settings to verify your endpoint is reachable.

---

## 4. OpenAI

**Overview**: Direct API access to OpenAI's latest models.

**Getting Started**:
- Visit [platform.openai.com](https://platform.openai.com)
- Create an API key in the **API keys** section
- In Skales: **Settings → Providers → OpenAI → Paste API Key**
- Set your usage limits and billing preferences on the OpenAI dashboard

**Available Models**:
- GPT-4o (latest, multimodal)
- GPT-4o Mini (faster, cheaper)
- GPT-4 Turbo
- o1 (reasoning-focused)
- o1-mini

**Why Use It**: Access to OpenAI's most advanced models. GPT-4o is excellent for complex reasoning and multimodal tasks.

**Pricing**: OpenAI uses pay-as-you-go pricing. Monitor usage in your account dashboard to avoid surprises.

---

## 5. Anthropic

**Overview**: Direct API access to Anthropic's Claude models.

**Getting Started**:
- Visit [console.anthropic.com](https://console.anthropic.com)
- Generate an API key
- In Skales: **Settings → Providers → Anthropic → Paste API Key**

**Available Models**:
- Claude Sonnet 4 (most capable)
- Claude 3.5 Sonnet
- Claude 3.5 Haiku
- Claude 3 Opus

**Why Use It**: Claude models are known for thoughtful reasoning, long-context understanding (200k tokens), and safety-conscious design.

**Advanced Features**: Anthropic supports batch processing and vision capabilities with image uploads.

---

## 6. Google AI

**Overview**: Access Google's Gemini family of models, plus image and video generation.

**Getting Started**:
- Visit [aistudio.google.com](https://aistudio.google.com)
- Create an API key
- In Skales: **Settings → Providers → Google AI → Paste API Key**

**Available Models**:
- Gemini 2.5 Flash (latest)
- Gemini 2.0 Flash (fast, multimodal)

**Additional Capabilities**:
- **Imagen**: Generate, edit, and enhance images
- **Veo**: Generate high-quality videos from text prompts

**Why Use It**: Gemini models are fast, multimodal, and optimized for reasoning. The bundled image and video generation tools extend creative possibilities.

---

## 7. Groq

**Overview**: Ultra-fast LLM inference with impressive speed-to-quality ratio.

**Getting Started**:
- Visit [console.groq.com](https://console.groq.com)
- Create an API key
- In Skales: **Settings → Providers → Groq → Paste API Key**

**Available Models**:
- Llama 3.3 70B (latest, fastest)
- Llama 3.1 8B
- DeepSeek R1 Distill

**Why Use It**: Groq specializes in inference speed. If low-latency responses are critical, Groq delivers exceptional performance.

---

## 8. Mistral AI

**Overview**: Efficient, open-source-inspired models with strong reasoning capabilities.

**Getting Started**:
- Visit [console.mistral.ai](https://console.mistral.ai)
- Generate an API key
- In Skales: **Settings → Providers → Mistral AI → Paste API Key**

**Available Models**:
- Mistral Large (most capable)
- Mistral Medium
- Mistral Small (efficient)
- Codestral (code-specialized)
- Mistral Nemo (lightweight)

**Why Use It**: Mistral models offer a good balance of capability and efficiency. Codestral is particularly strong for code generation and completion.

---

## 9. DeepSeek

**Overview**: Advanced models including reasoning-focused variants.

**Getting Started**:
- Visit [platform.deepseek.com](https://platform.deepseek.com)
- Create an API key
- In Skales: **Settings → Providers → DeepSeek → Paste API Key**

**Available Models**:
- DeepSeek V3 (latest, general-purpose)
- DeepSeek Coder (code generation)
- DeepSeek R1 (reasoning-optimized)

**Why Use It**: DeepSeek V3 is particularly strong for Chinese language tasks and competitive pricing. R1 is excellent for mathematical and logical reasoning.

---

## 10. xAI / Grok

**Overview**: Access to Elon Musk's Grok models with real-time information access.

**Getting Started**:
- Visit [console.x.ai](https://console.x.ai)
- Create an API key
- In Skales: **Settings → Providers → xAI → Paste API Key**

**Available Models**:
- Grok 2 (latest, multimodal)
- Grok 2 Vision (specialized for vision tasks)
- Grok Beta

**Why Use It**: Grok models can access real-time information from X (Twitter). Useful for current events awareness and social media monitoring.

---

## 11. Together AI

**Overview**: Unified API for many open-source models hosted in the cloud.

**Getting Started**:
- Visit [api.together.xyz](https://api.together.xyz)
- Generate an API key
- In Skales: **Settings → Providers → Together AI → Paste API Key**

**Available Models**:
- Llama 3 70B (Meta)
- Llama 3.1 405B (largest open model)
- Mixtral 8x22B (high-quality open model)
- Qwen 2.5 72B (strong multilingual support)

**Why Use It**: Together AI offers many open-source models with competitive pricing. Great for exploring diverse model families without managing individual API keys.

---

## Choosing a Provider

**For Cost-Effectiveness**: OpenRouter, Together AI, or Groq
**For Privacy**: Ollama (local) or Custom (self-hosted)
**For Cutting-Edge**: OpenAI (GPT-4o), Anthropic (Claude Sonnet 4), Google (Gemini)
**For Reasoning**: DeepSeek R1, OpenAI o1, Anthropic Claude
**For Speed**: Groq, Mistral
**For Open-Source Diversity**: Together AI, Ollama

---

## Managing Multiple Providers

You can configure multiple providers and switch between them:
1. Add API keys for different providers
2. Select your preferred provider in **Settings → Default Provider**
3. Override per conversation if needed

This allows you to compare models, manage costs, or use specialized providers for specific tasks.
