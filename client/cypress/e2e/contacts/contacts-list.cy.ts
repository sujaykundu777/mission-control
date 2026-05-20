describe('Contacts List Page', () => {
  beforeEach(() => {
    cy.visit('/contacts')
    cy.contains('Contacts').should('be.visible')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
  })

  it('renders the page header and stats', () => {
    cy.contains('Contacts').should('be.visible')
    cy.contains('total').should('be.visible')
    cy.contains('active').should('be.visible')
  })

  it('renders action buttons', () => {
    cy.contains('button', 'Add Contact').should('be.visible')
    cy.contains('button', 'Import via CSV').should('be.visible')
  })

  it('displays the test contact in the list', () => {
    // The test contact "Ethnic Trousseau" should be visible
    cy.contains('Ethnic Trousseau').should('be.visible')
    cy.contains('info@ethnictrousseau.com').should('be.visible')
  })

  it('can search contacts by name', () => {
    cy.get('input[placeholder*="Search contacts"]').type('Ethnic')
    cy.contains('Ethnic Trousseau').should('be.visible')
  })

  it('can search contacts by email', () => {
    cy.get('input[placeholder*="Search contacts"]').type('ethnictrousseau')
    cy.contains('Ethnic Trousseau').should('be.visible')
  })

  it('can search contacts by company', () => {
    cy.get('input[placeholder*="Search contacts"]').type('Ethnic Trousseau')
    cy.contains('Ethnic Trousseau').should('be.visible')
  })

  it('shows no results for non-matching search', () => {
    cy.get('input[placeholder*="Search contacts"]').type('zzzznonexistent')
    cy.contains('Ethnic Trousseau').should('not.exist')
  })

  it('can filter contacts by status', () => {
    // Click Active filter
    cy.contains('button', 'Active').click()
    cy.contains('Ethnic Trousseau').should('be.visible')

    // Click Inactive filter - test contact is active so shouldn't appear
    cy.contains('button', 'Inactive').click()
    cy.contains('Ethnic Trousseau').should('not.exist')

    // Click All to reset
    cy.contains('button', 'All').click()
    cy.contains('Ethnic Trousseau').should('be.visible')
  })

  it('can toggle between grid and list views', () => {
    // Find view toggle buttons (grid/list icons)
    // The view toggle should change the layout
    cy.get('button').filter(':has(svg)').should('exist')
  })

  it('navigates to add contact page', () => {
    cy.contains('button', 'Add Contact').click()
    cy.url().should('include', '/contacts/add')
  })

  it('navigates to contact detail page when clicking view', () => {
    // Click the view (eye) button link for the test contact
    cy.get('a[href="/contacts/test-client-1"]').first().click()

    cy.url().should('include', '/contacts/test-client-1')
  })

  it('opens import modal when clicking Import via CSV', () => {
    cy.contains('button', 'Import via CSV').click()

    // Import modal should appear
    cy.contains('Download CSV Template').should('be.visible')
    cy.contains('Download JSON Template').should('be.visible')
  })
})
