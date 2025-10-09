import { setup } from 'fm-jsdriver';
import fmSchema from './fmSchema.json' assert { type: 'json' };

const fm = setup(fmSchema);

const result = await fm.contacts.list();

if (result.data.messages[0].code !== '0') {
    throw new Error(`Error: ${result.data.messages[0].message}`);
} else {
    const records = result.data.response.data;
    let divList = document.createElement('div');
    divList.id = 'contact-list';
    
    for (const record of records) {
        // Create list of all contacts
        let divItem = document.createElement('div');
        divItem.className = 'contact-item';
        divItem.innerHTML = `ID: ${record.id}, Name: ${record.name}, Dob: ${record.dob}, No: ${record.qualifications_no}`;
        divList.appendChild(divItem);
    }
    document.body.appendChild(divList);
}
