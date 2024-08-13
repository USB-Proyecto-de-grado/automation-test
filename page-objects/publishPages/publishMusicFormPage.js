class PublishMusicFormPage {
    elements = {
      youTubeLinkInput: () => cy.get('#urlTextField'),
      titleInput: () => cy.get('#titleTextField'),
      descriptionInput: () => cy.get('#descriptionTextField'),
      postButton: () => cy.get('#postButton'),
      youTubePlayer: () => cy.get('#youTubePlayer'),
      snackbar: () => cy.get('.MuiSnackbar-root'),
    };
  
    fillMusicForm({ youTubeLink, title, description }) {
      this.elements.youTubeLinkInput().type(youTubeLink);
      this.elements.titleInput().type(title);
      this.elements.descriptionInput().type(description);
    }
  
    submitForm() {
      this.elements.postButton().click();
    }

    verifyYouTubePlayerVisible() {
      this.elements.youTubePlayer().should('be.visible');
    }
  }
  
  module.exports = new PublishMusicFormPage();
  