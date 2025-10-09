import { setup } from 'fm-jsdriver';
import fmSchema from './fmSchema.json' assert { type: 'json' };

const fm = setup(fmSchema);

// Demonstrate DAPI result structure in JavaScript
async function demonstrateDAPIResults() {
  try {
    const result = await fm.contacts.list();
    
    console.log('=== DAPI Result Structure ===');
    console.log('Error:', result.error);
    console.log('Messages:', result.data.messages);
    console.log('Found Count:', result.data.response.dataInfo.foundCount);
    
    if (result.data.response.data.length > 0) {
      const contact = result.data.response.data[0];
      
      console.log('\n=== Field Access Methods ===');
      console.log('Raw fieldData._ID:', contact.fieldData._ID);
      console.log('Friendly id property:', contact.id);  // Maps to _ID
      console.log('Name via fieldData:', contact.fieldData.d__Name);
      console.log('Name via friendly property:', contact.d__Name);
      
      console.log('\n=== Standard DAPI Properties ===');
      console.log('Record ID:', contact.recordId);
      console.log('Mod ID:', contact.modId);
      console.log('Portal Data:', contact.portalData);
    }
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Run the demonstration
const result = await demonstrateDAPIResults();

// Display in browser if available
if (typeof document !== 'undefined') {
  const outputElem = document.getElementById('output');
  if (outputElem && result) {
    outputElem.innerHTML = `
      <h3>JavaScript DAPI Results Demo</h3>
      <p>Check console for detailed output</p>
      <pre>${JSON.stringify(result, null, 2)}</pre>
    `;
  }
}