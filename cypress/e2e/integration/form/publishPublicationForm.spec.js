/// <reference types="cypress" />
const publishPublicationFormPage = require('../../../../page-objects/publishPages/publishPublicationFormPage');
const config = require('../../../../config');

describe('Publish Publication Form', () => {
  beforeEach(() => {
    cy.visit(config.uiUrl + '/publish/publication');
  });

  it('should click the button, fill the form, and submit successfully with status 201', () => {
    cy.intercept('POST', '/api/publications', {
      statusCode: 201,
    }).as('postPublication');

    publishPublicationFormPage.clickPostButton();

    publishPublicationFormPage.fillPublicationForm({
      title: 'Veladas de invierno - UMSS',
      description: 'Ven y disfruta de este magnífico evento preparados con mucho cariño para todos.',
    });

    publishPublicationFormPage.submitForm();

    publishPublicationFormPage.verifySnackbarMessage('Publicado de manera exitosa');
  });

  it('should click the button and display error message on status 400 for invalid parameters', () => {
    cy.intercept('POST', '/api/publications', {
      statusCode: 400,
    }).as('postPublication');

    publishPublicationFormPage.clickPostButton();

    publishPublicationFormPage.verifySnackbarMessage('Parámetros no válidos en la aplicación');
  });

  it('should click the button and display error message on status 422 for incorrect parameters', () => {
    cy.intercept('POST', '/api/publications', {
      statusCode: 422,
    }).as('postPublication');

    publishPublicationFormPage.clickPostButton();

    publishPublicationFormPage.fillPublicationForm({
      title: ' ',
      description: ' ',
    });

    publishPublicationFormPage.submitForm();

    publishPublicationFormPage.verifySnackbarMessage('Parámetros incorrectos');
  });
});