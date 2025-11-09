# FileMaker Script Implementation

This document provides detailed instructions for implementing the required FileMaker script that handles fm-jsDriver requests.

## Overview

fm-jsDriver communicates with FileMaker by calling a single script named `jsDriver` via `FMGofer.PerformScript()`. This script receives JSON parameters and uses FileMaker's `ExecuteDataAPI()` function to process requests.

## Script Name

**jsDriver**

## Script Parameter Format

The script receives a JSON parameter with this structure:

```json
{
  "prescript": {
    "script": "ScriptName",
    "parameter": "parameter value",
    "option": 0
  },
  "dapi": {
    "action": "create|read|update|delete|duplicate|metaData",
    "layouts": "LayoutName",
    "recordId": "123",
    "fieldData": { "field1": "value1" },
    "query": [{ "field1": "value1" }],
    "offset": 1,
    "limit": 100,
    "sort": [{ "fieldName": "name", "sortOrder": "ascend" }]
  },
  "script": {
    "script": "ScriptName",
    "parameter": "parameter value",
    "option": 0
  }
}
```

## Complete Script Implementation

### Method 1: Basic Implementation

```filemaker
# Script: jsDriver
# Purpose: Handle fm-jsDriver requests
# Parameter: JSON parameter as described above

# Step 1: Get the script parameter
Set Variable [ $param ; Value: Get ( ScriptParameter ) ]

# Step 2: Execute prescript if provided
If [ Not IsEmpty ( JSONGetElement ( $param ; "prescript" ) ) ]
    Set Variable [ $prescriptName ; Value: JSONGetElement ( $param ; "prescript.script" ) ]
    Set Variable [ $prescriptParam ; Value: JSONGetElement ( $param ; "prescript.parameter" ) ]
    Perform Script [ Specified: By Name ; $prescriptName ; Parameter: $prescriptParam ]
End If

# Step 3: Execute Data API request if provided
If [ Not IsEmpty ( JSONGetElement ( $param ; "dapi" ) ) ]
    Set Variable [ $dapiRequest ; Value: JSONGetElement ( $param ; "dapi" ) ]
    Set Variable [ $dapiResult ; Value: ExecuteDataAPI ( $dapiRequest ) ]
End If

# Step 4: Execute post-script if provided
If [ Not IsEmpty ( JSONGetElement ( $param ; "script" ) ) ]
    Set Variable [ $scriptName ; Value: JSONGetElement ( $param ; "script.script" ) ]
    Set Variable [ $scriptParam ; Value: JSONGetElement ( $param ; "script.parameter" ) ]
    Perform Script [ Specified: By Name ; $scriptName ; Parameter: $scriptParam ]
End If

# Step 5: Return the result
Exit Script [ Text Result: $dapiResult ]
```

### Method 2: With Error Handling

```filemaker
# Script: jsDriver
# Purpose: Handle fm-jsDriver requests with error handling
# Parameter: JSON parameter

Set Variable [ $param ; Value: Get ( ScriptParameter ) ]
Set Variable [ $error ; Value: "" ]

# Validate parameter
If [ IsEmpty ( $param ) or Left ( $param ; 1 ) ≠ "{" ]
    Set Variable [ $error ; Value: "Invalid parameter format" ]
    Exit Script [ Text Result: JSONSetElement ( "{}" ;
        [ "error" ; $error ; JSONString ] ;
        [ "errorCode" ; "-1" ; JSONNumber ]
    ) ]
End If

# Execute prescript
If [ Not IsEmpty ( JSONGetElement ( $param ; "prescript" ) ) ]
    Set Variable [ $prescriptName ; Value: JSONGetElement ( $param ; "prescript.script" ) ]
    Set Variable [ $prescriptParam ; Value: JSONGetElement ( $param ; "prescript.parameter" ) ]
    Set Variable [ $prescriptOption ; Value: JSONGetElement ( $param ; "prescript.option" ) ]

    Perform Script [ Specified: By Name ; $prescriptName ; Parameter: $prescriptParam ]

    # Check for errors
    If [ Get ( LastError ) ≠ 0 ]
        Set Variable [ $error ; Value: "Prescript failed: " & Get ( LastError ) ]
        Exit Script [ Text Result: JSONSetElement ( "{}" ;
            [ "error" ; $error ; JSONString ] ;
            [ "errorCode" ; Get ( LastError ) ; JSONNumber ]
        ) ]
    End If
End If

# Execute Data API
If [ Not IsEmpty ( JSONGetElement ( $param ; "dapi" ) ) ]
    Set Variable [ $dapiRequest ; Value: JSONGetElement ( $param ; "dapi" ) ]
    Set Variable [ $dapiResult ; Value: ExecuteDataAPI ( $dapiRequest ) ]

    # Check for Data API errors
    Set Variable [ $resultCode ; Value: JSONGetElement ( $dapiResult ; "messages[0].code" ) ]
    If [ $resultCode ≠ "0" ]
        # Data API returned an error
        Exit Script [ Text Result: $dapiResult ]
    End If
End If

# Execute post-script
If [ Not IsEmpty ( JSONGetElement ( $param ; "script" ) ) ]
    Set Variable [ $scriptName ; Value: JSONGetElement ( $param ; "script.script" ) ]
    Set Variable [ $scriptParam ; Value: JSONGetElement ( $param ; "script.parameter" ) ]
    Set Variable [ $scriptOption ; Value: JSONGetElement ( $param ; "script.option" ) ]

    Perform Script [ Specified: By Name ; $scriptName ; Parameter: $scriptParam ]

    # Check for errors
    If [ Get ( LastError ) ≠ 0 ]
        Set Variable [ $error ; Value: "Post-script failed: " & Get ( LastError ) ]
        Exit Script [ Text Result: JSONSetElement ( "{}" ;
            [ "error" ; $error ; JSONString ] ;
            [ "errorCode" ; Get ( LastError ) ; JSONNumber ]
        ) ]
    End If
End If

# Return successful result
Exit Script [ Text Result: $dapiResult ]
```

