/// <reference types="cypress" />
const config = require('../../../config');
const formNavigationMenuPage = require('../../../page-objects/menu/menuPage');

describe('Form Navigation Menu', () => {

    beforeEach(() => {
        // Navegar a la página que contiene el sidebar
        cy.visit(config.uiUrl + '/publish/music');
    });

    it('should navigate to music form when clicking on Music button', () => {
        formNavigationMenuPage.clickMusicButton();
        cy.url().should('include', '/publish/music');
    });

    it('should navigate to publication form when clicking on Publication button', () => {
        formNavigationMenuPage.clickPublicationButton();
        cy.url().should('include', '/publish/publication');
    });

    it('should navigate to event form when clicking on Event button', () => {
        formNavigationMenuPage.clickEventButton();
        cy.url().should('include', '/publish/event');
    });

    it('should have correct button labels', () => {
        formNavigationMenuPage.elements.musicButton().should('contain.text', 'Música');
        formNavigationMenuPage.elements.publicationButton().should('contain.text', 'Publicaciones');
        formNavigationMenuPage.elements.eventButton().should('contain.text', 'Eventos');
    });
});
