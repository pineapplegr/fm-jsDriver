// Proper way to test script IntelliSense
import fmSchema from "./fmSchema.json" assert { type: "json" };
import { FMJSDriver } from "./FMJSDriver.js";
// Create mock gofer
const mockGofer = {
    PerformScriptWithOption: (script, parameter, option) => {
        console.log(`Script: ${script}, Param: ${parameter}, Option: ${option}`);
    }
};
// SOLUTION: Create a properly typed driver using declaration merging
const driver = new FMJSDriver(fmSchema);
// Method 1: Use index signature (runtime works, limited IntelliSense)
const contacts = driver.Contacts;
contacts.executeScript("Generate Manifest"); // Works but no IntelliSense
// Cast to typed interface for perfect IntelliSense
const fm = driver;
// NOW TEST INTELLISENSE:
// 1. Type this line and see if you get autocomplete for scripts:
fm.Contacts.executeScript("Generate Manifest"); // Should show "Generate Manifest" | "jsDriver"
// 2. Test invalid script (should show error):
// fm.Contacts.executeScript("InvalidScript") // Uncomment to test error
// 3. Test field autocomplete:
fm.Contacts.create({
    d__Name: "John",
    d__Surname: "Doe",
    d__DOB: "1990-01-01"
});
// 4. Test with script parameters:
fm.Contacts.create({ d__Name: "Jane" }, "Generate Manifest", // prescript - should autocomplete
"jsDriver" // script - should autocomplete  
);
console.log("IntelliSense test ready - check autocomplete as you type!");
