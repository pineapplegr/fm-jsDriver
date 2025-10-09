// Test with explicit type annotation to verify IntelliSense
import fmSchema from "./fmSchema.json" assert { type: "json" };
import { FMJSDriver } from "./FMJSDriver.js";
// Mock gofer
const mockGofer = {
    PerformScriptWithOption: (script, parameter, option) => {
        console.log(`Executed: ${script}`);
    }
};
// Test 1: Check if layouts are accessible
const fm = new FMJSDriver(fmSchema);
// Test 2: Check available layouts
console.log("Available layouts:", fm.getLayoutNames());
// Should show: ["Contacts", "Notes"]
// Test 3: Check layout fields
console.log("Contacts fields:", fm.getLayoutFields("Contacts"));
// Test 4: Try a method call
try {
    // This should work but won't have perfect type inference from JSON
    fm.Contacts.executeScript("Generate Manifest");
    console.log("✅ Script execution works");
}
catch (error) {
    console.error("❌ Script execution failed:", error);
}
const typedFm = fm;
// Now try this - IntelliSense should work:
// typedFm.Contacts.executeScript("Generate Manifest") // Should autocomplete
// typedFm.Contacts.executeScript("BadScript")         // Should error
