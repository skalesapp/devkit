# Agent Skills

Agent Skills are portable instruction sets that teach the AI assistant how to do something. They are written as `SKILL.md` files and can be shared and imported across AI tools that support the format.

In the Skales UI this surface is called **Custom Skills** — a page in the sidebar, not a section in Settings. `SKILL.md` skills and executable JavaScript custom skills both live there. This page covers the `SKILL.md` half; the executable half is described in [Capabilities](./capabilities.md).

A skill does not grant tools. It teaches the agent how to use the tools it already has.

## What Are Agent Skills?

Agent Skills are instruction sets bundled as Markdown files with YAML frontmatter. They teach the AI about:

- Available tools and how to use them
- Domain-specific knowledge and best practices
- Step-by-step procedures for common tasks
- Custom behaviors and preferences
- Integration patterns with external systems

Skills are **loaded dynamically** on each chat turn, meaning the AI has access to the latest skill definitions without requiring application restarts.

## Skill Storage Location

All agent skills are stored in:

```
~/.skales-data/agent-skills/<skill-name>/SKILL.md
```

**Directory structure example:**

```
~/.skales-data/agent-skills/
├── web-development/
│   └── SKILL.md
├── data-analysis/
│   └── SKILL.md
├── devops-automation/
│   └── SKILL.md
└── custom-api/
    └── SKILL.md
```

Each skill has its own directory, and the main skill file must be named `SKILL.md`.

## SKILL.md Format

Agent Skills use a specific format combining YAML frontmatter and Markdown content:

### Basic Structure

```yaml
---
name: Skill Display Name
description: Short description of what this skill teaches
version: 1.0.0
metadata:
  author: Your Name
  category: development
  tags: [web, react, frontend]
  compatible_with:
    - claude-code
    - codex-cli
    - copilot
    - cursor
---

# Skill Name

## Overview
Detailed explanation of this skill's purpose and capabilities.

## Available Tools
List the tools this skill works with...

## Key Concepts
Explain important concepts...

## Usage Examples
```

### Frontmatter Fields

These are the fields Skales actually reads:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | The skill's identifier. Written as a single token with no spaces (`web-development`), because that is what the agent matches on. Falls back to the folder name when absent. |
| `description` | string | Yes | One sentence. Shown to the model, and shortened to 160 characters when the skill library is large enough to switch to manifest mode. |
| `disable-model-invocation` | boolean | No | `true` means only a human may invoke this skill by name. It is then never advertised to the model. |
| `metadata.invocation` | string | No | `user` does the same as the flag above; anything else leaves it model-invocable. |
| `metadata.category` | string | No | Grouping label |
| `author`, `source`, `license` | string | No | Attribution, read for the built-in skills |

Anything else in the frontmatter parses without error but is read by nothing. In particular `version` and `metadata.compatible_with` are **not** read: no compatibility is checked, and no version is compared. Keep them if they help humans; do not expect them to do anything.

The frontmatter parser is deliberately small. It handles `key: value` lines and one level of nesting under `metadata:` with two-space indentation. It does not understand YAML lists, block scalars or anchors — write a comma-separated string rather than a list if you want the value to survive.

### Markdown Body

After the frontmatter, the skill content is written in Markdown. Include:

- **Overview**: What the skill teaches
- **Available Tools**: Specific tools or APIs this skill covers
- **Key Concepts**: Important principles and patterns
- **Usage Examples**: Concrete examples showing how to use the skill
- **Best Practices**: Recommended approaches
- **Common Patterns**: Frequent use cases and solutions
- **Troubleshooting**: Common issues and fixes

## Complete Example SKILL.md

