# fm-jsdriver

A lightweight, type-safe JavaScript/TypeScript driver for FileMaker that uses `fm-gofer` as the bridge to `FileMaker.PerformScript`.

## 🚀 Features

- **Type-safe**: Full TypeScript support with automatic schema inference
- **Dynamic layout properties**: Access layouts directly as properties (e.g., `fm.Contacts.create()`)
- **Complete CRUD operations**: create, update, get, find, list, delete, and executeScript methods
- **JSON serialization**: Automatic payload serialization for FileMaker communication
- **Zero dependencies**: Only requires `fm-gofer` as a peer dependency
- **ESM support**: Modern ES modules with tree-shaking support

## 📦 Installation

```bash
npm install fm-jsdriver fm-gofer
```

## 🔧 Usage

### Basic Setup

```typescript
import fmSchema from "./fmSchema.json" assert { type: "json" }
import { fmGofer } from "fm-gofer"
import { FMJSDriver } from "fm-jsdriver"

// Initialize the driver with your schema and gofer
const fm = new FMJSDriver(fmSchema.fmSchema.layouts, { gofer: fmGofer })
```

### CRUD Operations

```typescript
// Create a new contact
fm.Contacts.create({ 
  forename: "Alex", 
  surname: "Smith",
  email: "alex@example.com"
})

// Create with prescript and script
fm.Contacts.create({ 
  forename: "Alex" 
}, "PreCreateScript", { script: "PostCreateScript", parameter: "data", option: 1 })

// Find contacts with options
fm.Contacts.find({ forename: "Alex" }, { offset: 0, limit: 10 })

// Get a specific record
fm.Contacts.get(123)

// Update a record
fm.Contacts.update(123, { email: "newemail@example.com" })

// List all records (with optional pagination)
fm.Contacts.list({ offset: 0, limit: 50 })

// Delete a record
fm.Contacts.delete(123)

// Execute a custom script (no layout required)
fm.Contacts.executeScript("MyCustomScript") // Creates {script: "MyCustomScript", parameter: "", option: 0}
fm.Contacts.executeScript({ script: "MyScript", parameter: "data", option: 2 })
```

### Working with Different Layouts

```typescript
// Work with different layouts using the same pattern
fm.Notes.create({ 
  note: "Important meeting notes",
  category: "Business",
  contactId: 123
})

fm.Notes.find({ category: "Business" })
```

## 📋 Schema Format

Your `fmSchema.json` should follow this structure:

```json
{
  "fmSchema": {
    "layouts": {
      "Contacts": {
        "fields": {
          "id": "_ID",
          "forename": "d__Name",
          "surname": "d__Surname",
          "email": "d__Email"
        },
        "fieldMetaData": [
          {
            "name": "_ID",
            "type": "normal",
            "result": "number",
            "autoEnter": true,
            "notEmpty": true
          }
        ]
      }
    }
  }
}
```

## 🔌 Integration with fm-gofer

The driver communicates with FileMaker through the `jsDriver` script using `fmGofer.PerformScriptWithOption()`.

All CRUD operations send a JSON payload to the `jsDriver` script with this structure:

```json
{
  "method": "create",
  "dapi": {
    "layout": "Contacts",
    "fieldData": {
      "forename": "Alex",
      "surname": "Smith"
    }
  },
  "scriptObject": {
    "script": "PostCreateScript",
    "parameter": "some data",
    "option": 1
  }
}
```

### Script Execution Flow

1. **Prescript**: If provided, executes first using `PerformScriptWithOption()`
2. **Main Operation**: Calls `jsDriver` script with method and dapi payload
3. **Script Object**: If included in payload, the FileMaker side can execute it after the operation

### Script Objects

Script objects can be created in two ways:

```typescript
// Simple string (creates {script: "MyScript", parameter: "", option: 0})
"MyScript"

// Full object
{
  script: "MyScript",
  parameter: "data",
  option: 2  // 0-5, default is 0
}
```

## 🛡️ Type Safety

The driver provides full TypeScript support with automatic type inference from your schema:

```typescript
// ✅ Valid - 'forename' exists in Contacts schema
fm.Contacts.create({ forename: "Alex" })

// ❌ TypeScript error - 'foo' doesn't exist in schema
fm.Contacts.create({ foo: "bar" })

// ✅ Autocomplete works for all valid field names
fm.Contacts.find({ 
  forename: "Alex",    // ✅ Valid field
  surname: "Smith",    // ✅ Valid field
  // TypeScript will suggest valid field names
})
```

