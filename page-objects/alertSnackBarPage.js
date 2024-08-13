class AlertSnackBarPage {
    elements = {
      snackbar: () => cy.get('.MuiSnackbar-root'),
      alert: () => cy.get('.MuiAlert-message'),
    };
  
    verifySnackbarMessage(expectedMessage) {
      this.elements.snackbar().should('be.visible');
      this.elements.alert().should('contain.text', expectedMessage);
    }
  }
  
  module.exports = new AlertSnackBarPage();
  