```yaml
---
name: API Development with Node.js and Express
description: Learn to build RESTful APIs with Node.js, Express, and best practices
version: 1.0.0
metadata:
  author: DevKit Community
  category: development
  tags: [nodejs, express, api, backend, rest]
  compatible_with:
    - claude-code
    - codex-cli
    - copilot
    - cursor
---

# API Development with Node.js and Express

## Overview

This skill teaches how to build production-grade RESTful APIs using Node.js and Express.js. It covers:

- Structuring Express applications
- Creating RESTful endpoints
- Error handling and validation
- Middleware configuration
- Authentication and authorization
- Testing and debugging

## Available Tools

- **Express.js**: Web framework
- **Node.js**: JavaScript runtime
- **NPM**: Package management
- **Jest/Mocha**: Testing frameworks
- **Postman/cURL**: API testing

## Key Concepts

### RESTful Design
REST (Representational State Transfer) uses HTTP methods and status codes:
- GET: Retrieve resources
- POST: Create new resources
- PUT: Update resources
- DELETE: Remove resources

### Middleware
Middleware functions process requests/responses:
- Authentication middleware
- Logging middleware
- Error handling middleware
- CORS middleware

### Error Handling
Use appropriate HTTP status codes and error responses:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Usage Examples

### Creating a Basic Express Server

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// GET endpoint
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// POST endpoint
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 1, name, email });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Custom Middleware

```javascript
// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  next();
};

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ data: 'protected' });
});
```

### Error Handling

```javascript
app.get('/api/users/:id', (req, res, next) => {
  try {
    const user = findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});
```

## Best Practices

1. **Validate Input**: Always validate and sanitize user input
2. **Use Status Codes**: Return appropriate HTTP status codes
3. **Document Endpoints**: Use OpenAPI/Swagger for documentation
4. **Handle Errors**: Implement comprehensive error handling
5. **Test Thoroughly**: Write unit and integration tests
6. **Version Your API**: Use URL versioning (/api/v1/)
7. **Rate Limiting**: Implement rate limiting for production
8. **Logging**: Log important events and errors

## Common Patterns

### Pagination

```javascript
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = getAllUsers().slice(skip, skip + limit);
  res.json({ users, page, limit });
});
```

### Request Validation

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/users',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Create user
  }
);
```

## Troubleshooting

**Problem**: CORS errors when calling API from browser
**Solution**: Enable CORS middleware:
```javascript
const cors = require('cors');
app.use(cors());
```

**Problem**: Requests hang indefinitely
**Solution**: Ensure middleware calls `next()` or sends a response

**Problem**: 404 errors for valid routes
**Solution**: Check route definition order; more specific routes should come before wildcard routes
```

---

## Managing Skills in Skales

### Viewing Available Skills

1. Open Skales
2. Go to the **Custom Skills** page in the sidebar
3. It lists both the 28 built-in skills and everything you imported

There is no "Agent Skills" section in Settings, and the **Add-Ons** page (`/skills`) is a different thing entirely — those are feature switches for surfaces and integrations.

### Enabling and Disabling Skills

1. Open the **Custom Skills** page
2. Toggle the switch next to a skill
3. Changes take effect on the next chat message

### Skill State File

Skales maintains a state file tracking which skills are enabled/disabled:

```
~/.skales-data/agent-skills/agent-skills-state.json
```

It lives **inside** `agent-skills/`, next to the skill folders, not beside that directory. It is keyed by folder name and holds nothing but the switch:

```json
{
  "web-development": { "enabled": true },
  "data-analysis": { "enabled": false }
}
```

The file is **opt-out**: a missing file, or a skill with no entry, means enabled. A fresh install has every built-in skill on. The same file gates built-ins and imports alike.

---

## Importing Skills

The Custom Skills page carries three import tabs — GitHub, folder, and paste — plus a generator.

### From a GitHub URL

Point it at a repository or a subfolder containing a `SKILL.md`, pick the skill, install.

An import takes the `SKILL.md` plus, at most, **100 files and 2 MB** from `scripts/` and `references/`, one level deep. Nothing else in the repository is copied, and nothing is executed at import time.

Example: `https://github.com/anthropics/skills`

### From a Local Folder

Select the folder that contains the `SKILL.md`. It is copied to `~/.skales-data/agent-skills/<skill-name>/`; the original is left alone.

### By Pasting

Paste a whole `SKILL.md` into the paste tab. It is validated before it installs: the frontmatter has to open and close, `name` has to be present and free of whitespace, `description` has to be present, and the body has to be non-empty. Up to 48 KB.

### By Generating One

Describe what you want and a model writes the skill. The result runs through the same validator, with retries; a result that stays invalid is reported rather than installed.

### From the Discover Feed

