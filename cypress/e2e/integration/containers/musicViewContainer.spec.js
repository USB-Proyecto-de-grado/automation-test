/// <reference types="cypress" />

const musicViewContainerPage = require('../../../../page-objects/viewPublications/musicViewContainerPage');
const publishMusicFormPage = require('../../../../page-objects/publishPages/publishMusicFormPage');
const config = require('../../../../config');

describe('Music View Container', () => {
  beforeEach(() => {
    cy.visit(config.uiUrl + '/publish/music');
  });

  it('should display the correct music details', () => {
    publishMusicFormPage.fillMusicForm({
      youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      description: 'Classic hit by Rick Astley.',
    });

    publishMusicFormPage.submitForm();

    cy.visit(config.uiUrl + '/view_music');
    const music = {
      title: 'Never Gonna Give You Up',
      description: 'Classic hit by Rick Astley.',
      publicationDate: '2020-12-03',
      youTubeLink: 'dQw4w9WgXcQ',
    };

    musicViewContainerPage.verifyMusicDetails({
      title: music.title,
      description: music.description,
      publicationDate: `Publicado en: ${music.publicationDate}`,
    });
  });
});
