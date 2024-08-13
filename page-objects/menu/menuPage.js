class FormNavigationMenuPage {
    elements = {
        musicButton: () => cy.get('#music-button'),
        publicationButton: () => cy.get('#publication-button'),
        eventButton: () => cy.get('#event-button')
    }

    clickMusicButton() {
        this.elements.musicButton().click();
    }

    clickPublicationButton() {
        this.elements.publicationButton().click();
    }

    clickEventButton() {
        this.elements.eventButton().click();
    }
}

module.exports = new FormNavigationMenuPage();
