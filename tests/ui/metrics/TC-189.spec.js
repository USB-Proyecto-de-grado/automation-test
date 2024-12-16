const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const {
  createTestUser: createEventUser,
  deleteTestUser: deleteEventUser,
  createEventEntries,
  deleteEventEntries,
  createTestUbication,
  deleteTestUbication,
} = require('../../hooks/event/eventHooks');
const {
  createTestUser: createMusicUser,
  deleteTestUser: deleteMusicUser,
  createMusicEntriesByDate,
  deleteMusicEntries,
} = require('../../hooks/music/musicHooks');
const {
  createTestUser: createPublicationUser,
  deleteTestUser: deletePublicationUser,
  createMiscPublicationEntries,
  deleteMiscPublicationEntries,
} = require('../../hooks/miscPublicationController/miscPublicationHooks');

describe('Annual Metrics Verification for Events, Music, and Publications [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    // Create users and data for each class
    await createEventUser(); // Create user for Events
    await createTestUbication(); // Create a test location for Events
    await createEventEntries(1); // Create one "Event" entry

    await createMusicUser(); // Create user for Music
    await createMusicEntriesByDate(1, '2024-12-15'); // Create one "Music" entry

    await createPublicationUser(); // Create user for Publications
    await createMiscPublicationEntries(1); // Create one "Publication" entry
  });

  after(async () => {
    // Clear data for each class
    await deleteEventEntries(); // Clear "Event" data
    await deleteTestUbication(); // Delete the location created for Events
    await deleteEventUser(); // Delete the Event user

    await deleteMusicEntries(); // Clear "Music" data
    await deleteMusicUser(); // Delete the Music user

    await deleteMiscPublicationEntries(); // Clear "Publication" data
    await deletePublicationUser(); // Delete the Publication user
  });

  // GUI Setup
  beforeEach(async function () {
    driver = buildDriver();
    annualMetricsPage = new AnnualMetricsPage(driver);

    await driver.get(config.uiUrl + '/admin');
    await driver.wait(async () => {
      const readyState = await driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000, 'The Annual Metrics page did not load correctly');
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
      addContext(this, {
        title: 'Screenshot',
        value: screenshotPath,
      });
    }
    await driver.quit();
  });

  it('TC-189: Verify Events, Music, and Publications for December appear in charts [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(7000);

    // Verify the bar for "Events"
    const eventBar = await driver.findElement(
        By.css('.MuiBarElement-series-Eventoid')
      );
      const eventBarColor = await eventBar.getCssValue('fill');
      const expectedTealColor = 'rgb(2, 178, 175)'; // Teal color for events
      assert.strictEqual(eventBarColor, expectedTealColor, 'The bar for "Events" is not teal');
  
      // Verify the bar for "Music"
      const musicBar = await driver.findElement(
        By.css('.MuiBarElement-series-Músicasid')
      );
      const musicBarColor = await musicBar.getCssValue('fill');
      const expectedBlueColor = 'rgb(46, 150, 255)'; // Blue color for music
      assert.strictEqual(musicBarColor, expectedBlueColor, 'The bar for "Music" is not blue');
  
      // Verify the bar for "Publications"
      const publicationBar = await driver.findElement(
        By.css('.MuiBarElement-series-Publicacionesid')
      );
      const publicationBarColor = await publicationBar.getCssValue('fill');
      const expectedPurpleColor = 'rgb(184, 0, 216)'; // Purple color for publications
      assert.strictEqual(publicationBarColor, expectedPurpleColor, 'The bar for "Publications" is not purple');
  
      // Verify pie chart segments and labels for "Events", "Music", and "Publications"
      const pieSegments = [
        { color: expectedTealColor, label: 'Eventos', count: '1' },
        { color: expectedBlueColor, label: 'Músicas', count: '1' },
        { color: expectedPurpleColor, label: 'Publicaciones', count: '1' },
      ];
  
      for (const segment of pieSegments) {
        const pieSegment = await driver.findElement(
          By.css(`.MuiPieArc-root[style*="fill: ${segment.color};"]`)
        );
        const segmentVisibility = await pieSegment.getAttribute('visibility');
        assert.strictEqual(segmentVisibility, 'visible', `The pie chart segment for "${segment.label}" is not visible`);
  
        // Adjusted Selector for Pie Chart Labels
        const pieLabel = await driver.findElement(
          By.xpath(`//*[name()='text' and contains(text(), "${segment.count}")]`)
        );
        const pieLabelText = await pieLabel.getText();
        assert.strictEqual(
          pieLabelText,
          segment.count,
          `The pie chart label for "${segment.label}" does not display the correct count`
        );
      }
    });
  });