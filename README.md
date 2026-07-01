# HoneyJS

A TypeScript-based Node.js declarative library for building RESTful APIs with seamless integration to PostgreSQL databases using Sequelize ORM. HoneyJS streamlines the process of creating, reading, updating, deleting, and upserting data with a focus on simplicity and reusability.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Database Connection](#database-connection)
  - [Environment Variables](#environment-variables)
  - [Built-in Defaults](#built-in-defaults)
- [API Reference](#api-reference)
  - [Core Methods](#core-methods)
  - [CRUD Operations](#crud-operations)
  - [Filter Presets](#filter-presets)
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
- **Bulk Create Support**: Insert multiple records in a single request with `honey.bulkCreate()`
- **PostgreSQL Integration**: Seamless connection to PostgreSQL via Sequelize ORM
- **Query Building**: Flexible filtering, sorting, and pagination
- **Middleware Support**: Add custom middleware to your routes
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions
- **Validation**: Request validation using Joi
- **Error Handling**: Consistent error handling and response formatting
- **API Documentation**: Automatic OpenAPI documentation is generated internally via `express-oas-generator`.

## Prerequisites

- Node.js (>=20.9.0)
- PostgreSQL database
- TypeScript (for TypeScript projects)
- Create the relevant tables and data models for your Postgres database. You can use the exposed sequelize utility functions and migrations to do this.

## Installation

```bash
# Using npm
npm install @promind/honey

# Using yarn
yarn add @promind/honey
```

## Quick Start

1. Create a new file (e.g., `server.ts` or `server.js`)

```typescript
import { createHoney } from '@promind/honey';

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

1. Run your server:

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
import { createHoney } from '@promind/honey';

const honey = createHoney(process.env.PORT, process.env.DB_URI);
```

### Built-in Defaults

HoneyJS automatically configures the following on startup:

- **CORS**: Enabled for all origins (`*`) with all methods and headers allowed
- **Body parsing**: JSON and URL-encoded bodies up to 50MB
- **Cookie parsing**: Enabled via `cookie-parser`
- **Route prefix**: `/api` (configurable via `metadata.routePrefix`)

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

#### `honey.db`

Exposes the underlying Sequelize instance for direct database access.

### CRUD Operations

#### `honey.create(options)`

Creates a POST endpoint for creating new resources.

The response `data` field contains `{ id }` (the inserted record's ID) by default unless `processResponseData` is provided.

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
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'post', // Optional: Override the HTTP method
  processResponseData: (data, req) => {
    // Optional: Transform response data
    return { ...data, extra: 'info' };
  },
  processErrorResponse: (err) => err // Optional: Customize error response
});
```

#### `honey.bulkCreate(options)`

Creates a POST endpoint for inserting multiple records in a single request. The request body must be an **array** of objects.

The response `data` field contains `{ ids }` — an array of the inserted records' IDs — by default unless `processResponseData` is provided.

```typescript
honey.bulkCreate({
  resource: 'posts', // Resource name (used in URL path)
  table: 'blog_posts', // Optional: Table name if different from resource
  params: {
    // Request body parameters (applied to each item in the array)
    title: 'string',
    content: 'string',
    author_id: 'number',
    published: 'boolean',
    metadata: 'json',
    created_at: '@updatedAt'
  },
  message: 'Posts created', // Success message
  pathOverride: '/blog/posts/bulk', // Optional: Custom path (default: /{resource}/bulk)
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'post', // Optional: Override the HTTP method
  processResponseData: (data, req) => {
    // data.ids is an array of inserted record IDs
    return { ...data, count: data.ids.length };
  },
  processErrorResponse: (err) => err // Optional: Customize error response
});
```

**Request body format:**
```json
[
  { "title": "Post One", "content": "...", "author_id": 1 },
  { "title": "Post Two", "content": "...", "author_id": 1 }
]
```

**Response format:**
```json
{
  "message": "Posts created",
  "data": {
    "ids": [42, 43]
  }
}
```

#### `honey.get(options)`

Creates a GET endpoint for retrieving a list of resources.

Automatically supports `?page=` and `?limit=` query parameters for pagination. The response shape is:

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "total": 100,
      "pageSize": 10,
      "page": 1,
      "pageCount": 10
    }
  }
}
```

```typescript
honey.get({
  resource: 'posts',
  fields: ['id', 'title', 'author_id', 'created_at'], // Fields to return
  filter: {
    // Optional: Query filters
    title: {
      operator: 'like', // Filter operator
      value: 'string', // Parameter type
      location: 'query' // Optional: where to read the value from (default: query string)
    },
    published: {
      operator: '=',
      value: 'boolean'
    },
    author_id: {
      operator: '=',
      value: 'number',
      overrideValue: (req) => req.user?.id // Dynamic value based on request
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
  },
  joins: [
    // Optional: SQL joins
    {
      table: 'users',
      type: 'inner', // 'inner' | 'left' | 'right' | 'full' | 'cross' (default: 'inner')
      on: {
        left: 'posts.author_id',
        right: 'users.id',
        operator: '=' // '=' | '!=' | '<' | '<=' | '>' | '>='
      },
      alias: 'author' // Optional alias
    }
  ],
  shouldErrorOnNotFound: false, // Optional: When false, returns empty data instead of 404 (default: true)
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'get' // Optional: Override the HTTP method
});
```

**Filter operators:** `'='`, `'!='`, `'<'`, `'<='`, `'>'`, `'>='`, `'in'`, `'not in'`, `'like'`, `'not like'`

> **Note:** `'like'` uses PostgreSQL `ILIKE` for case-insensitive matching.

**Filter `value` types:** `'string'`, `'number'`, `'boolean'`, `'json'`, `'csv'` (splits comma-separated string into array), `'as-is'` (passes value through unchanged)

**Filter `location` options:** `'query'` (default), `'body'`, `'headers'`, `'request'`, `'params'`

**Filter `overrideValue`:** Can be a static value or a function `(req) => value` for dynamic values based on the request.

**Using joins with dot-notation:** When using joins, fields can use dot-notation to reference columns from joined tables: `'tableName.fieldName'`.

#### Filter Presets

Filter presets let you define named, server-side filter configurations that a caller can activate at request time via the `?preset=<name>` query parameter. They are useful when you want to expose a fixed set of filtered views of a resource — such as "upcoming", "completed", or "cancelled" bookings — without allowing arbitrary client-side filter composition.

Presets are evaluated entirely on the server; the client only supplies the preset name.

##### Types

```typescript
// A single field condition — same shape as a regular filter entry
type FilterCondition = {
  [field: string]: {
    operator: FilterOps;           // '=', '!=', '<', '<=', '>', '>=', 'in', 'not in', 'like', 'not like'
    value: FilterValue | 'as-is';  // 'string' | 'number' | 'boolean' | 'json' | 'csv' | 'as-is'
    overrideValue?: unknown | (() => unknown);
  };
};

// An AND group: all child nodes must match
type FilterAndGroup = { $and: FilterNode[] };

// A node is either a leaf condition or an AND group
type FilterNode = FilterCondition | FilterAndGroup;

// A preset is an array of FilterNodes — top-level items are joined with OR
type FilterPreset = FilterNode[];

// The full presets map passed to honey.get()
type FilterPresets = Record<string, FilterPreset>;
```

##### Logic model

| Structure | SQL equivalent |
|---|---|
| `[A, B]` (top-level array) | `A OR B` |
| `{ $and: [A, B] }` | `A AND B` |
| `[A, { $and: [B, C] }]` | `A OR (B AND C)` |

##### Example — bookings

```typescript
honey.get({
  resource: 'bookings',
  fields: ['id', 'status', 'scheduled_at', 'customer_id'],
  format: { sort: 'ASC', sortField: 'scheduled_at' },

  filterPresets: {
    // GET /api/bookings?preset=upcoming
    // WHERE status = 'confirmed' AND scheduled_at > NOW()
    upcoming: [
      {
        $and: [
          { status:       { operator: '=',  value: 'as-is', overrideValue: 'confirmed' } },
          { scheduled_at: { operator: '>',  value: 'as-is', overrideValue: () => new Date() } }
        ]
      }
    ],

    // GET /api/bookings?preset=completed
    // WHERE status = 'completed' OR (status = 'confirmed' AND scheduled_at < NOW())
    completed: [
      { status: { operator: '=', value: 'as-is', overrideValue: 'completed' } },
      {
        $and: [
          { status:       { operator: '=', value: 'as-is', overrideValue: 'confirmed' } },
          { scheduled_at: { operator: '<', value: 'as-is', overrideValue: () => new Date() } }
        ]
      }
    ],

    // GET /api/bookings?preset=cancelled
    // WHERE status = 'cancelled'
    cancelled: [
      { status: { operator: '=', value: 'as-is', overrideValue: 'cancelled' } }
    ]
  }
});
```

**Resulting SQL for `?preset=completed`:**

```sql
SELECT id, status, scheduled_at, customer_id
FROM bookings
WHERE (status = 'completed')
   OR (status = 'confirmed' AND scheduled_at < '2024-11-01T10:00:00.000Z')
ORDER BY scheduled_at ASC;
```

##### HTTP behaviour

| Request | Behaviour |
|---|---|
| `GET /api/bookings` | No preset applied — returns all bookings (existing `filter` param is unaffected) |
| `GET /api/bookings?preset=upcoming` | Applies the `upcoming` preset |
| `GET /api/bookings?preset=unknown` | Returns **HTTP 400** — unknown preset name |

##### `overrideValue` and the factory pattern

When `value` is set to `'as-is'`, the filter value is taken from `overrideValue` directly rather than from the query string. `overrideValue` can be:

- A **static value** — evaluated once at definition time: `overrideValue: 'confirmed'`
- A **factory function** `() => value` — called on every request, useful for dynamic values: `overrideValue: () => new Date()`

Use the factory form whenever the value must reflect the current moment (timestamps, session data, etc.).

##### Backward compatibility

`filterPresets` is an entirely additive parameter. Existing `filter` configurations on `honey.get()` are unaffected — both can be used together on the same endpoint. If no `?preset=` query parameter is supplied, no OR clause is added and the request is handled exactly as before.

---

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
  },
  joins: [
    // Optional: SQL joins (same as honey.get())
    {
      table: 'users',
      type: 'left',
      on: { left: 'posts.author_id', right: 'users.id' }
    }
  ],
  shouldErrorOnNotFound: false, // Optional: When false, returns empty data instead of 404 (default: true)
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'get' // Optional: Override the HTTP method
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
  idField: 'slug', // Optional: Use a different field as identifier
  filter: {
    // Optional: Additional WHERE conditions beyond the ID
    author_id: {
      operator: '=',
      value: 'number'
    }
  },
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'put' // Optional: Override the HTTP method
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
  message: 'Posts updated',
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'put' // Optional: Override the HTTP method
});
```

> **Note:** `filter` is **required** for `honey.update()` to prevent unintended bulk updates.

#### `honey.upsertById(options)`

Creates a PUT endpoint for upserting a resource by ID.

After an upsert, `req.isInsert` is set to `true` if the operation was an INSERT, or `false` if it was an UPDATE. This flag is accessible in `processResponseData` and `exitMiddleware`.

```typescript
honey.upsertById({
  resource: 'posts',
  params: {
    title: 'replace',
    content: 'replace',
    updated_at: '@updatedAt'
  },
  message: 'Post upserted',
  idField: 'id', // Required: Field to use for conflict detection
  doNothingOnConflict: false, // Optional: When true, returns existing record unchanged on conflict (default: false)
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'put', // Optional: Override the HTTP method
  processResponseData: (data, req) => {
    // req.isInsert is true for INSERT, false for UPDATE
    return { ...data, wasInserted: req.isInsert };
  }
});
```

#### `honey.upsert(options)`

Creates a PUT endpoint for upserting a resource with custom conflict resolution.

After an upsert, `req.isInsert` is set to `true` if the operation was an INSERT, or `false` if it was an UPDATE. This flag is accessible in `processResponseData` and `exitMiddleware`.

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
  conflictTarget: ['slug'], // Fields to check for conflicts
  doNothingOnConflict: false, // Optional: When true, returns existing record unchanged on conflict (default: false)
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'put' // Optional: Override the HTTP method
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
  },
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'delete' // Optional: Override the HTTP method
});
```

#### `honey.delete(options)`

Creates a DELETE endpoint for bulk-deleting resources (no ID in path).

```typescript
honey.delete({
  resource: 'posts',
  filter: {
    // Filter criteria for records to delete
    author_id: {
      operator: '=',
      value: 'number'
    }
  },
  message: 'Posts deleted',
  table: 'blog_posts', // Optional: Table name if different from resource
  pathOverride: '/blog/posts', // Optional: Custom path
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  methodOverride: 'delete', // Optional: Override the HTTP method
  processErrorResponse: (err) => err // Optional: Customize error response
});
```

#### `honey.query(options)`

Creates a custom endpoint backed by a raw Knex query. Useful for complex queries that go beyond standard CRUD operations.

Automatically supports `?page=` and `?limit=` query parameters for pagination.

```typescript
honey.query({
  resource: 'stats',
  methodOverride: 'get', // Optional: HTTP method (default: 'get')
  query: (knex, req) => {
    return knex('posts')
      .select('author_id')
      .count('id as post_count')
      .groupBy('author_id');
  },
  processResponseData: (data, req) => {
    return data;
  },
  pathOverride: '/stats/posts', // Optional: Custom path
  middleware: [authMiddleware], // Optional: Route-specific middleware
  exitMiddleware: [auditMiddleware], // Optional: Middleware that runs after response is sent
  processErrorResponse: (err) => err // Optional: Customize error response
});
```

**Options:**

- `resource` — Resource name used in the URL path
- `query` — Function receiving `(knex, req)` and returning a Knex `QueryBuilder`
- `pathOverride` — Optional custom path
- `methodOverride` — HTTP method (default: `'get'`)
- `middleware` — Route-specific middleware
- `exitMiddleware` — Middleware that runs after the response is sent
- `processResponseData` — Transform the response data
- `processErrorResponse` — Customize the error response

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
import { defineModel, DataTypes } from '@promind/honey';

const User = defineModel(
  'users',
  {
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
  },
  {
    // Optional: Sequelize ModelOptions
    timestamps: false,
    tableName: 'app_users'
  }
);

export default User;
```

### Raw Query Execution

```typescript
import { runDbQuery, QueryTypes } from '@promind/honey';

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

### `createReqTransit`

`createReqTransit` creates a typed transit object for safely passing data between middleware and controllers via the request object.

```typescript
import { createReqTransit } from '@promind/honey';

// Create a typed transit for passing data between middleware and controllers
const userTransit = createReqTransit<User>('currentUser');

// In middleware
const authMiddleware = (req, res, next) => {
  const user = verifyToken(req.headers.authorization);
  userTransit.inject(req, user);
  next();
};

// In processResponseData or exitMiddleware
honey.getById({
  resource: 'posts',
  fields: ['id', 'title'],
  middleware: [authMiddleware],
  processResponseData: (data, req) => {
    const user = userTransit.extract(req, null);
    return { ...data, viewedBy: user?.name };
  }
});
```

## Error Handling

HoneyJS provides a consistent error handling mechanism:

```typescript
import { HttpError, handleHttpError } from '@promind/honey';

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
import { validateRequestData } from '@promind/honey';
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

`validateRequestData` accepts the following arguments:

```typescript
validateRequestData(
  schema,     // Joi ObjectSchema
  location?,  // 'body' | 'params' | 'query' | 'headers' | 'cookies' (default: 'body')
  options?    // Joi ValidationOptions (default: { allowUnknown: true })
)
```

### Custom Middleware

```typescript
import { Middleware } from '@promind/honey';

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
import { createHoney, HttpError } from '@promind/honey';

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

honey.bulkCreate({
  resource: 'posts',
  params: {
    title: 'string',
    content: 'string',
    excerpt: 'string',
    author_id: 'number',
    created_at: '@updatedAt'
  },
  message: 'Posts created successfully',
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
import { createHoney } from '@promind/honey';
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
import { createHoney } from '@promind/honey';

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
import { createHoney, Middleware, HttpError } from '@promind/honey';

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

### `ExitMiddleware`

`ExitMiddleware` is middleware that runs after the response has been sent. It receives the response data as its first argument, making it ideal for audit logging, analytics, or post-response side effects.

```typescript
import { ExitMiddleware } from '@promind/honey';

const auditMiddleware: ExitMiddleware = (data, req, res, next) => {
  console.log(`Response sent for ${req.method} ${req.path}:`, data);
  next();
};

honey.create({
  resource: 'users',
  params: { name: 'string', email: 'string' },
  message: 'User created',
  exitMiddleware: [auditMiddleware]
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
