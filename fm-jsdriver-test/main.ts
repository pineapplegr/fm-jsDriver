import { setup } from 'fm-jsdriver';
import fmSchema from './fmSchema.json' assert { type: 'json' };

const fm = setup(fmSchema);

const result = await fm.contacts.list();

if (result.data.messages[0].code !== '0') {
    throw new Error(`Error: ${result.data.messages[0].message}`);
} else {
    const records = result.data.response.data;
    
    // Create table element
    let table = document.createElement('table');
    table.id = 'contact-table';
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '20px';
    
    // Create table header
    let thead = document.createElement('thead');
    let headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">ID</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Name</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Surname</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date of Birth</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    let tbody = document.createElement('tbody');
    
    for (const record of records) {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${record.id || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${record.name || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${record.surname || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${record.recordId || ''}</td>
        `;
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    document.body.appendChild(table);
}