## 🏗️ API Reference

### FMJSDriver Constructor

```typescript
new FMJSDriver<TSchema>(layouts: TSchema['layouts'], options: FMJSDriverOptions)
```

- `layouts`: The layouts object from your fmSchema.json
- `options.gofer`: An instance of fm-gofer for FileMaker communication

### Layout Methods

Each layout automatically gets these methods:

#### `create(fieldData: T, prescript?: ScriptInput, script?: ScriptInput): void`
Creates a new record with the provided field data.

#### `update(recordId: string | number, fieldData: Partial<T>, prescript?: ScriptInput, script?: ScriptInput): void`
Updates an existing record with partial field data.

#### `get(recordId: string | number, prescript?: ScriptInput, script?: ScriptInput): void`
Retrieves a single record by ID.

#### `find(query: Partial<T>, options?: { offset?: number; limit?: number }, prescript?: ScriptInput, script?: ScriptInput): void`
Finds records matching the query criteria with optional pagination.

#### `list(options?: { offset?: number; limit?: number }, prescript?: ScriptInput, script?: ScriptInput): void`
Lists multiple records with optional pagination.

#### `delete(recordId: string | number, prescript?: ScriptInput, script?: ScriptInput): void`
Deletes a record by ID.

#### `executeScript(script: ScriptInput): void`
Executes a custom FileMaker script directly (no layout context required).

**ScriptInput** can be either:
- A string: `"MyScript"` (creates `{script: "MyScript", parameter: "", option: 0}`)
- A ScriptObject: `{script: "MyScript", parameter: "data", option: 1}`

### Utility Methods

#### `getLayoutNames(): string[]`
Returns all available layout names.

#### `getLayoutFields(layoutName: string): Record<string, string> | undefined`
Returns field definitions for a specific layout.

#### `hasLayout(layoutName: string): boolean`
Checks if a layout exists in the schema.

## 🔧 Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Cleaning

```bash
npm run clean
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions and support, please open an issue on the GitHub repository.

## ✨ Features

- 🚀 Simple, consistent API (`create`, `update`, `find`, `get`, `list`, `delete`, `executeScript,metaData` )
- 🧠 Auto-generated schema from FileMaker (`fmSchema.ts`)
- 🧩 Full TypeScript type safety and autocomplete for layouts and fields
- 🪄 Works directly inside FileMaker Web Viewer
- 💬 Optional field metadata (for documentation, validation, or AI integration)

---

## 📦 Installation

```bash
npm install fm-jsdriver
```

---

## 🧰 Usage

### 1. Create your schema (manifest)

The manifest file defines your FileMaker layouts and field mappings.

```other
// fmSchema.json

{
    "fmSchema": {
        "layouts": {
            "Contacts": {
                "fieldMetaData": [
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "_ID",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__DOB",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "date",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__Gender",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__Name",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__NumberOfQualifications",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "number",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__StartsWorkAt",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "time",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__Surname",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__CreatedBy",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": true,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__CreationTimestamp",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "timeStamp",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": true,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__ModificationTimestamp",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "timeStamp",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__ModifiedBy",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    }
                ],
                "fields": {
                    "d__DOB": "d__DOB",
                    "d__Gender": "d__Gender",
                    "d__Name": "d__Name",
                    "d__NumberOfQualifications": "d__NumberOfQualifications",
                    "d__StartsWorkAt": "d__StartsWorkAt",
                    "d__Surname": "d__Surname",
                    "id": "_ID",
                    "z__CreatedBy": "z__CreatedBy",
                    "z__CreationTimestamp": "z__CreationTimestamp",
                    "z__ModificationTimestamp": "z__ModificationTimestamp",
                    "z__ModifiedBy": "z__ModifiedBy"
                }
            },
            "Notes": {
                "fieldMetaData": [
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "_ID",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "_ID_Contact",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": false,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "d__Note",
                        "notEmpty": false,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__CreatedBy",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": true,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__CreationTimestamp",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "timeStamp",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": true,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__ModificationTimestamp",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "timeStamp",
                        "timeOfDay": false,
                        "type": "normal"
                    },
                    {
                        "autoEnter": true,
                        "displayType": "editText",
                        "fourDigitYear": false,
                        "global": false,
                        "maxCharacters": 0,
                        "maxRepeat": 1,
                        "name": "z__ModifiedBy",
                        "notEmpty": true,
                        "numeric": false,
                        "repetitionEnd": 1,
                        "repetitionStart": 1,
                        "result": "text",
                        "timeOfDay": false,
                        "type": "normal"
                    }
                ],
                "fields": {
                    "id": "_ID",
                    "id_contact": "_ID_Contact",
                    "note": "d__Note",
                    "z__CreatedBy": "z__CreatedBy",
                    "z__CreationTimestamp": "z__CreationTimestamp",
                    "z__ModificationTimestamp": "z__ModificationTimestamp",
                    "z__ModifiedBy": "z__ModifiedBy"
                }
            }
        }
    }
}
```

> 💡 *This file can be generated automatically by a FileMaker script that inspects your solution.*

---

### 2. Initialize the driver

```other
import { FMJSDriver } from "fm-jsdriver"
import { fmSchema } from "./fmSchema"

