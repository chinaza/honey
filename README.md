# HoneyJS

## Overview

This TypeScript-based Node.js application provides a library for building RESTful APIs with seamless integration to a PostgreSQL database using Sequelize ORM. It is designed to streamline the process of creating, reading, updating, deleting, and upserting data with a focus on simplicity and reusability.

## Prerequisites

- Create the relevant tables and data models for your Postgres database. You can use the exposed sequelize utility functions and migrations to do this.
- See <https://github.com/chinaza/honey-example> for a demo

## Getting Started

To begin using this library for your project, follow these steps:

1. Install HoneyJS

```bash
npm install @chinaza/honey
```

2. Configure your `.env` file with PostgreSQL connection details and other environment variables.

3. Start the server:

```bash
node index.js
```

## Usage

Here's how you can use the library to set up a simple API for a blog post resource:

```javascript
import { createHoney } from '@chinaza/honey';

const honey = createHoney(
  '3000',
  'postgresql://postgres:12345678@localhost:5432/honey?schema=public'
);

// Define routes for the 'posts' resource

// GET /posts - Retrieves a list of posts with optional filtering and sorting
honey.get({
  resource: 'posts',
  fields: ['id', 'name'],
  filter: {
    name: {
      operator: 'like',
      value: 'string'
    }
  },
  format: {
    sort: 'ASC',
    sortField: 'name'
  }
});

// GET /posts/:id - Retrieves a single post by ID
honey.getById({
  resource: 'posts',
  fields: ['id', 'name']
});

// POST /posts - Creates a new post
honey.create({
  resource: 'posts',
  params: {
    name: 'string'
  },
  message: 'Post created'
});

// PUT /posts/:id - Updates a post by ID
honey.updateById({
  resource: 'posts',
  params: {
    name: 'replace'
  },
  message: 'Post updated'
});

// PUT /posts/:id/upsert - Upserts a post by ID
honey.upsertById({
  resource: 'posts',
  params: {
    name: 'replace'
  },
  message: 'Post upserted'
});

// DELETE /posts/:id - Deletes a post by ID
honey.deleteById({
  resource: 'posts',
  message: 'Post deleted'
});

// Start the server
honey.startServer();
```

## Features

- **CRUD Operations**: Predefined methods for creating, reading, updating, deleting, and upserting data in your PostgreSQL database.
- **Flexible Querying**: Support for filtering, sorting, and pagination in list endpoints.
- **Error Handling**: Custom error class and middleware for handling API errors gracefully.
- **Environment Configuration**: Easy setup with environment variables for database connections and more.

## Testing

The library includes unit tests for utility functions to ensure the reliability of SQL query generation and other core features.

## Conclusion

With this library, you can quickly set up a backend for your web applications, focusing on your business logic while it handles the boilerplate code for database interactions and API responses.
