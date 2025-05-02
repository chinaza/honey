# HoneyJS

[![NPM Version](https://img.shields.io/npm/v/@chinaza/honey.svg)](https://www.npmjs.com/package/@chinaza/honey)
[![License](https://img.shields.io/npm/l/@chinaza/honey.svg)](https://github.com/chinaza/honey/blob/main/LICENSE)
[![Node Version](https://img.shields.io/node/v/@chinaza/honey.svg)](https://nodejs.org)

A TypeScript-based Node.js declarative library for building RESTful APIs with seamless integration to PostgreSQL databases using Sequelize ORM. HoneyJS streamlines the process of creating, reading, updating, deleting, and upserting data with a focus on simplicity and reusability.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Core Methods](#core-methods)
  - [CRUD Operations](#crud-operations)
  - [Advanced Usage](#advanced-usage)
- [Database Utilities](#database-utilities)
- [Error Handling](#error-handling)
- [Middleware](#middleware)
- [Examples](#examples)
- [Custom Express Routes](#custom-express-routes)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Declarative API Definition**: Define your REST endpoints with simple configuration objects
- **Full CRUD Support**: Built-in controllers for create, read, update, delete, and upsert operations
- **PostgreSQL Integration**: Seamless connection to PostgreSQL via Sequelize ORM
- **Query Building**: Flexible filtering, sorting, and pagination
- **Middleware Support**: Add custom middleware to your routes
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions
- **Validation**: Request validation using Joi
- **Error Handling**: Consistent error handling and response formatting
- **Swagger Documentation**: Automatic OpenAPI documentation generation

## Prerequisites

- Node.js (>=20.9.0)
- PostgreSQL database
- TypeScript (for TypeScript projects)
- Create the relevant tables and data models for your Postgres database. You can use the exposed sequelize utility functions and migrations to do this.
- See <https://github.com/chinaza/generator-honeyjs> to generate a project

## Installation

```bash
# Using npm
npm install @chinaza/honey

# Using yarn
yarn add @chinaza/honey
```

## Quick Start

1. Create a new file (e.g., `server.ts` or `server.js`)

```typescript
import { createHoney } from '@chinaza/honey';

// Initialize HoneyJS with port and database connection string
const honey = createHoney(
  '3000',
  'postgresql://username:password@localhost:5432/database'
);

// Define a simple CRUD API for 'users' resource
honey.get({
  resource: 'users',
  fields: ['id', 'name', 'email', 'created_at']
});

honey.getById({
  resource: 'users',
  fields: ['id', 'name', 'email', 'created_at']
});

honey.create({
  resource: 'users',
  params: {
    name: 'string',
    email: 'string',
    created_at: '@updatedAt'
  },
  message: 'User created successfully'
});

honey.updateById({
  resource: 'users',
  params: {
    name: 'replace',
    email: 'replace'
  },
  message: 'User updated successfully'
});

honey.deleteById({
  resource: 'users',
  message: 'User deleted successfully'
});

// Start the server
honey.startServer();
```

2. Run your server:

```bash
# If using TypeScript
npx ts-node server.ts

# If using JavaScript
node server.js
```

Your API will be available at `http://localhost:3000/api/users`

## Configuration

### Database Connection

You can connect to your PostgreSQL database using either a connection string or a configuration object:

```typescript
// Using connection string
const honey = createHoney(
  '3000',
  'postgresql://username:password@localhost:5432/database'
);

// Using configuration object
const honey = createHoney('3000', {
  host: 'localhost',
  port: 5432,
  user: 'username',
  password: 'password',
  database: 'database'
});
```

### Environment Variables

HoneyJS supports configuration through environment variables. Create a `.env` file in your project root:

```
PORT=3000
DB_URI=postgresql://username:password@localhost:5432/database
```

Then initialize HoneyJS without parameters:

```typescript
import { createHoney } from '@chinaza/honey';

const honey = createHoney(process.env.PORT, process.env.DB_URI);
```

## API Reference

### Core Methods

#### `createHoney(port, dbOptions, metadata?)`

Creates a new HoneyJS instance.

- `port`: Server port number or string
- `dbOptions`: PostgreSQL connection string or configuration object
- `metadata` (optional): Additional configuration options
  - `fallbackErrorMessage`: Custom 404 error message
  - `routePrefix`: API route prefix (default: `/api`)

Returns a `Honey` instance.

#### `honey.startServer()`

Starts the HTTP server.

#### `honey.addMiddleware(middleware[])`

Adds global middleware to all routes.

### CRUD Operations

#### `honey.create(options)`

Creates a POST endpoint for creating new resources.

```typescript
honey.create({
  resource: 'posts', // Resource name (used in URL path)
  table: 'blog_posts', // Optional: Table name if different from resource
  params: {
    // Request body parameters
    title: 'string', // Parameter type validation
    content: 'string',
    author_id: 'number',
    published: 'boolean',
    metadata: 'json', // For JSON fields
    created_at: '@updatedAt' // Special value to set current timestamp
  },
  message: 'Post created', // Success message
  pathOverride: '/blog/posts', // Optional: Custom path
  middleware: [authMiddleware], // Optional: Route-specific middleware
  processResponseData: (data, req) => {
    // Optional: Transform response data
    return { ...data, extra: 'info' };
  }
});
```

#### `honey.get(options)`

Creates a GET endpoint for retrieving a list of resources.

```typescript
honey.get({
  resource: 'posts',
  fields: ['id', 'title', 'author_id', 'created_at'], // Fields to return
  filter: {
    // Optional: Query filters
    title: {
      operator: 'like', // Filter operator
      value: 'string' // Parameter type
    },
    published: {
      operator: '=',
      value: 'boolean'
    },
    $or: {
      // Logical OR condition
      title: {
        operator: 'like',
        value: 'string'
      },
      content: {
        operator: 'like',
        value: 'string'
      }
    }
  },
  format: {
    // Optional: Sorting
    sort: 'DESC', // ASC or DESC
    sortField: 'created_at' // Field to sort by
  }
});
```

#### `honey.getById(options)`

Creates a GET endpoint for retrieving a single resource by ID.

```typescript
honey.getById({
  resource: 'posts',
  fields: ['id', 'title', 'content', 'author_id', 'created_at'],
  idField: 'slug', // Optional: Use a different field as identifier (default: 'id')
  filter: {
    // Optional: Additional filters
    published: {
      operator: '=',
      overrideValue: true // Force a value regardless of request
    }
  }
});
```

#### `honey.updateById(options)`

Creates a PUT endpoint for updating a resource by ID.

```typescript
honey.updateById({
  resource: 'posts',
  params: {
    title: 'replace', // Replace the value
    views: 'inc', // Increment the value
    likes: 'dec', // Decrement the value
    updated_at: '@updatedAt' // Set to current timestamp
  },
  message: 'Post updated',
  idField: 'slug' // Optional: Use a different field as identifier
});
```

#### `honey.update(options)`

Creates a PUT endpoint for updating multiple resources based on filters.

```typescript
honey.update({
  resource: 'posts',
  params: {
    published: 'replace',
    updated_at: '@updatedAt'
  },
  filter: {
    // Required: Filter criteria
    author_id: {
      operator: '=',
      value: 'number'
    }
  },
  message: 'Posts updated'
});
```

#### `honey.upsertById(options)`

Creates a PUT endpoint for upserting a resource by ID.

```typescript
honey.upsertById({
  resource: 'posts',
  params: {
    title: 'replace',
    content: 'replace',
    updated_at: '@updatedAt'
  },
  message: 'Post upserted',
  idField: 'id' // Field to use for conflict detection
});
```

#### `honey.upsert(options)`

Creates a PUT endpoint for upserting a resource with custom conflict resolution.

```typescript
honey.upsert({
  resource: 'posts',
  params: {
    title: 'replace',
    content: 'replace',
    slug: 'replace',
    updated_at: '@updatedAt'
  },
  message: 'Post upserted',
  conflictTarget: ['slug'] // Fields to check for conflicts
});
```

#### `honey.deleteById(options)`

Creates a DELETE endpoint for deleting a resource by ID.

```typescript
honey.deleteById({
  resource: 'posts',
  message: 'Post deleted',
  idField: 'id', // Optional: Field to use as identifier
  filter: {
    // Optional: Additional filters
    author_id: {
      operator: '=',
      value: 'number'
    }
  }
});
```

### Advanced Usage

#### Custom Response Processing

```typescript
honey.getById({
  resource: 'users',
  fields: ['id', 'name', 'email', 'role_id'],
  processResponseData: async (data, req) => {
    // Fetch related data
    const role = await fetchRoleById(data.role_id);

    // Transform response
    return {
      ...data,
      role: role.name,
      _links: {
        self: `/api/users/${data.id}`,
        posts: `/api/users/${data.id}/posts`
      }
    };
  }
});
```

#### Custom Error Handling

```typescript
honey.create({
  resource: 'users',
  params: {
    email: 'string',
    password: 'string'
  },
  message: 'User created',
  processErrorResponse: (err) => {
    // Customize error response
    if (err.message.includes('duplicate key')) {
      return new HttpError('Email already exists', 409);
    }
    return err;
  }
});
```

## Database Utilities

HoneyJS provides several utilities for working directly with the database.

### Sequelize Model Definition

```typescript
import { defineModel, DataTypes } from '@chinaza/honey';

const User = defineModel('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default User;
```

### Raw Query Execution

```typescript
import { runDbQuery, QueryTypes } from '@chinaza/honey';

async function getUsersWithPosts() {
  const query = `
    SELECT u.id, u.name, COUNT(p.id) as post_count 
    FROM users u
    LEFT JOIN posts p ON u.id = p.author_id
    GROUP BY u.id, u.name
  `;

  return runDbQuery(query, { type: QueryTypes.SELECT });
}
```

## Error Handling

HoneyJS provides a consistent error handling mechanism:

```typescript
import { HttpError, handleHttpError } from '@chinaza/honey';

// In your middleware or custom controller
try {
  // Some operation
  if (!user) {
    throw new HttpError('User not found', 404);
  }
} catch (error) {
  handleHttpError(error, res);
}
```

## Middleware

### Request Validation

HoneyJS includes built-in request validation using Joi:

```typescript
import { validateRequestData } from '@chinaza/honey';
import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18)
});

honey.create({
  resource: 'users',
  params: {
    name: 'string',
    email: 'string',
    age: 'number'
  },
  message: 'User created',
  middleware: [validateRequestData(userSchema)]
});
```

### Custom Middleware

```typescript
import { Middleware } from '@chinaza/honey';

const authMiddleware: Middleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify token and attach user to request
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

honey.addMiddleware([authMiddleware]);
```

## Examples

### Complete API Example

```typescript
import { createHoney, HttpError } from '@chinaza/honey';

const honey = createHoney(
  '3000',
  'postgresql://postgres:password@localhost:5432/blog'
);

// Authentication middleware
const authMiddleware = (req, res, next) => {
  // Implementation omitted for brevity
};

// Posts API
honey.get({
  resource: 'posts',
  fields: ['id', 'title', 'excerpt', 'author_id', 'created_at'],
  filter: {
    title: { operator: 'like', value: 'string' },
    author_id: { operator: '=', value: 'number' }
  },
  format: { sort: 'DESC', sortField: 'created_at' }
});

honey.getById({
  resource: 'posts',
  fields: ['id', 'title', 'content', 'author_id', 'created_at', 'updated_at'],
  processResponseData: async (data, req) => {
    // Fetch author details
    const author = await fetchAuthor(data.author_id);
    return { ...data, author };
  }
});

honey.create({
  resource: 'posts',
  params: {
    title: 'string',
    content: 'string',
    excerpt: 'string',
    author_id: 'number',
    created_at: '@updatedAt'
  },
  message: 'Post created successfully',
  middleware: [authMiddleware]
});

honey.updateById({
  resource: 'posts',
  params: {
    title: 'replace',
    content: 'replace',
    excerpt: 'replace',
    updated_at: '@updatedAt'
  },
  message: 'Post updated successfully',
  middleware: [authMiddleware]
});

honey.deleteById({
  resource: 'posts',
  message: 'Post deleted successfully',
  middleware: [authMiddleware]
});

// Start the server
honey.startServer();
```

### Custom Route and Controller

```typescript
import { createHoney } from '@chinaza/honey';
import express from 'express';

const honey = createHoney(
  '3000',
  'postgresql://postgres:password@localhost:5432/app'
);

// Access the Express router
const router = honey.routes;

// Add a custom route
router.get('/dashboard', (req, res) => {
  res.json({ status: 'ok', message: 'Welcome to the dashboard' });
});

// Start the server
honey.startServer();
```

## Custom Express Routes

While HoneyJS provides declarative methods for common CRUD operations, you can also access the underlying Express router to create custom routes with full flexibility.

### Accessing the Express Router

The Express router is exposed through the `routes` property of your Honey instance:

```typescript
const honey = createHoney(
  '3000',
  'postgresql://postgres:password@localhost:5432/app'
);
const router = honey.routes;
```

### Adding Custom Routes

You can add any standard Express route to the router:

```typescript
honey.routes.get('/client/sessions', async (req, res) => {
  res.send({ message: 'Hello Express' });
});

honey.routes.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Custom authentication logic
  const user = await authenticateUser(username, password);

  if (!user) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  res.send({
    token: generateToken(user),
    user: { id: user.id, name: user.name }
  });
});
```

### Combining HoneyJS and Custom Routes

You can mix declarative HoneyJS endpoints with custom Express routes in the same application:

```typescript
import { createHoney } from '@chinaza/honey';

const honey = createHoney(
  '3000',
  'postgresql://postgres:password@localhost:5432/app'
);

// HoneyJS declarative endpoints
honey.get({
  resource: 'products',
  fields: ['id', 'name', 'price', 'category']
});

honey.create({
  resource: 'products',
  params: {
    name: 'string',
    price: 'number',
    category: 'string'
  },
  message: 'Product created'
});

// Custom Express routes
honey.routes.get('/stats/dashboard', async (req, res) => {
  const stats = await calculateDashboardStats();
  res.send(stats);
});

honey.routes.post('/batch/import', async (req, res) => {
  try {
    const results = await importDataFromCSV(req.body.fileUrl);
    res.send({ message: 'Import successful', results });
  } catch (error) {
    res.status(500).send({ message: 'Import failed', error: error.message });
  }
});

// Start the server
honey.startServer();
```

### Using Express Middleware

You can use any Express middleware with your custom routes:

```typescript
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// File upload route with multer middleware
honey.routes.post('/uploads/image', upload.single('image'), (req, res) => {
  res.send({
    message: 'File uploaded successfully',
    file: req.file
  });
});

// Route with multiple middleware functions
honey.routes.get(
  '/admin/reports',
  checkAdminAuth,
  validateReportParams,
  async (req, res) => {
    const report = await generateReport(req.query.type);
    res.send(report);
  }
);
```

## TypeScript Support

HoneyJS is built with TypeScript and provides comprehensive type definitions:

```typescript
import { createHoney, Middleware, HttpError } from '@chinaza/honey';

// Type-safe middleware
const loggerMiddleware: Middleware = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

// Type-safe error handling
const errorHandler = (err: Error) => {
  if (err.message.includes('constraint')) {
    return new HttpError('Data validation failed', 422);
  }
  return err;
};

const honey = createHoney('3000', 'postgresql://localhost:5432/app');

honey.create({
  resource: 'products',
  params: {
    name: 'string',
    price: 'number',
    in_stock: 'boolean'
  },
  message: 'Product created',
  middleware: [loggerMiddleware],
  processErrorResponse: errorHandler
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Demo and Examples

For a complete working example, check out the [honey-example](https://github.com/chinaza/honey-example) repository.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/chinaza/honey/issues) on GitHub.
