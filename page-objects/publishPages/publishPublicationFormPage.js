class PublishPublicationFormPage {
    elements = {
      titleInput: () => cy.get('#eventTitle'),
      descriptionInput: () => cy.get('#descriptionTextField'),
      postButton: () => cy.get('button[type="submit"]'),
      snackbar: () => cy.get('.MuiSnackbar-root'),
      alertMessage: () => cy.get('.MuiAlert-message'),
    };
  
    clickPostButton() {
      this.elements.postButton().click();
    }
  
    fillPublicationForm({ title, description }) {
      this.clickPostButton(); // Hace clic en el botón antes de llenar el formulario
      this.elements.titleInput().type(title);
      this.elements.descriptionInput().type(description);
    }
  
    submitForm() {
      this.elements.postButton().click();
    }
  
    verifySnackbarMessage(expectedMessage) {
      this.elements.snackbar().should('be.visible');
      this.elements.alertMessage().should('contain.text', expectedMessage);
    }
  }
  
  module.exports = new PublishPublicationFormPage();
  