Skills shared to the [Discover feed](https://feed.skales.app) can be forked into your own install with one action.

---

## Built-in Skills

**28 skills ship with Skales.** They live inside the app, are read-only, and are listed on the Custom Skills page alongside your own. They are gated by the same state file, so any of them can be switched off.

A skill you import under the same name as a built-in **replaces** it, compared case-insensitively.

---

## Progressive Disclosure

Skill libraries grow, and a prompt has a budget. Skales handles that in two modes:

- **Under about 12,000 characters** of combined body length across model-invocable skills, every body goes into the prompt in full.
- **Above it**, the prompt carries a manifest instead — one line per skill, name and a description shortened to 160 characters — plus the full body of any skill the message names.

"Names" means exactly that: the skill's name appears in the message at a word boundary, in its written form, with spaces instead of hyphens, or as `/name`. Substrings do not count, so a skill called `research` is not pulled in by the word "researching".

The agent can also load a body itself with the `read_skill` tool once it has seen the manifest.

Skills marked `disable-model-invocation: true` never appear in the manifest at all. They enter the prompt only when a human names them — which is what you want for a skill that is expensive, dangerous, or only relevant on request.

---

## Cross-Platform Compatibility

Agent Skills work across multiple AI tools and platforms:

- **Claude Code**: Full support
- **Codex CLI**: Full support
- **GitHub Copilot**: Full support (with SKILL.md format)
- **Cursor**: Full support
- **Custom Tools**: Can be adapted for any tool supporting SKILL.md

The format is what travels, not a declaration: Skales does not read `metadata.compatible_with` and does not check compatibility against anything. A skill is portable because `SKILL.md` is plain Markdown with frontmatter, and it stays portable as long as you keep the body free of assumptions about one particular host.

---

## Writing Good Skills

### Structure

1. **Clear Name**: Use descriptive, searchable names
   - Good: "React Component Development Best Practices"
   - Bad: "React Stuff"

2. **Concise Description**: One sentence explaining the skill
   - "Learn to create reusable, accessible React components with TypeScript"

3. **Well-Organized Sections**: Use clear headings and logical flow

4. **Practical Examples**: Every concept should have concrete code examples

5. **Focused Scope**: Keep skills focused on a specific domain
   - One skill per language/framework/domain
   - Avoid mixing unrelated topics

### Do's

- Start with fundamentals before advanced topics
- Include multiple examples for each concept
- Show both good and bad patterns
- Explain the "why" behind recommendations
- Link to official documentation
- Keep code examples up-to-date
- Test that examples actually work

### Don'ts

- Don't mix multiple unrelated technologies
- Don't assume advanced knowledge without context
- Don't include outdated patterns
- Don't make the skill too long (keep it under 5000 words)
- Don't skip error handling in examples
- Don't include proprietary or sensitive information

---

## Updating and Versioning

Editing a skill is editing its `SKILL.md`. The change is picked up on the next chat message; nothing needs restarting and nothing needs re-importing on your own machine.

A `version` field is for the humans reading your repository. Skales does not read it, does not compare it, and will not notice that a newer one exists — an imported skill is a copy, and updating it means importing again. If you publish skills for others, [semantic versioning](https://semver.org/) is still the convention worth following in the file and in your release notes.

---

## Sharing Skills

### Publishing to GitHub

1. Create a GitHub repository
2. Add your `SKILL.md` file to the root
3. Include a README with installation instructions
4. Tag with topics: "agent-skill", "skales", etc.
5. Share the repository URL with others

### Contributing to Community Catalogs

1. Open a PR on the official Skales Skills Registry
2. Include tests demonstrating the skill works
3. Follow the contribution guidelines
4. Community moderators will review and approve

---

## Troubleshooting Skills

**Skill Not Appearing**
- Verify SKILL.md is in the correct location: `~/.skales-data/agent-skills/<skill-name>/SKILL.md`
- Restart Skales application
- Check that the YAML frontmatter is valid

**Skills Not Being Used**
- Check whether the skill is enabled on the Custom Skills page
- Verify the skill is relevant to your task
- Try enabling debug logging to see what's injected

**Examples Not Working**
- Test examples independently before relying on them
- Check for missing dependencies
- Verify the Node.js/Python version matches requirements

---

## Advanced Topics

### Dynamic Skill Loading

Skills are loaded on each chat turn, allowing you to:
- Modify a skill and see changes immediately
- Enable/disable skills without restarting
- Test skill changes in real-time

### Skill Composition

Create meta-skills that reference other skills:

```yaml
---
name: Full-Stack Web Development
description: Combines frontend, backend, and database skills
metadata:
  composed_of:
    - react-component-development
    - nodejs-api-development
    - database-design
---
```

### Conditional Skill Loading

You can organize skills by context:
- Load "DevOps" skills only when working on infrastructure
- Load "Data Analysis" skills only for data-related tasks
- Load "Security" skills for security-focused conversations

---

## Support and Resources

- **Documentation**: See [getting-started.md](./getting-started.md) for setup
- **API Reference**: [api-reference.md](./api-reference.md) for integrating skills with APIs
- **Examples**: Check the Skales Skills Repository for community examples
- **Community**: Share skills through the [Discover feed](https://feed.skales.app), or discuss them in [GitHub Discussions](https://github.com/skalesapp/skales/discussions)

---

## Key Takeaways

- Agent Skills teach AI new capabilities using SKILL.md files
- Store skills in `~/.skales-data/agent-skills/<skill-name>/SKILL.md`
- Skills work across Claude Code, Codex CLI, Copilot, Cursor, and more
- Enable and disable skills on the Custom Skills page
- Share skills on GitHub or community catalogs
- Keep skills focused, well-documented, and up-to-date

For more information, visit the [Skales documentation](https://docs.skales.app) or [GitHub Discussions](https://github.com/skalesapp/skales/discussions).
