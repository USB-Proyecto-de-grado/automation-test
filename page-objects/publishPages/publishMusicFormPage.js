class PublishMusicFormPage {
    elements = {
      youTubeLinkInput: () => cy.get('#urlTextField'),
      titleInput: () => cy.get('#titleTextField'),
      descriptionInput: () => cy.get('#descriptionTextField'),
      postButton: () => cy.get('#postButton'),
      youTubePlayer: () => cy.get('#youTubePlayer'),
      snackbar: () => cy.get('.MuiSnackbar-root'),
      youTubeIframe: () => cy.frameLoaded('#youTubePlayer'), 
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

    verifyYouTubeIframePlayerVisible() {
      this.elements.youTubeIframe();
      cy.iframe('#youTubePlayer').find('.html5-video-container').should('exist');
    }
  
    verifyVideoPlayback() {
      cy.iframe('#youTubePlayer').find('.html5-main-video').invoke('prop', 'currentTime').should('be.gt', 0);
    }
  }
  
  module.exports = new PublishMusicFormPage();
  