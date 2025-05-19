describe('Full user registration and login journey, landing page to select vehicle page', () => {

  it('should allow a user to register, login and navigate to vehicle selection', () => {
    // Step 1: Visit the landing page
    cy.visit('http://localhost:5500/group1-project/client/views/index.html');
    
    // Verify we're on the landing page
    cy.url().should('include', '/index.html');
    
    // Step 2: Find and click the signup button
    cy.get('.signup-button').click();
    
    // Verify navigation to the signup page
    cy.url().should('include', '/signup.html');
    
    // Step 3: Fill out the registration form
    // Generate a unique username and email to avoid conflicts on repeated test runs
    const uniqueSuffix = Date.now().toString();
    const username = `testuser${uniqueSuffix}`;
    const email = `testuser${uniqueSuffix}@example.com`;
    const password = 'SecurePassword123!';
    const postcode = 'AB12 3CD';
    
    cy.get('#username-input').type(username);
    cy.get('#email-input').type(email);
    cy.get('#password-input').type(password);
    cy.get('#postcode-input').type(postcode);
    
    // Submit the registration form
    cy.get('#register-form').submit();
    // Alternative if form submit doesn't work: cy.get('#submit-button').click();
    
    // Step 4: Verify redirection to signin page after registration
    cy.url().should('include', '/signin.html', { timeout: 10000 });
    
    // Verify the login form is present
    cy.get('#login-form').should('be.visible');
    
    // Fill in login credentials using the same details from registration
    cy.get('#username-input').type(username);
    cy.get('#password-input').type(password);
    
    // Submit the login form
    cy.get('#login-form').submit();
    // Alternative if form submit doesn't work: cy.get('#login-button').click();
    
    // Step 5: Verify successful redirection to select-vehicle page
    cy.url().should('include', '/select-vehicle.html', { timeout: 10000 });
    
    // Additional verification that we're on the vehicle selection page
    // This depends on what elements are expected on this page
    cy.contains('Select Your Vehicle').should('be.visible');
  });

  it('should allow a user to select a vehicle and navigate to the map page', () => {
    // Start directly at the vehicle selection page
    // In a real test, you might want to use a beforeEach hook to log in before this test
    cy.visit('http://localhost:5500/group1-project/client/views/select-vehicle.html');
    
    // Make sure the dropdown is visible
    cy.get('#vehicle-dropdown').should('be.visible');
    
    // Select a vehicle from the dropdown
    cy.get('#vehicle-dropdown').select('Tesla Model 3');
    
    // Verify the selection was made
    cy.get('#vehicle-dropdown').should('have.value', 'Model 3 Standard Range Plus');
    
    // Submit the vehicle selection form
    // Using a more generic approach since the exact submit button selector wasn't specified
    cy.get('#vehicle-selection-button').click();
    // Alternative approach: cy.get('form').submit();
    
    // Verify navigation to the map page
    cy.url().should('include', '/map.html', { timeout: 10000 });
    
    // Wait for the map to load
    // The exact selector might need adjustment based on how the map initializes
    cy.get('#myMap', { timeout: 15000 }).should('be.visible');
    
    // Check for the back button
    cy.get('#backButton').should('be.visible')
      .and('have.attr', 'href', './select-vehicle.html');
    
    // Check for the toggle drawer button
    cy.get('#toggleDrawer').should('be.visible');
    
    // Check for the drawer/sidebar (initially might be collapsed)
    cy.get('#drawer').should('exist');
    
    // Open the drawer if it's not already visible
    cy.get('#toggleDrawer').click();
    cy.get('#drawer').should('be.visible');
    
    // Verify the postcode input exists in the sidebar
    cy.get('#postcode-input').should('be.visible')
      .and('have.attr', 'placeholder', 'Postcode');
    
    // Verify other form elements in the sidebar
    cy.get('#battery').should('exist');
    cy.get('#passengers').should('exist');
    cy.get('#weather').should('exist');
    
    // Submit the settings form with a new postcode
    cy.get('#postcode-input').clear().type('S1 1AA');
    cy.get('#settingsForm button[type="submit"]').click();
    
    // Map should still be visible after form submission
    cy.get('#myMap').should('be.visible');
    
    // Verify the drawer can be closed
    cy.get('#toggleDrawer').click();
    // Check if drawer is collapsed - this may need adjustment based on your CSS implementation
    // For example, if you have a "drawer-closed" class or if the drawer moves off-screen
    cy.wait(500); // Wait for animation if there is one
    // This assertion depends on how your drawer closes - might need adjustment
    cy.get('#drawer').should('not.be.visible');
  });
  
  it('should allow selecting different vehicle models', () => {
    cy.visit('http://localhost:5500/group1-project/client/views/select-vehicle.html');
    
    // Check all four vehicle options are available
    cy.get('#vehicle-dropdown').should('be.visible')
      .find('option').should('have.length', 5);
    
    // Test each vehicle option
    const vehicles = ['Model 3 Standard Range Plus', 'e-Niro 64 kWh', 'e-tron GT', 'iX3'];
    
    vehicles.forEach(vehicle => {
      cy.get('#vehicle-dropdown').select(vehicle);
      cy.get('#vehicle-dropdown').should('have.value', vehicle);
    });
  });
  
  it('should display and interact with map settings controls', () => {
    cy.visit('http://localhost:5500/group1-project/client/views/map.html');
    
    // Open the drawer
    cy.get('#toggleDrawer').click();
    
    // Test battery capacity dropdown
    cy.get('#battery').select('75%');
    cy.get('#battery').should('have.value', '0.75');
    
    // Test passengers dropdown
    cy.get('#passengers').select('2');
    cy.get('#passengers').should('have.value', '0.9');
    
    // Test weather dropdown
    cy.get('#weather').select('Rain');
    cy.get('#weather').should('have.value', '0.75');
    
    // Submit the form with the new settings
    cy.get('#settingsForm button[type="submit"]').click();
    
    // Map should still be visible after applying settings
    cy.get('#myMap').should('be.visible');
  });
});