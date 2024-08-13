class MusicViewContainerPage {
    elements = {
      title: () => cy.get('h3'),
      description: () => cy.get('p'),
      publicationDate: () => cy.get('label'),
      youTubePlayer: () => cy.get('iframe'),
    };
  
    verifyMusicDetails({ title, description, publicationDate }) {
      this.elements.title().should('contain.text', title);
      this.elements.description().should('contain.text', description);
      this.elements.publicationDate().should('contain.text', publicationDate);
    }
  
  }
  
  module.exports = new MusicViewContainerPage();
  