### Method 3: With Logging

```filemaker
# Script: jsDriver
# Purpose: Handle fm-jsDriver requests with logging
# Parameter: JSON parameter

Set Variable [ $param ; Value: Get ( ScriptParameter ) ]
Set Variable [ $startTime ; Value: Get ( CurrentTimeUTCMilliseconds ) ]

# Log request
Perform Script [ "LogAPIRequest" ; Parameter: $param ]

# Execute prescript
If [ Not IsEmpty ( JSONGetElement ( $param ; "prescript" ) ) ]
    Set Variable [ $prescriptName ; Value: JSONGetElement ( $param ; "prescript.script" ) ]
    Set Variable [ $prescriptParam ; Value: JSONGetElement ( $param ; "prescript.parameter" ) ]
    Perform Script [ Specified: By Name ; $prescriptName ; Parameter: $prescriptParam ]
    Set Variable [ $prescriptResult ; Value: Get ( ScriptResult ) ]
End If

# Execute Data API
If [ Not IsEmpty ( JSONGetElement ( $param ; "dapi" ) ) ]
    Set Variable [ $dapiRequest ; Value: JSONGetElement ( $param ; "dapi" ) ]
    Set Variable [ $dapiResult ; Value: ExecuteDataAPI ( $dapiRequest ) ]
End If

# Execute post-script
If [ Not IsEmpty ( JSONGetElement ( $param ; "script" ) ) ]
    Set Variable [ $scriptName ; Value: JSONGetElement ( $param ; "script.script" ) ]
    Set Variable [ $scriptParam ; Value: JSONGetElement ( $param ; "script.parameter" ) ]
    Perform Script [ Specified: By Name ; $scriptName ; Parameter: $scriptParam ]
    Set Variable [ $scriptResult ; Value: Get ( ScriptResult ) ]
End If

# Calculate execution time
Set Variable [ $endTime ; Value: Get ( CurrentTimeUTCMilliseconds ) ]
Set Variable [ $duration ; Value: $endTime - $startTime ]

# Log response
Perform Script [ "LogAPIResponse" ; Parameter: JSONSetElement ( "{}" ;
    [ "duration" ; $duration ; JSONNumber ] ;
    [ "result" ; $dapiResult ; JSONObject ]
) ]

# Return result
Exit Script [ Text Result: $dapiResult ]
```

## ExecuteDataAPI Function

The `ExecuteDataAPI()` function is built into FileMaker and accepts a JSON parameter with these keys:

### Supported Actions

- **create**: Create a new record
- **read**: Read/find records
- **update**: Update an existing record
- **delete**: Delete a record
- **duplicate**: Duplicate a record
- **metaData**: Get layout metadata

### Example Data API Requests

#### Create a Record

```json
{
  "action": "create",
  "layouts": "Contacts",
  "fieldData": {
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp"
  }
}
```

#### Read a Single Record

```json
{
  "action": "read",
  "layouts": "Contacts",
  "recordId": "123"
}
```

#### Find Records

```json
{
  "action": "read",
  "layouts": "Contacts",
  "query": [
    {
      "company": "Acme Corp"
    }
  ],
  "offset": 1,
  "limit": 10,
  "sort": [
    {
      "fieldName": "name",
      "sortOrder": "ascend"
    }
  ]
}
```

#### Update a Record

```json
{
  "action": "update",
  "layouts": "Contacts",
  "recordId": "123",
  "fieldData": {
    "company": "New Company Inc."
  }
}
```

#### Delete a Record

```json
{
  "action": "delete",
  "layouts": "Contacts",
  "recordId": "123"
}
```

## Response Format

ExecuteDataAPI returns a JSON response in this format:

### Successful Response

