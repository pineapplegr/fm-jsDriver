import { setup } from 'fm-jsdriver';
import fmSchema from './fmSchema.json' assert { type: 'json' };

const fm = setup(fmSchema);
const result = await fm.contacts.list();