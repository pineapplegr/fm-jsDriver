# Quick Start Guide

Get started with fm-jsDriver in 5 minutes.

## Prerequisites

- Node.js 14 or later
- FileMaker Pro/Server 19.2 or later
- A FileMaker database accessible via webviewer
- fm-gofer package installed in your webviewer

## Installation

```bash
npm install fm-jsdriver
```

## Step 1: Create Your Schema (2 minutes)

Create a file named `fmSchema.json` that describes your FileMaker layouts:

```json
{
  "fmSchema": {
    "layouts": {
      "Contacts": {
        "fields": {
          "id": {
            "_meta": {
              "autoEnter": true,
              "notEmpty": true,
              "type": "normal"
            },
            "type": "number"
          },
          "name": {
            "_meta": {
              "notEmpty": true,
              "type": "normal"
            },
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "company": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**Schema Tips:**
- Set `autoEnter: true` and `notEmpty: true` for auto-generated primary keys
- Set `notEmpty: true` for required fields
- Use types: `string`, `number`, `boolean`, `date`, `time`, `timestamp`

## Step 2: Generate TypeScript Types (30 seconds)

```bash
npx fm-generate-schema fmSchema.json fmSchema.ts
```

This creates a `fmSchema.ts` file with TypeScript interfaces for all your layouts.

## Step 3: Create FileMaker Script (1 minute)

In FileMaker, create a script named `jsDriver`:

```filemaker
# Script: jsDriver
# Parameter: Get(ScriptParameter)

Set Variable [ $param ; Value: Get ( ScriptParameter ) ]

# Execute prescript if provided
If [ Not IsEmpty ( JSONGetElement ( $param ; "prescript" ) ) ]
    Set Variable [ $scriptName ; Value: JSONGetElement ( $param ; "prescript.script" ) ]
    Set Variable [ $scriptParam ; Value: JSONGetElement ( $param ; "prescript.parameter" ) ]
    Perform Script [ Specified: By Name ; $scriptName ; Parameter: $scriptParam ]
End If

# Execute Data API request
If [ Not IsEmpty ( JSONGetElement ( $param ; "dapi" ) ) ]
    Set Variable [ $dapiRequest ; Value: JSONGetElement ( $param ; "dapi" ) ]
    Set Variable [ $dapiResult ; Value: ExecuteDataAPI ( $dapiRequest ) ]
End If

# Execute post-script if provided
If [ Not IsEmpty ( JSONGetElement ( $param ; "script" ) ) ]
    Set Variable [ $scriptName ; Value: JSONGetElement ( $param ; "script.script" ) ]
    Set Variable [ $scriptParam ; Value: JSONGetElement ( $param ; "script.parameter" ) ]
    Perform Script [ Specified: By Name ; $scriptName ; Parameter: $scriptParam ]
End If

# Return result
Exit Script [ Text Result: $dapiResult ]
```

## Step 4: Use in Your Application (1 minute)

```typescript
// Import the driver and your schema
import { createDriver } from 'fm-jsdriver';
import schema from './fmSchema';

// Create driver instance
const fm = createDriver(schema);

// Now you can use it!
async function example() {
  // Create a contact
  const newContact = await fm.Contacts.create({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp'
  });

  console.log('Created:', newContact);

  // Get the contact
  const contact = await fm.Contacts.get(newContact.recordId);

  // Update the contact
  await fm.Contacts.update(newContact.recordId, {
    company: 'New Company Inc.'
  });

  // Find contacts
  const results = await fm.Contacts.find({
    company: 'Acme Corp'
  }, { limit: 10 });

  // List all contacts
  const all = await fm.Contacts.list({ limit: 50 });

  // Delete the contact
  await fm.Contacts.delete(newContact.recordId);
}

example();
```

## Common Operations

### Create with Validation

```typescript
const contact = await fm.Contacts.create(
  { name: 'Jane Doe', email: 'jane@example.com' },
  { script: 'ValidateContact' },  // runs before create
  { script: 'SendWelcome' }       // runs after create
);
```

### Search with Pagination

```typescript
const page1 = await fm.Contacts.find(
  { company: 'Acme Corp' },
  { offset: 1, limit: 20 }
);

const page2 = await fm.Contacts.find(
  { company: 'Acme Corp' },
  { offset: 21, limit: 20 }
);
```

### Execute Custom Script

```typescript
const result = await fm.executeScript({
  script: 'GenerateReport',
  parameter: JSON.stringify({ type: 'monthly' }),
  option: 5
});
```

## React Integration

```typescript
import React, { useState, useEffect } from 'react';
import { createDriver } from 'fm-jsdriver';
import schema from './fmSchema';

const fm = createDriver(schema);

function ContactsList() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    const result = await fm.Contacts.list({ limit: 100 });
    setContacts(result.response.data);
  }

  async function addContact(data) {
    await fm.Contacts.create(data);
    loadContacts();
  }

  return (
    <div>
      <h1>Contacts</h1>
      {contacts.map(contact => (
        <div key={contact.recordId}>
          {contact.fieldData.name} - {contact.fieldData.email}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

```typescript
try {
  const contact = await fm.Contacts.get('123');
} catch (error) {
  if (error.message.includes('FMGofer is not available')) {
    console.error('Not running in FileMaker webviewer');
  } else {
    console.error('FileMaker error:', error);
  }
}
```

## Troubleshooting

### "FMGofer is not available"
- You're not running in a FileMaker webviewer
- fm-gofer is not loaded in your HTML

### "Script not found: jsDriver"
- The FileMaker script isn't named exactly `jsDriver`
- The script isn't accessible from the current file

### Type errors in your code
- Regenerate types: `npx fm-generate-schema fmSchema.json fmSchema.ts`
- Make sure you're using the correct field names
- Check that required fields are provided

### Data API errors
- Check FileMaker privilege sets
- Verify layout and field names match exactly
- Ensure ExecuteDataAPI is available (FileMaker 19.2+)

## Next Steps

- Read the [README.md](README.md) for complete documentation
- Check [examples/](examples/) for more usage patterns
- Review [examples/filemaker-script.md](examples/filemaker-script.md) for advanced FileMaker script patterns

## Need Help?

- GitHub Issues: [Report issues here]
- Documentation: See README.md for comprehensive guide
- Examples: Check the examples/ directory

---

**You're all set!** Start building type-safe FileMaker applications.
