# Agent Skills

Agent Skills are portable skill definitions that teach the AI assistant new capabilities and behaviors. Skills are written as `SKILL.md` files and can be shared, imported, and managed across different AI tools and environments.

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the skill |
| `description` | string | Yes | Brief description (one sentence) |
| `version` | string | Yes | Semantic version (e.g., "1.0.0") |
| `metadata.author` | string | No | Author name |
| `metadata.category` | string | No | Skill category (e.g., "development", "devops", "data") |
| `metadata.tags` | array | No | Search tags for discovery |
| `metadata.compatible_with` | array | No | List of compatible tools/platforms |

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

1. Open Skales application
2. Go to **Settings** → **Agent Skills**
3. View all installed skills with their descriptions and versions

### Enabling and Disabling Skills

1. Open **Settings** → **Agent Skills**
2. Toggle the switch next to each skill to enable/disable
3. Enabled skills are injected into the system prompt automatically
4. Changes take effect immediately on the next chat message

### Skill State File

Skales maintains a state file tracking which skills are enabled/disabled:

```
~/.skales-data/agent-skills-state.json
```

**Example content:**

```json
{
  "web-development": {
    "enabled": true,
    "version": "1.0.0"
  },
  "data-analysis": {
    "enabled": false,
    "version": "2.1.0"
  },
  "devops-automation": {
    "enabled": true,
    "version": "1.3.2"
  }
}
```

---

## Importing Skills

### From GitHub URL

1. Go to **Settings** → **Agent Skills**
2. Click **Import Skill**
3. Enter the GitHub repository URL: `https://github.com/username/skill-repo`
4. Select the skill to import
5. Click **Install**

Example: `https://github.com/anthropic/skills-library`

### From Local Folder

1. Create a skill in the correct format locally
2. Go to **Settings** → **Agent Skills**
3. Click **Import from Folder**
4. Browse to select the folder containing `SKILL.md`
5. Click **Import**

The skill will be copied to `~/.skales-data/agent-skills/<skill-name>/`

### From Community Catalogs

Skales includes links to community skill repositories:

- **Anthropic Skills Registry**: Official skills from Anthropic
- **Community Catalog**: Community-contributed skills
- **GitHub Search**: Search for skills by tag or category on GitHub

---

## Cross-Platform Compatibility

Agent Skills work across multiple AI tools and platforms:

- **Claude Code**: Full support
- **Codex CLI**: Full support
- **GitHub Copilot**: Full support (with SKILL.md format)
- **Cursor**: Full support
- **Custom Tools**: Can be adapted for any tool supporting SKILL.md

Add compatibility information in the frontmatter:

```yaml
metadata:
  compatible_with:
    - claude-code
    - codex-cli
    - copilot
    - cursor
    - custom-platform
```

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

Update your skills to keep them current:

1. Edit the SKILL.md file
2. Increment the version number following [semantic versioning](https://semver.org/)
   - MAJOR (1.0.0): Breaking changes
   - MINOR (1.1.0): New features, backward compatible
   - PATCH (1.0.1): Bug fixes
3. Update the modification date in metadata
4. Re-import or reinstall if sharing with others

**Example version progression:**

```
1.0.0 → 1.0.1 (bug fix in example code)
1.0.1 → 1.1.0 (added new section on testing)
1.1.0 → 2.0.0 (major restructure, breaking changes)
```

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
- Check if the skill is enabled in Settings → Agent Skills
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
- **Community**: Visit [community.skales.app](https://community.skales.app) to discuss skills

---

## Key Takeaways

- Agent Skills teach AI new capabilities using SKILL.md files
- Store skills in `~/.skales-data/agent-skills/<skill-name>/SKILL.md`
- Skills work across Claude Code, Codex CLI, Copilot, Cursor, and more
- Enable/disable skills in Settings → Agent Skills
- Share skills on GitHub or community catalogs
- Keep skills focused, well-documented, and up-to-date

For more information, visit the [Skales documentation](https://docs.skales.app) or community forums.
