// cypress/pages/PublishEventFormPage.js

class PublishEventFormPage {
    elements = {
      titleInput: () => cy.get('#eventTitle'),
      datePicker: () => cy.get('[role="textbox"][aria-label="Choose date"]'), // Selector para el DatePicker
      ubicationInput: () => cy.get('#ubicationTextField'),
      priceInput: () => cy.get('#priceTextField'),
      descriptionInput: () => cy.get('#descriptionTextField'),
      publishButton: () => cy.get('button[type="submit"]'),
      postButton: () => cy.get('#postButton'),
      snackbar: () => cy.get('.MuiSnackbar-root'),
    };
  
    clickPublishButton() {
        this.elements.postButton().click({ force: true });
    }

    fillEventForm({ title, date, ubication, price, description }) {
      this.clickPublishButton(); // Primero se hace clic en el botón de "Publicar"
      this.elements.titleInput().scrollIntoView().should('be.visible').type(title);
      this.elements.datePicker().click().type(`${date}{enter}`);
      this.elements.ubicationInput().scrollIntoView().should('be.visible').type(ubication);
      this.elements.priceInput().scrollIntoView().should('be.visible').type(price);
      this.elements.descriptionInput().scrollIntoView().should('be.visible').type(description);
    }
  
    submitForm() {
      this.elements.publishButton().click();
    }
  
    verifySnackbar(statusCode) {
      this.elements.snackbar().should('contain.text', statusCode);
    }
  }
  
  module.exports = new PublishEventFormPage();
  