const fm = new FMJSDriver(fmSchema)
```

---

### 3. Call methods

#### Option A – Explicit layout

```other
fm.create({
  layout: "Contacts",
  fieldData: { forename: "Alex", surname: "Papadopoulos" }
})
```

#### Option B – Layout shortcut

```other
fm.Contacts.create({ forename: "Alex", surname: "Papadopoulos" })
```

Both syntaxes internally call:

```other
FMGofer.PerformScript("jsDriver", JSON.stringify({...}))
```

---

## 🧩 API Reference

| **Method**        | **Description**                        |
| ----------------- | -------------------------------------- |
| `create()`        | Create a new record                    |
| `update()`        | Update an existing record              |
| `get()`           | Retrieve a record by ID                |
| `find()`          | Perform a find request                 |
| `list()`          | Retrieve all records in a layout       |
| `delete()`        | Delete a record                        |
| `executeScript()` | Run a FileMaker script with parameters |
| `metaData()`      | Returns layout metadata                |

---

### Example

```other
// Create
fm.Contacts.create({ forename: "Eleni", surname: "Voulgaris" })

// Update
fm.Contacts.update(1, { surname: "Koutra" })

// Get
fm.Contacts.get(1)

// Find
fm.Contacts.find({ surname: "Koutra" })

// Delete
fm.Contacts.delete(1)

// Execute a layout-specific script
fm.Contacts.executeScript("SyncContactToCRM", "A1B2C3")
```

---

## ⚙️ FileMaker Integration

All JS calls triggers the FileMaker script `jsDriver` 

Each script receives a JSON string parameter:

```json
{
  "dapi": 
    // FileMaker Execute Data API parameter
  {
	"action" : "create",
	"fieldData" : 
	{
		"d__Name" : "Alex",
		"d__Surname" : "Papadopoulos"
	},
	"layouts" : "Contacts"
}
}
```

FileMaker can then parse this JSON (e.g., using `JSONGetElement`) and perform the appropriate action.

---

## 🧠 TypeScript Magic

Thanks to `as const` in `fmSchema.ts`, layouts and fields are **fully typed**.

For example:

```other
fm.Contacts.create({ forename: "Alex" }) // ✅ OK
fm.Contacts.create({ foo: "bar" })       // ❌ Type error: "foo" is not a valid field
```

And you get autocomplete for:

- Layout names (`Contacts`, `Notes`)
- Field names (`forename`, `surname`, etc.)

---

## 🔍 Advanced Use: Field Metadata

`fieldMeta` entries can optionally include:

```other
{
  type: "string" | "number" | "boolean" | "date",
  description?: string,
  required?: boolean,
  readonly?: boolean
}
```

This metadata can be used for:

- Form validation
- Automatic UI generation
- AI context for schema understanding

---

## 🧪 Example Manifest Generator (in FileMaker)

FileMaker script pseudocode:

1. Loop through all layouts
2. Collect field names & metadata
3. Write JSON/JS file to `/Documents/fmSchema.ts`
4. Optionally inject directly into Web Viewer as `window.fmSchema`

---

## 🧑‍💻 Author

**Pineapple** — [https://pineapple.gr](https://pineapple.gr)
Full-stack FileMaker + JavaScript experts 🍍
Agile, lean, and built for long-term adoption.

---

## 🪪 License

MIT License © 2025 Pineapple