```json
{
  "messages": [
    {
      "code": "0",
      "message": "OK"
    }
  ],
  "response": {
    "recordId": "123",
    "modId": "5",
    "data": [
      {
        "fieldData": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "recordId": "123",
        "modId": "5"
      }
    ],
    "dataInfo": {
      "database": "MyDatabase",
      "layout": "Contacts",
      "table": "Contacts",
      "totalRecordCount": 100,
      "foundCount": 1,
      "returnedCount": 1
    }
  }
}
```

### Error Response

```json
{
  "messages": [
    {
      "code": "101",
      "message": "Record is missing"
    }
  ],
  "response": {}
}
```

## Testing the Script

### Test in FileMaker Script Workspace

1. Create a new script named `jsDriver`
2. Add the script steps as shown above
3. Create a test script to call it:

```filemaker
# Test Script
Set Variable [ $testParam ; Value: JSONSetElement ( "{}" ;
    [ "dapi.action" ; "read" ; JSONString ] ;
    [ "dapi.layouts" ; "Contacts" ; JSONString ] ;
    [ "dapi.limit" ; 10 ; JSONNumber ]
) ]

Perform Script [ "jsDriver" ; Parameter: $testParam ]
Set Variable [ $result ; Value: Get ( ScriptResult ) ]
Show Custom Dialog [ "Result" ; $result ]
```

### Test from JavaScript Console (in webviewer)

```javascript
// Test the jsDriver script
const testParam = {
  dapi: {
    action: 'read',
    layouts: 'Contacts',
    limit: 10
  }
};

FMGofer.PerformScript('jsDriver', JSON.stringify(testParam))
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

## Common Issues and Solutions

### Issue 1: Script Not Found

**Error**: "Script not found" or script doesn't execute

**Solution**:
- Ensure the script is named exactly `jsDriver` (case-sensitive)
- Make sure the script is in the same file or accessible from the current file
- Check that the script has proper access privileges

### Issue 2: ExecuteDataAPI Not Working

**Error**: ExecuteDataAPI returns errors or empty results

**Solution**:
- Ensure you're using FileMaker 19.2 or later (ExecuteDataAPI was introduced in 19.2)
- Verify the layout name matches exactly (case-sensitive)
- Check that field names in fieldData match the layout's field names
- Ensure the user has proper privileges for the layout and fields

### Issue 3: Scripts Not Executing

**Error**: Prescript or post-script doesn't run

**Solution**:
- Verify script names are spelled correctly
- Check that scripts have proper privileges
- Use "Perform Script by Name" with the variable containing the script name
- Ensure the scripts are enabled and not set to "Never Run"

## Best Practices

1. **Error Handling**: Always include error checking and return meaningful error messages
2. **Logging**: Log API requests for debugging and monitoring
3. **Security**: Validate all input parameters before processing
4. **Performance**: Keep the jsDriver script efficient - move complex logic to pre/post scripts
5. **Privileges**: Set appropriate script privileges (Run script with full access if needed)
6. **Transaction Control**: Use prescripts/post-scripts for transaction management
7. **Validation**: Validate data in prescripts before creating/updating records

## Security Considerations

1. **Validate Input**: Always validate the JSON parameter format
2. **Privilege Sets**: Ensure users have appropriate privileges
3. **Script Privileges**: Consider using "Run with full access privileges" carefully
4. **Field-Level Security**: Use privilege sets to restrict field access
5. **Layout Security**: Control which layouts are accessible via the Data API
6. **Audit Trail**: Log all API operations for security auditing

## Advanced Features

### Transaction Management

```filemaker
# BeginTransaction Script (prescript)
Set Variable [ $$transactionID ; Value: Get ( UUID ) ]
Set Variable [ $$transactionActive ; Value: True ]

# CommitTransaction Script (post-script)
If [ $$transactionActive ]
    Commit Records/Requests
    Set Variable [ $$transactionActive ; Value: False ]
End If

# RollbackTransaction Script
If [ $$transactionActive ]
    Revert Record/Request
    Set Variable [ $$transactionActive ; Value: False ]
End If
```

### Data Validation

```filemaker
# ValidateContactData Script (prescript)
Set Variable [ $param ; Value: Get ( ScriptParameter ) ]
Set Variable [ $errors ; Value: "" ]

# Parse the fieldData that will be created
Set Variable [ $email ; Value: JSONGetElement ( $param ; "email" ) ]

# Validate email format
If [ PatternCount ( $email ; "@" ) = 0 ]
    Set Variable [ $errors ; Value: $errors & "Invalid email format. " ]
End If

# If errors, exit with error
If [ Not IsEmpty ( $errors ) ]
    Exit Script [ Text Result: JSONSetElement ( "{}" ;
        [ "error" ; $errors ; JSONString ] ;
        [ "errorCode" ; "900" ; JSONString ]
    ) ]
End If
```

## Conclusion

The jsDriver script is a critical component that bridges fm-jsDriver and FileMaker. Implement it carefully with proper error handling and security considerations for a robust integration.
