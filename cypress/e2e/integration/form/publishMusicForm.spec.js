/// <reference types="cypress" />

const publishMusicFormPage = require('../../../../page-objects/publishPages/publishMusicFormPage');
const alertSnackBarPage = require('../../../../page-objects/alertSnackBarPage');
const config = require('../../../../config');

describe('Publish Music Form', () => {
  beforeEach(() => {
    cy.visit(config.uiUrl + '/publish/music');
  });

  it('should fill the form and submit successfully', () => {
    cy.wait(5000);

    publishMusicFormPage.fillMusicForm({
      youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      description: 'Classic hit by Rick Astley.',
    });

    publishMusicFormPage.submitForm();
  });

  it('should show validation errors when fields are empty', () => {
    cy.wait(5000); 

    publishMusicFormPage.submitForm();

    alertSnackBarPage.verifySnackbarMessage('Parámetros no válidos en la aplicación');

    // publishMusicFormPage.elements.youTubeLinkInput().should('have.class', 'Mui-error');
    // publishMusicFormPage.elements.titleInput().should('have.class', 'Mui-error');
    // publishMusicFormPage.elements.descriptionInput().should('have.class', 'Mui-error');
  });

  it('should display the YouTube player when a valid link is provided', () => {
    cy.wait(5000); 

    publishMusicFormPage.fillMusicForm({
      youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      description: 'Classic hit by Rick Astley.',
    });

    publishMusicFormPage.verifyYouTubePlayerVisible();
  });
});
