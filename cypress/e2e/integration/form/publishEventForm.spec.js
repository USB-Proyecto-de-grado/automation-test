/// <reference types="cypress" />

const publishEventFormPage = require('../../../../page-objects/publishPages/publishEventFormPage');
const config = require('../../../../config');

describe('Publish Event Form', () => {
  beforeEach(() => {
    cy.visit(config.uiUrl + '/publish/event');
  });

  it('should fill the form and submit successfully', () => {
    publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '2024-08-12',
      ubication: 'Aula Magna de Humanidades',
      price: '100',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    publishEventFormPage.submitForm();

    publishEventFormPage.verifySnackbar(200);
  });

  it('should show validation errors when fields are empty', () => {
    publishEventFormPage.submitForm();

    publishEventFormPage.elements.titleInput().should('have.class', 'Mui-error');
    publishEventFormPage.elements.datePicker().should('have.class', 'Mui-error');
    publishEventFormPage.elements.ubicationInput().should('have.class', 'Mui-error');
    publishEventFormPage.elements.priceInput().should('have.class', 'Mui-error');
    publishEventFormPage.elements.descriptionInput().should('have.class', 'Mui-error');
  });
});
