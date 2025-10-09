// Proper way to test script IntelliSense
import fmSchema from "./fmSchema.json" assert { type: "json" }
import { FMJSDriver } from "./FMJSDriver.js"

// Create mock gofer
const mockGofer = {
  PerformScriptWithOption: (script: string, parameter: string, option: number) => {
    console.log(`Script: ${script}, Param: ${parameter}, Option: ${option}`)
  }
}

// SOLUTION: Create a properly typed driver using declaration merging
const driver = new FMJSDriver(fmSchema)

// Method 1: Use index signature (runtime works, limited IntelliSense)
const contacts = (driver as any).Contacts
contacts.executeScript("Generate Manifest") // Works but no IntelliSense

// Method 2: Create a typed interface for your specific schema
interface MyFMDriver {
  Contacts: {
    executeScript(script: "Generate Manifest" | "jsDriver"): void
    create(data: {
      d__DOB?: string
      d__Gender?: string  
      d__Name?: string
      d__NumberOfQualifications?: number
      d__StartsWorkAt?: string
      d__Surname?: string
    }, prescript?: "Generate Manifest" | "jsDriver", script?: "Generate Manifest" | "jsDriver"): void
    list(options?: {limit?: number, offset?: number}): void
    find(query: any, options?: {limit?: number, offset?: number}): void
    get(id: string | number): void
    update(id: string | number, data: any): void
    delete(id: string | number): void
  }
  Notes: {
    executeScript(script: "Generate Manifest" | "jsDriver"): void
    create(data: {
      note?: string
      id_contact?: string
    }): void
    // ... other methods
  }
}

// Cast to typed interface for perfect IntelliSense
const fm = driver as unknown as MyFMDriver

// NOW TEST INTELLISENSE:
// 1. Type this line and see if you get autocomplete for scripts:
fm.Contacts.executeScript("Generate Manifest") // Should show "Generate Manifest" | "jsDriver"

// 2. Test invalid script (should show error):
// fm.Contacts.executeScript("InvalidScript") // Uncomment to test error

// 3. Test field autocomplete:
fm.Contacts.create({
  d__Name: "John",
  d__Surname: "Doe",
  d__DOB: "1990-01-01"
})

// 4. Test with script parameters:
fm.Contacts.create(
  { d__Name: "Jane" }, 
  "Generate Manifest", // prescript - should autocomplete
  "jsDriver"           // script - should autocomplete  
)

console.log("IntelliSense test ready - check autocomplete as you type!")