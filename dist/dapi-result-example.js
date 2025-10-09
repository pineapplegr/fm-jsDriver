import { setup } from './index.js';
import fmSchema from './fmSchema.json' assert { type: 'json' };
// Create the driver with schema
const fm = setup(fmSchema);
async function demonstrateDAPIResults() {
    try {
        // This will now return a properly typed ParsedDAPIResult
        const result = await fm.contacts.list();
        // You now have full IntelliSense on the result structure
        console.log('Error code:', result.error);
        console.log('Messages:', result.data.messages);
        console.log('Found count:', result.data.response.dataInfo.foundCount);
        // Access records with both field name formats
        const records = result.data.response.data;
        if (records.length > 0) {
            const firstRecord = records[0];
            // Access via fieldData (raw FileMaker field names)
            console.log('Raw ID:', firstRecord.fieldData._ID);
            console.log('Raw Name:', firstRecord.fieldData.d__Name);
            // Access via friendly mapped names (from schema fields section)
            console.log('Friendly ID:', firstRecord.id); // maps to _ID
            console.log('Friendly Name:', firstRecord.d__Name); // already friendly
            // Other standard DAPI properties
            console.log('Record ID:', firstRecord.recordId);
            console.log('Mod ID:', firstRecord.modId);
        }
        // Type checking ensures proper structure
        // This would cause TypeScript errors if structure doesn't match:
        // result.wrongProperty;  // ❌ Error
        // result.data.response.data[0].invalidField;  // ❌ Error
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// This example shows the expected format for testing
const exampleDAPIResponse = {
    "data": {
        "messages": [{ "code": "0", "message": "OK" }],
        "response": {
            "data": [{
                    "fieldData": {
                        "_ID": "99679ABF-024D-4A06-8121-B2D27E92B6D8",
                        "d__DOB": "",
                        "d__Gender": "",
                        "d__Name": "George",
                        "d__NumberOfQualifications": "",
                        "d__StartsWorkAt": "",
                        "d__Surname": "Lucas",
                        "z__CreatedBy": "Admin",
                        "z__CreationTimestamp": "10/09/2025 01:45:40",
                        "z__ModificationTimestamp": "10/09/2025 02:00:38",
                        "z__ModifiedBy": "Admin"
                    },
                    "modId": "1",
                    "portalData": {},
                    "recordId": "1"
                }],
            "dataInfo": {
                "database": "FmJsDriver",
                "foundCount": 1,
                "layout": "Contacts_API",
                "returnedCount": 1,
                "table": "Contacts",
                "totalRecordCount": 1
            }
        }
    },
    "error": 0
};
export { demonstrateDAPIResults, exampleDAPIResponse };
