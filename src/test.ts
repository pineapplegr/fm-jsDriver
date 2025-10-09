import { readFileSync } from 'fs'
import { FMJSDriver } from "./FMJSDriver.js"

// Load schema using fs instead of import assertion
const fmSchema = JSON.parse(readFileSync('./src/fmSchema.json', 'utf-8'))

// Option 1: With mock gofer for testing
const mockGofer = {
  PerformScriptWithOption: (script: string, parameter: string, option: number) => {
    console.log(`Would call FileMaker script: ${script}`)
  }
}

const fm = new FMJSDriver(fmSchema)

// Option 2: How it should be initialized in real FileMaker environment
// import { fmGofer } from "fm-gofer"
// const fm = new FMJSDriver(fmSchema.fmSchema.layouts, { gofer: fmGofer })

// Test if it works
console.log("Available layouts:", fm.getLayoutNames())
console.log("Contacts layout exists:", fm.hasLayout("Contacts"))

// Test dynamic properties
console.log("Dynamic Contacts property exists:", "Contacts" in fm)
if ("Contacts" in fm) {
  console.log("✅ Dynamic layout properties are working!")
  // Use any to bypass TypeScript for testing
  ;(fm as any).Contacts.executeScript("Generate Manifest")
} else {
  console.log("❌ Dynamic layout properties are NOT working")
}