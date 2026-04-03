/**
 * Swagger / OpenAPI 3.0 Configuration
 * Full spec defined inline for clarity and maintainability.
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '💰 Finance Dashboard API',
    version: '1.0.0',
    description: `
## Finance Dashboard Backend API

A production-ready RESTful API for managing financial records with **Role-Based Access Control (RBAC)**.

### Roles & Permissions
| Role | Description |
|------|-------------|
| **viewer** | Read-only access to own records and basic dashboard |
| **analyst** | Full CRUD on own records + extended analytics |
| **admin** | Full access to all users and all records |

### Authentication
All protected endpoints require a **Bearer JWT token**.
1. Call \`POST /auth/login\` with your credentials
2. Copy the \`token\` from the response
3. Click **Authorize 🔒** (top right) and paste: \`Bearer <token>\`

### Seed Credentials (run \`npm run seed\` first)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.dev | Admin@123 |
| Analyst | analyst@finance.dev | Analyst@123 |
| Viewer | viewer@finance.dev | Viewer@123 |
    `,
    contact: {
      name: 'Finance Dashboard API',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server — API v1 (auth, users, records, dashboard)',
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server — Root (health check)',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & session management' },
    { name: 'Users', description: 'User management (admin & self)' },
    { name: 'Records', description: 'Financial records CRUD' },
    { name: 'Dashboard', description: 'Analytics & aggregated insights' },
    { name: 'Health', description: 'Server health check' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (without "Bearer " prefix — Swagger adds it)',
      },
    },
    schemas: {
      // ─── Reusable Objects ──────────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          _id:       { type: 'string', example: '6650abc123def4567890abcd' },
          name:      { type: 'string', example: 'Alice Analyst' },
          email:     { type: 'string', format: 'email', example: 'analyst@finance.dev' },
          role:      { type: 'string', enum: ['viewer', 'analyst', 'admin'], example: 'analyst' },
          isActive:  { type: 'boolean', example: true },
          lastLogin: { type: 'string', format: 'date-time', example: '2024-06-01T10:00:00.000Z' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      FinancialRecord: {
        type: 'object',
        properties: {
          _id:         { type: 'string', example: '6650def456abc7890abcdef1' },
          user:        { type: 'string', example: '6650abc123def4567890abcd' },
          amount:      { type: 'number', format: 'float', example: 5000.00 },
          type:        { type: 'string', enum: ['income', 'expense'], example: 'income' },
          category:    { type: 'string', example: 'salary', enum: ['salary','freelance','investment','rental','business','food','transport','utilities','healthcare','education','entertainment','shopping','travel','insurance','taxes','other'] },
          date:        { type: 'string', format: 'date', example: '2024-06-01' },
          description: { type: 'string', example: 'Monthly salary for June' },
          isDeleted:   { type: 'boolean', example: false },
          createdAt:   { type: 'string', format: 'date-time' },
          updatedAt:   { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total:       { type: 'integer', example: 120 },
          page:        { type: 'integer', example: 1 },
          limit:       { type: 'integer', example: 10 },
          totalPages:  { type: 'integer', example: 12 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
      // ─── Error Responses ─────────────────────────────────────────────────
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'An error occurred' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field:   { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Please provide a valid email address' },
              },
            },
          },
        },
      },
      // ─── Request Bodies ───────────────────────────────────────────────────
      RegisterBody: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' },
          email:    { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 6, example: 'Password1' },
          role:     { type: 'string', enum: ['viewer', 'analyst', 'admin'], default: 'viewer', example: 'viewer' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'admin@finance.dev' },
          password: { type: 'string', example: 'Admin@123' },
        },
      },
      ChangePasswordBody: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'OldPass1' },
          newPassword:     { type: 'string', minLength: 6, example: 'NewPass1' },
        },
      },
      UpdateUserBody: {
        type: 'object',
        properties: {
          name:     { type: 'string', example: 'Updated Name' },
          email:    { type: 'string', format: 'email', example: 'new@example.com' },
          role:     { type: 'string', enum: ['viewer', 'analyst', 'admin'], description: 'Admin only' },
          isActive: { type: 'boolean', description: 'Admin only' },
        },
      },
      CreateRecordBody: {
        type: 'object',
        required: ['amount', 'type', 'category'],
        properties: {
          amount:      { type: 'number', minimum: 0.01, example: 5000.00 },
          type:        { type: 'string', enum: ['income', 'expense'], example: 'income' },
          category:    { type: 'string', enum: ['salary','freelance','investment','rental','business','food','transport','utilities','healthcare','education','entertainment','shopping','travel','insurance','taxes','other'], example: 'salary' },
          date:        { type: 'string', format: 'date', example: '2024-06-01' },
          description: { type: 'string', maxLength: 500, example: 'Monthly salary for June' },
        },
      },
      UpdateRecordBody: {
        type: 'object',
        properties: {
          amount:      { type: 'number', minimum: 0.01, example: 1500.00 },
          type:        { type: 'string', enum: ['income', 'expense'] },
          category:    { type: 'string', enum: ['salary','freelance','investment','rental','business','food','transport','utilities','healthcare','education','entertainment','shopping','travel','insurance','taxes','other'] },
          date:        { type: 'string', format: 'date', example: '2024-06-15' },
          description: { type: 'string', maxLength: 500, example: 'Updated description' },
        },
      },
      // ─── Auth Responses ───────────────────────────────────────────────────
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Logged in successfully.' },
          token:   { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
    },
    // ─── Reusable Parameters ─────────────────────────────────────────────────
    parameters: {
      MongoIdParam: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'MongoDB ObjectId',
        schema: { type: 'string', example: '6650abc123def4567890abcd' },
      },
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number',
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        description: 'Results per page',
      },
      StartDateParam: {
        name: 'startDate',
        in: 'query',
        schema: { type: 'string', format: 'date', example: '2024-01-01' },
        description: 'Filter from date (ISO 8601)',
      },
      EndDateParam: {
        name: 'endDate',
        in: 'query',
        schema: { type: 'string', format: 'date', example: '2024-12-31' },
        description: 'Filter to date (inclusive, ISO 8601)',
      },
    },
    // ─── Reusable Responses ───────────────────────────────────────────────────
    responses: {
      Unauthorized: {
        description: '401 — Token missing, invalid, or expired',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      Forbidden: {
        description: '403 — Insufficient role permissions',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      NotFound: {
        description: '404 — Resource not found',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      ValidationError: {
        description: '422 — Validation failed',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } },
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PATHS
  // ══════════════════════════════════════════════════════════════════════════
  paths: {
    // ── Health ──────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Server health check',
        description: 'Returns server status, environment, and timestamp. No authentication required.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success:     { type: 'boolean', example: true },
                    message:     { type: 'string', example: 'Finance Dashboard API is running' },
                    environment: { type: 'string', example: 'development' },
                    timestamp:   { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: `Creates a new user account. 
- **Role defaults to \`viewer\`** unless specified.
- Only an authenticated **admin** can create an \`admin\` role account.
- No auth needed for \`viewer\` or \`analyst\` role registration.`,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthSuccessResponse' } },
            },
          },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        description: 'Authenticates the user and returns a signed JWT token. Use this token in the **Authorize** button above.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
              examples: {
                admin:   { summary: 'Admin login',   value: { email: 'admin@finance.dev',   password: 'Admin@123' } },
                analyst: { summary: 'Analyst login', value: { email: 'analyst@finance.dev', password: 'Analyst@123' } },
                viewer:  { summary: 'Viewer login',  value: { email: 'viewer@finance.dev',  password: 'Viewer@123' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthSuccessResponse' } },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Account deactivated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Returns the full profile of the currently authenticated user.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Clears the JWT cookie. The token in the Authorization header will remain valid until it expires — discard it client-side.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully.' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/auth/change-password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change password',
        description: 'Allows the currently authenticated user to change their own password. Issues a new JWT on success.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordBody' } },
          },
        },
        responses: {
          200: { description: 'Password changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthSuccessResponse' } } } },
          400: { description: 'Missing fields or weak password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Users ────────────────────────────────────────────────────────────────
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        description: '**Admin only.** Returns a paginated list of all users with optional filters.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['viewer', 'analyst', 'admin'] }, description: 'Filter by role' },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' },
          { $ref: '#/components/parameters/PageParam' },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 }, description: 'Results per page (max 50)' },
        ],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Users retrieved successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        users:      { type: 'array', items: { $ref: '#/components/schemas/User' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: '**Admin or self.** Admins can view any user; regular users can only view their own profile.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        responses: {
          200: {
            description: 'User retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        description: `**Admin or self.** 
- Any user can update their own \`name\` and \`email\`.  
- Only **admins** can change \`role\` or \`isActive\`.`,
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateUserBody' } },
          },
        },
        responses: {
          200: { description: 'User updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    '/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate user account',
        description: '**Admin only.** Sets `isActive` to `false`. Deactivated users cannot log in. Admins cannot deactivate their own account.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        responses: {
          200: { description: 'User deactivated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'User "Alice" has been deactivated.' }, data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } } } },
          400: { description: 'Cannot deactivate own account', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/users/{id}/activate': {
      patch: {
        tags: ['Users'],
        summary: 'Activate user account',
        description: '**Admin only.** Re-enables a previously deactivated user account.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        responses: {
          200: { description: 'User activated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'User "Alice" has been activated.' }, data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Records ───────────────────────────────────────────────────────────────
    '/records': {
      post: {
        tags: ['Records'],
        summary: 'Create a financial record',
        description: '**Analyst or Admin.** Creates a new financial entry linked to the authenticated user.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRecordBody' },
              examples: {
                income: {
                  summary: 'Income record',
                  value: { amount: 5000, type: 'income', category: 'salary', date: '2024-06-01', description: 'Monthly salary' },
                },
                expense: {
                  summary: 'Expense record',
                  value: { amount: 120.50, type: 'expense', category: 'food', date: '2024-06-15', description: 'Groceries' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Record created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: { type: 'object', properties: { record: { $ref: '#/components/schemas/FinancialRecord' } } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
      get: {
        tags: ['Records'],
        summary: 'List financial records',
        description: `Returns paginated financial records.  
- **Viewer/Analyst**: sees only their own records.  
- **Admin**: sees all records (use \`userId\` to filter by user).`,
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filter by type' },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['salary','freelance','investment','rental','business','food','transport','utilities','healthcare','education','entertainment','shopping','travel','insurance','taxes','other'] }, description: 'Filter by category' },
          { $ref: '#/components/parameters/StartDateParam' },
          { $ref: '#/components/parameters/EndDateParam' },
          { name: 'minAmount', in: 'query', schema: { type: 'number', minimum: 0 }, description: 'Minimum amount' },
          { name: 'maxAmount', in: 'query', schema: { type: 'number', minimum: 0 }, description: 'Maximum amount' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in description' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['date','-date','amount','-amount','category','-category','type','-type'], default: '-date' }, description: 'Sort field (prefix `-` for descending)' },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: '**Admin only** — filter records by user ID' },
        ],
        responses: {
          200: {
            description: 'Records retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Records retrieved successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        records:    { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    '/records/{id}': {
      get: {
        tags: ['Records'],
        summary: 'Get record by ID',
        description: 'Returns a single financial record. Non-admins can only access their own records.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        responses: {
          200: { description: 'Record found', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { record: { $ref: '#/components/schemas/FinancialRecord' } } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Records'],
        summary: 'Update a record',
        description: '**Analyst or Admin.** Analysts can only update their own records; admins can update any record.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateRecordBody' } },
          },
        },
        responses: {
          200: { description: 'Record updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { record: { $ref: '#/components/schemas/FinancialRecord' } } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
      delete: {
        tags: ['Records'],
        summary: 'Soft-delete a record',
        description: `**Analyst or Admin.**  
Record is **not permanently deleted** — \`isDeleted\` is set to \`true\` and \`deletedAt\` is recorded.  
Deleted records are excluded from all future queries automatically.`,
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/MongoIdParam' }],
        responses: {
          200: { description: 'Record deleted (soft)', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Record successfully deleted.' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Dashboard ─────────────────────────────────────────────────────────────
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Financial summary',
        description: `**All roles.** Returns total income, total expenses, net balance, and transaction counts.  
Admins can use \`userId\` to get stats for a specific user.`,
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/StartDateParam' },
          { $ref: '#/components/parameters/EndDateParam' },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: '**Admin only** — stats for a specific user' },
        ],
        responses: {
          200: {
            description: 'Summary data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        totalIncome:       { type: 'number', example: 25000.00 },
                        totalExpenses:     { type: 'number', example: 12500.00 },
                        netBalance:        { type: 'number', example: 12500.00 },
                        totalTransactions: { type: 'integer', example: 45 },
                        incomeCount:       { type: 'integer', example: 20 },
                        expenseCount:      { type: 'integer', example: 25 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/dashboard/recent': {
      get: {
        tags: ['Dashboard'],
        summary: 'Recent activity',
        description: '**All roles.** Returns the most recent financial transactions (max 50).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 }, description: 'Number of records to return' },
        ],
        responses: {
          200: {
            description: 'Recent records',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/dashboard/categories': {
      get: {
        tags: ['Dashboard'],
        summary: 'Category breakdown',
        description: '**Analyst or Admin.** Returns income and expense totals grouped by category, sorted by total amount.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/StartDateParam' },
          { $ref: '#/components/parameters/EndDateParam' },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: '**Admin only**' },
        ],
        responses: {
          200: {
            description: 'Category breakdown',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          category:      { type: 'string', example: 'salary' },
                          categoryTotal: { type: 'number', example: 18000.00 },
                          breakdown: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                type:  { type: 'string', example: 'income' },
                                total: { type: 'number', example: 18000.00 },
                                count: { type: 'integer', example: 3 },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/dashboard/trends/monthly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Monthly trends',
        description: '**Analyst or Admin.** Income vs expense grouped by month. Defaults to the last 12 months.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/StartDateParam' },
          { $ref: '#/components/parameters/EndDateParam' },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: '**Admin only**' },
        ],
        responses: {
          200: {
            description: 'Monthly trend data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          year:    { type: 'integer', example: 2024 },
                          month:   { type: 'integer', example: 6 },
                          label:   { type: 'string', example: '2024-06' },
                          entries: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                type:  { type: 'string', example: 'income' },
                                total: { type: 'number', example: 5000.00 },
                                count: { type: 'integer', example: 2 },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/dashboard/trends/weekly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Weekly trends',
        description: '**Analyst or Admin.** Income vs expense grouped by week number. Defaults to the current month.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/StartDateParam' },
          { $ref: '#/components/parameters/EndDateParam' },
        ],
        responses: {
          200: {
            description: 'Weekly trend data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id:   { type: 'object', properties: { week: { type: 'integer' }, year: { type: 'integer' }, type: { type: 'string' } } },
                          total: { type: 'number' },
                          count: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [], // All docs are defined inline above
};

module.exports = { swaggerOptions, swaggerDefinition };
