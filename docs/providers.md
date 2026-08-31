---
summary: All shipped AI providers with their provider IDs, labels and setup steps under Settings to Providers.
read_when:
  - you are adding or renaming a provider and need the ID and registration conventions
  - a user cannot get a specific provider to authenticate or appear in the list
---

# AI Provider Setup Guide

Skales ships 26 AI providers. Configure them in **Settings → Providers**.

Each provider entry has:

- a **provider ID** (the value stored in settings and used when a provider has to be named),
- a **label** shown in the UI,
- a flag for whether it needs an **API key**,
- a **default base URL** (most providers have one; a few do not),
- a curated list of **models**. Where the list is empty, the model list is read from the endpoint itself (`Refresh Models`), because the catalogue is whatever that machine or account currently serves.

Curated model lists are a starting point, not a limit. Every provider card accepts a manually entered model ID, and providers that expose an OpenAI-compatible `/v1/models` can refresh the list from the live endpoint.

---

## Provider overview

| ID | Label | API key | Default base URL |
| --- | --- | --- | --- |
| `skales_iq` | Skales IQ | no | `https://relay.skales.app/iq/v1` |
| `openrouter` | OpenRouter | yes | `https://openrouter.ai/api/v1` |
| `ollama` | Ollama | no | `http://127.0.0.1:11434/v1` |
| `lmstudio` | LM Studio | no | `http://127.0.0.1:1234/v1` |
| `skales_local` | Skales Local | no | `http://127.0.0.1:8234/v1` |
| `unsloth` | Unsloth Desktop | yes | `http://127.0.0.1:8888/v1` |
| `custom` | Custom (OpenAI-compatible) | no | none (you enter it) |
| `openai` | OpenAI | yes | `https://api.openai.com/v1` |
| `openai_oauth` | ChatGPT (Codex) | no (sign-in) | `https://chatgpt.com/backend-api` |
| `anthropic` | Anthropic | yes | `https://api.anthropic.com/v1` |
| `google` | Google AI | yes | `https://generativelanguage.googleapis.com/v1beta` |
| `groq` | Groq | yes | `https://api.groq.com/openai/v1` |
| `mistral` | Mistral AI | yes | `https://api.mistral.ai/v1` |
| `deepseek` | DeepSeek | yes | `https://api.deepseek.com/v1` |
| `xai` | xAI / Grok | yes | `https://api.x.ai/v1` |
| `together` | Together AI | yes | `https://api.together.xyz/v1` |
| `minimax` | Minimax | yes | `https://api.minimax.chat/v1` |
| `moonshot` | Moonshot AI | yes | `https://api.moonshot.ai/v1` |
| `glm` | GLM (z.ai) | yes | `https://api.z.ai/api/paas/v4` |
| `qwen` | Qwen (DashScope) | yes | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `hunyuan` | Hunyuan (Tencent) | yes | `https://tokenhub-intl.tencentmaas.com/v1` |
| `gigachat` | GigaChat (Sber) | yes | `https://api.giga.chat/v1` |
| `atlascloud` | Atlas Cloud | yes | `https://api.atlascloud.ai/v1` |
| `cloudflare_workers_ai` | Cloudflare Workers AI | yes | `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1` |
| `nvidia_nim` | Nvidia NIM | yes | `https://integrate.api.nvidia.com/v1` |
| `huggingface` | Hugging Face | yes | `https://router.huggingface.co/v1` |

Keyless providers: `ollama`, `lmstudio`, `skales_local`, `custom`, plus any user-added custom slot (`custom_<id>`). They authenticate by address, not by key. `unsloth` runs locally but still requires a key.

---

## Skales providers

### Skales IQ (`skales_iq`)

Free trial access provided by Skales itself. No API key and no account setup. Requests go through the Skales relay, which selects the upstream model; the client sees a single model ID.

- **Model**: `skales-iq`
- **Base URL**: `https://relay.skales.app/iq/v1`

### Skales Local (`skales_local`)

Models that run on the local machine using the inference server that ships with Skales. No key, no account, and nothing to install separately.

- **Models**: read from the endpoint (`Refresh Models`) — the list is whatever has been downloaded or imported.
- **Base URL**: `http://127.0.0.1:8234/v1`. The server negotiates a port at startup and stores the one it got, so the stored value takes precedence after the first start.

---

## Local runtimes

### Ollama (`ollama`)

**Getting started**

1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull a model: `ollama pull llama3.2`.
3. Start Ollama. Skales talks to it at `http://127.0.0.1:11434/v1`.

**Models**: `llama3.2`, `llama3.1`, `mistral`, `mixtral`, `codellama`, `deepseek-coder-v2`, `phi3`, `gemma3`, `gemma2`. Locally installed models can be listed from the endpoint.

**Key**: not required. An API key can be supplied to reach Ollama Cloud. If Ollama runs on another host, change the base URL in **Settings → Providers → Ollama**.

### LM Studio (`lmstudio`)

A provider of its own, not a case of `custom`. The port is prefilled and no key is asked for.

**Getting started**

