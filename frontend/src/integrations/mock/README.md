# Mock Data Integration

This directory contains mock data and utilities for frontend development without a backend connection.

## Structure

- `mockData.ts`: Contains mock data structures for procedures, analyses, users, etc.
- `mockHelpers.ts`: Helper functions for working with mock data

## Usage

The mock system is designed to mimic the behavior of a real backend API. It provides:

1. **Mock Data**: Pre-populated sample data for development
2. **Mock API Responses**: Simulated API responses with proper structure
3. **Mock Auth**: Simulated authentication flow

## How to Use

Import the mock client instead of the real Supabase client:

```typescript
import { supabase } from '@/integrations/supabase/client';
```

Then use it as you would the real client. The mock implementation supports:

- Data queries (select, insert, update, delete)
- Authentication flows (sign up, sign in, sign out)
- Storage operations (upload, download, delete)

## Customizing Mock Data

You can modify the mock data in `mockData.ts` to suit your development needs.

## Backend Integration

When you're ready to connect to a real backend:

1. Replace the mock client with a real Supabase client
2. Update any mock-specific handling code
3. Test all API interactions
