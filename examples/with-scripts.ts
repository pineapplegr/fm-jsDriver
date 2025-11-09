/**
 * Example: Using FileMaker scripts with fm-jsDriver
 * This demonstrates prescript and post-script execution
 */

import { createDriver } from 'fm-jsdriver';
import schema from './fmSchema';

const fm = createDriver(schema);

/**
 * Example 1: Create with validation script
 */
async function createWithValidation() {
  try {
    const result = await fm.Contacts.create(
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Tech Corp'
      },
      // Prescript: Validate data before creation
      {
        script: 'ValidateContactData',
        parameter: JSON.stringify({ strict: true }),
        option: 0
      },
      // Post-script: Send welcome email after creation
      {
        script: 'SendWelcomeEmail',
        parameter: 'new_contact',
        option: 5
      }
    );

    console.log('Contact created with validation:', result);
    return result;
  } catch (error) {
    console.error('Validation or creation failed:', error);
  }
}

/**
 * Example 2: Update with audit logging
 */
async function updateWithAudit(recordId: string) {
  try {
    const result = await fm.Contacts.update(
      recordId,
      {
        company: 'Updated Company',
        email: 'newemail@example.com'
      },
      // Prescript: Log the update
      { script: 'LogUpdateStart' },
      // Post-script: Send notification
      { script: 'SendUpdateNotification' }
    );

    console.log('Contact updated with audit:', result);
    return result;
  } catch (error) {
    console.error('Update failed:', error);
  }
}

/**
 * Example 3: Delete with confirmation
 */
async function deleteWithConfirmation(recordId: string) {
  try {
    const result = await fm.Contacts.delete(
      recordId,
      // Prescript: Check if deletion is allowed
      { script: 'CheckDeletionPermissions' },
      // Post-script: Clean up related records
      { script: 'CleanupRelatedRecords' }
    );

    console.log('Contact deleted with confirmation:', result);
    return result;
  } catch (error) {
    console.error('Deletion failed:', error);
  }
}

/**
 * Example 4: Execute standalone script
 */
async function generateReport() {
  try {
    // Simple string format
    const result1 = await fm.executeScript('GenerateMonthlyReport');

    // Full object format with parameters
    const result2 = await fm.executeScript({
      script: 'GenerateCustomReport',
      parameter: JSON.stringify({
        reportType: 'sales',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        includeCharts: true
      }),
      option: 5
    });

    console.log('Reports generated:', { result1, result2 });
    return { result1, result2 };
  } catch (error) {
    console.error('Report generation failed:', error);
  }
}

/**
 * Example 5: Complex workflow with multiple scripts
 */
async function complexWorkflow() {
  try {
    // Step 1: Create invoice with validation and numbering
    const invoice = await fm.Invoices.create(
      {
        clientId: 123,
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 1500.00,
        status: 'pending'
      },
      { script: 'ValidateInvoiceData' },
      { script: 'GenerateInvoiceNumber' }
    );

    // Step 2: Update invoice with payment
    const updated = await fm.Invoices.update(
      invoice.recordId,
      {
        amountPaid: 1500.00,
        status: 'paid'
      },
      { script: 'BeginTransaction' },
      { script: 'CommitTransaction' }
    );

    // Step 3: Execute report generation
    await fm.executeScript({
      script: 'EmailInvoice',
      parameter: JSON.stringify({
        invoiceId: invoice.recordId,
        recipient: 'client@example.com'
      })
    });

    console.log('Complex workflow completed:', updated);
  } catch (error) {
    console.error('Workflow failed:', error);
    // Rollback if needed
    await fm.executeScript('RollbackTransaction');
  }
}

/**
 * Example 6: Batch processing with scripts
 */
async function batchProcessing() {
  try {
    const contacts = [
      { name: 'Contact 1', email: 'c1@example.com' },
      { name: 'Contact 2', email: 'c2@example.com' },
      { name: 'Contact 3', email: 'c3@example.com' }
    ];

    // Process all contacts with validation
    const results = await Promise.all(
      contacts.map(contact =>
        fm.Contacts.create(
          contact,
          { script: 'ValidateContactData' },
          { script: 'AddToMailingList' }
        )
      )
    );

    console.log('Batch processing completed:', results);
    return results;
  } catch (error) {
    console.error('Batch processing failed:', error);
  }
}

// Export functions for use in other modules
export {
  createWithValidation,
  updateWithAudit,
  deleteWithConfirmation,
  generateReport,
  complexWorkflow,
  batchProcessing
};
