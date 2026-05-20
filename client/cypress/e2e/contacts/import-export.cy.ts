describe('Import Contacts Modal', () => {
  beforeEach(() => {
    cy.visit('/contacts')
    cy.contains('Contacts').should('be.visible')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    // Open the import modal
    cy.contains('button', 'Import via CSV').click()
  })

  it('displays import options', () => {
    cy.contains('Download CSV Template').should('be.visible')
    cy.contains('Download JSON Template').should('be.visible')
  })

  it('shows file upload sections', () => {
    cy.get('input[accept=".csv"]').should('exist')
    cy.get('input[accept=".json"]').should('exist')
  })

  it('can upload a CSV file and preview contacts', () => {
    // Create a test CSV file
    const csvContent = 'name,email,company,status\nTest User,test@example.com,TestCorp,active\nAnother User,another@example.com,AnotherCorp,active'

    cy.get('input[accept=".csv"]').selectFile({
      contents: Cypress.Buffer.from(csvContent),
      fileName: 'contacts.csv',
      mimeType: 'text/csv',
    }, { force: true })

    // Should show preview step
    cy.contains('Contacts to import').should('be.visible')
    cy.contains('Confirm Import').should('be.visible')
  })

  it('can upload a JSON file and preview contacts', () => {
    const jsonContent = JSON.stringify([
      { name: 'JSON User', email: 'json@example.com', company: 'JSONCorp', status: 'active', customFields: [] },
    ])

    cy.get('input[accept=".json"]').selectFile({
      contents: Cypress.Buffer.from(jsonContent),
      fileName: 'contacts.json',
      mimeType: 'application/json',
    }, { force: true })

    // Should show preview step
    cy.contains('Contacts to import').should('be.visible')
    cy.contains('Confirm Import').should('be.visible')
  })

  it('can import contacts from CSV and shows success', () => {
    const csvContent = 'name,email,company,status\nImported User,imported@example.com,ImportCorp,active'

    cy.get('input[accept=".csv"]').selectFile({
      contents: Cypress.Buffer.from(csvContent),
      fileName: 'contacts.csv',
      mimeType: 'text/csv',
    }, { force: true })

    // Confirm the import
    cy.contains('button', 'Confirm Import').click()

    // Should show success
    cy.contains('Import Successful').should('be.visible')
    cy.contains('imported successfully').should('be.visible')

    // Close the modal
    cy.contains('button', 'Done').click()

    // The imported contact should now appear in the list
    cy.contains('Imported User').should('be.visible')
  })
})

describe('Export Contacts Dialog', () => {
  beforeEach(() => {
    cy.visit('/contacts')
    cy.contains('Contacts').should('be.visible')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
  })

  it('opens the export dialog', () => {
    cy.contains('button', 'Export').click()
    cy.contains('Export Contacts').should('be.visible')
  })

  it('displays export format options', () => {
    cy.contains('button', 'Export').click()
    cy.contains('Export as CSV').should('be.visible')
    cy.contains('Export as JSON').should('be.visible')
  })

  it('can select CSV format', () => {
    cy.contains('button', 'Export').click()
    cy.contains('Export as CSV').click()
    cy.contains('button', 'Export CSV').should('be.visible')
  })

  it('can select JSON format', () => {
    cy.contains('button', 'Export').click()
    cy.contains('Export as JSON').click()
    cy.contains('button', 'Export JSON').should('be.visible')
  })

  it('can cancel the export dialog', () => {
    cy.contains('button', 'Export').click()
    cy.contains('Export Contacts').should('be.visible')

    cy.get('[role="dialog"]').contains('button', 'Cancel').click({ force: true })
    cy.contains('Export Contacts').should('not.exist')
  })
})