1. Install [LM Studio](https://lmstudio.ai) and load a model.
2. Start its local server (default port `1234`).
3. Skales uses `http://127.0.0.1:1234/v1`.

**Models**: none curated. LM Studio serves whichever model is currently loaded; `Refresh Models` reads `/v1/models` and shows it.

### Unsloth Desktop (`unsloth`)

Runs models on the local machine, and is the one local provider that requires a key.

**Getting started**

1. Install and start Unsloth Desktop.
2. Create an API key in its own **Settings → API** screen (keys are prefixed `sk-unsloth`).
3. In Skales: **Settings → Providers → Unsloth Desktop** — paste the key.

**Models**: none curated; read from the endpoint.

**Base URL**: `http://127.0.0.1:8888/v1`. Unsloth Desktop can also be started on port `8000` or moved with `-p`; adjust the base URL if you did.

### Custom (OpenAI-compatible) (`custom`)

Any endpoint that implements the OpenAI chat completions API — llama.cpp, vLLM, koboldcpp, text-generation-webui, self-hosted gateways.

**Getting started**

1. **Settings → Providers → Custom**.
2. Enter the base URL, for example `http://localhost:8000/v1`.
3. Paste an API key only if your endpoint requires one.
4. Enter the model ID manually, or refresh the list from the endpoint.

There is no default base URL — the address is the configuration. Additional endpoints can be added as separate custom slots. Use **Test Connection** in the provider settings to verify reachability.

---

## Aggregators and routers

### OpenRouter (`openrouter`)

One key for models from many vendors.

**Getting started**: create a key at [openrouter.ai/keys](https://openrouter.ai/keys), then **Settings → Providers → OpenRouter**.

**Models**: `openai/gpt-5`, `openai/gpt-5-mini`, `anthropic/claude-sonnet-4`, `anthropic/claude-opus-4`, `anthropic/claude-3.5-haiku`, `google/gemini-3.6-flash`, `meta-llama/llama-3.3-70b-instruct:free`, `deepseek/deepseek-chat-v3-0324`, `mistralai/mistral-large-2411`, `openrouter/free`.

### Hugging Face (`huggingface`)

The HF Inference Providers Router: one `hf_` token, requests routed to Together, Fireworks, Cerebras, fal.ai and others.

**Models**: `meta-llama/Llama-4-Maverick-17B-128E-Instruct`, `Qwen/Qwen3-32B`, `deepseek-ai/DeepSeek-V3-0324`, `meta-llama/Llama-4-Scout-17B-16E-Instruct`, `mistralai/Mixtral-8x22B-Instruct-v0.1`. `deepseek-ai/DeepSeek-V4-Pro` and `deepseek-ai/DeepSeek-V4-Flash` are listed as download-only: the router does not serve them for chat, so they need local weights or a direct provider API. The full catalogue can be fetched live from the provider card.

### Atlas Cloud (`atlascloud`)

Aggregator covering chat, image, video and audio models behind one key, billed per use.

**Models**: `deepseek-ai/deepseek-v3.1`, `openai/gpt-5.5`, `anthropic/claude-opus-4.8`, `google/gemini-3.5-flash`, `qwen/qwen3.7-max`.

### Together AI (`together`)

**Models**: `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`, `meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo`, `mistralai/Mixtral-8x22B-Instruct-v0.1`, `databricks/dbrx-instruct`, `Qwen/Qwen2.5-72B-Instruct-Turbo`, `deepseek-ai/deepseek-r1`.

---

## Direct vendor APIs

### OpenAI (`openai`)

**Getting started**: create a key at [platform.openai.com](https://platform.openai.com), then **Settings → Providers → OpenAI**.

**Models**: `gpt-5.5`, `gpt-5.4-mini`, `gpt-5.4-nano`.

### ChatGPT (Codex) (`openai_oauth`)

A ChatGPT subscription used via sign-in instead of an API key. The credential is an OAuth token, so no key field is involved; Settings shows this as a subscription rather than a key card. A signed-in account also has its live model catalogue fetched.

**Models**: `gpt-5.5` (default), `gpt-5-codex`, `gpt-5.1-codex`, `gpt-5.1`, `gpt-5`.

### Anthropic (`anthropic`)

**Getting started**: create a key at [console.anthropic.com](https://console.anthropic.com), then **Settings → Providers → Anthropic**.

**Models**: `claude-fable-5`, `claude-opus-4-8`, `claude-sonnet-5`, `claude-sonnet-4-6`, `claude-haiku-4-5`.

### Google AI (`google`)

**Getting started**: create a key at [aistudio.google.com](https://aistudio.google.com), then **Settings → Providers → Google AI**.

**Models**: `gemini-3.6-flash`, `gemini-3.6-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`.

This key also powers image and video generation in Studio.

### Groq (`groq`)

**Getting started**: create a key at [console.groq.com](https://console.groq.com).

**Models**: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`, `deepseek-r1-distill-llama-70b`, `gemma2-9b-it`.

A Groq key also provides speech-to-text and text-to-speech for voice messages.

### Mistral AI (`mistral`)

**Getting started**: create a key at [console.mistral.ai](https://console.mistral.ai).

**Models**: `mistral-large-latest`, `mistral-medium-latest`, `mistral-small-latest`, `codestral-latest`, `open-mistral-nemo`.

### DeepSeek (`deepseek`)

**Getting started**: create a key at [platform.deepseek.com](https://platform.deepseek.com).

**Models**: `deepseek-chat` (V4 Flash), `deepseek-reasoner` (V4 Pro, reasoning, 1M context), `deepseek-coder`.

### xAI / Grok (`xai`)

**Getting started**: create a key at [console.x.ai](https://console.x.ai).

**Models**: `grok-4.3`, `grok-4`.

### Minimax (`minimax`)

**Models**: `abab6.5s-chat`, `abab6.5-chat`, `abab5.5s-chat`.

A Minimax key also reaches video generation in Studio.

### Moonshot AI (`moonshot`)

Kimi models. International and China endpoints are both available; the card carries an endpoint switch that rewrites the base URL.

**Models**: `kimi-k3`, `kimi-k2.7-code`, `kimi-k2.7-code-highspeed`, `kimi-k2.6`. Model IDs are pinned rather than rolling aliases, because a retired alias returns 404 on every request. Use `Refresh Models` to pick up newer releases.

### GLM (z.ai) (`glm`)

Zhipu GLM models. International and China endpoints available.

**Models**: `glm-5.2`, `glm-5.2-air`, `glm-4.6`.

### Qwen (DashScope) (`qwen`)

**Models**: `qwen3-max`, `qwen3-coder-plus`, `qwen3-plus`, `qwen3-turbo`.

### Hunyuan (Tencent) (`hunyuan`)

Singapore and China endpoints, switchable on the provider card. The default TokenHub host serves the `hy3` IDs; the legacy Hunyuan API host serves the `hunyuan-*` IDs.

**Models**: `hy3`, `hy3-preview`, `hunyuan-turbos-latest`, `hunyuan-vision`.

### GigaChat (Sber) (`gigachat`)

The credential is an Authorization Key, which is exchanged for a short-lived token. The Russian root certificate the endpoint needs ships with Skales, so the certificate field is only for supplying your own.

**Models**: `GigaChat-2`, `GigaChat-2-Pro`, `GigaChat-2-Max`, `GigaChat-3-Ultra`, and the previous generation `GigaChat`, `GigaChat-Pro`, `GigaChat-Max`. Once a key is stored, the live list is fetched from the endpoint.

### Cloudflare Workers AI (`cloudflare_workers_ai`)

Edge inference. The base URL contains your account ID: replace `{account_id}` in **Settings → Providers → Cloudflare Workers AI** before the first request.

**Models**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `@cf/meta/llama-3.1-70b-instruct`, `@cf/meta/llama-3.1-8b-instruct-fast`, `@cf/mistralai/mistral-small-3.1-24b-instruct`, `@cf/qwen/qwen2.5-coder-32b-instruct`, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`.

### Nvidia NIM (`nvidia_nim`)

Keys carry an `nvapi-` prefix.

**Models**: `nvidia/nemotron-3-super-120b-a12b`, `nvidia/nemotron-3-ultra-550b-a55b`, `z-ai/glm-5.2`, `deepseek-ai/deepseek-v4-pro`, `deepseek-ai/deepseek-v4-flash`, `openai/gpt-oss-120b`, `qwen/qwen3-next-80b-a3b-instruct`, `meta/llama-3.3-70b-instruct`.

The published NIM catalogue lists more models than actually answer a chat request; the list above is the verified subset.

---

## Capabilities beyond chat

Provider cards carry badges for what a provider does besides answering a chat turn:

- **voice** — the provider's key powers speech in Skales: `groq`, `openai`, `openrouter`.
- **media** — the provider's key reaches image or video generation in Studio: `google`, `openai`, `huggingface`, `openrouter`, `atlascloud`, `minimax`.
- **local** — the weights run on your own machine: `ollama`, `lmstudio`, `skales_local`, `unsloth`, `custom` and custom slots.
- **vision** — derived from the models on the provider's list rather than declared, so it cannot drift from what the models actually do.

---

## Choosing a provider

- **No setup at all**: Skales IQ, or Skales Local for on-device models.
- **Privacy**: Skales Local, Ollama, LM Studio, Unsloth Desktop, or a self-hosted custom endpoint.
- **Breadth from one key**: OpenRouter, Hugging Face, Atlas Cloud, Together AI.
- **Direct vendor access**: OpenAI, Anthropic, Google AI, Mistral, DeepSeek, xAI.
- **Low latency**: Groq, Cloudflare Workers AI.
- **Reasoning**: DeepSeek V4 Pro, DeepSeek R1 distills, the Claude and Gemini lines.

---

## Managing multiple providers

You can configure several providers and switch between them:

1. Add keys (or addresses, for keyless providers) for the providers you want.
2. Pick a default in **Settings → Providers**.
3. Override the provider and model per conversation.

A provider is available for a turn when it is switched on in the provider grid and has a credential — a pasted API key, a subscription token, or, for keyless providers, a reachable address.
