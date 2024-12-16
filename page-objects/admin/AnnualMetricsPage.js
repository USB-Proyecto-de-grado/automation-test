const { By, until, Key } = require('selenium-webdriver');

class AnnualMetricsPage {
  constructor(driver) {
    this.driver = driver;
    this.elements = {
       // Year input field
       yearInput: By.css('input[placeholder="YYYY"]'),

       // Calendar button
       calendarButton: By.css('button[aria-label^="Choose date"]'),
 
       // Year picker dialog
       yearPickerDialog: By.css('div[role="dialog"]'),
 
       // Dynamic year button (for specific year selection)
       yearButton: (year) => By.xpath(`//button[text()="${year}"]`),

      // Export button
      exportButton: By.xpath("//button[contains(text(), 'Exportar')]"),

      // Search input in the data grid
      searchInput: By.css('input[placeholder="Buscar…"]'),

      // Data grid elements
      emailCell: By.css('[data-field="user_email"]'),
      totalEventsCell: By.css('[data-field="totalevents"]'),
      totalPublicationsCell: By.css('[data-field="totalpublications"]'),
      totalMusicsCell: By.css('[data-field="totalmusics"]'),
      totalCell: By.css('[data-field="total"]'),

      // Bar chart and pie chart
      barChart: By.css('svg.css-1evyvmv-MuiChartsSurface-root'),
      pieChart: By.css('.MuiChartsSurface-root:last-of-type'),
    };
  }

  async setYear(year) {
    const yearInput = await this.driver.findElement(this.elements.yearInput);
    await yearInput.clear();
    await yearInput.sendKeys(year);
  }

  async openYearPicker() {
    const calendarButton = await this.driver.findElement(this.elements.calendarButton);
    await calendarButton.click();
    await this.driver.wait(
      until.elementLocated(this.elements.yearPickerDialog),
      5000,
      'Year picker dialog did not appear'
    );
  }

  async selectYear(year) {
    const yearButton = await this.driver.findElement(this.elements.yearButton(year));
    await yearButton.click();
    await this.driver.wait(
      until.stalenessOf(await this.driver.findElement(this.elements.yearPickerDialog)),
      5000,
      'Year picker dialog did not close after selection'
    );
  }

  async getYearInputValue() {
    const yearInput = await this.driver.findElement(this.elements.yearInput);
    return yearInput.getAttribute('value');
  }

  async clickExportButton() {
    const exportButton = await this.driver.findElement(this.elements.exportButton);
    await exportButton.click();
  }

  async searchInGrid(query) {
    const searchInput = await this.driver.findElement(this.elements.searchInput);
    await searchInput.clear();
    await searchInput.sendKeys(query);
  }

  async getEmailText() {
    const emailCell = await this.driver.findElement(this.elements.emailCell);
    return emailCell.getText();
  }

  async getTotalEventsText() {
    const totalEventsCell = await this.driver.findElement(this.elements.totalEventsCell);
    return totalEventsCell.getText();
  }

  async getTotalPublicationsText() {
    const totalPublicationsCell = await this.driver.findElement(this.elements.totalPublicationsCell);
    return totalPublicationsCell.getText();
  }

  async getTotalMusicsText() {
    const totalMusicsCell = await this.driver.findElement(this.elements.totalMusicsCell);
    return totalMusicsCell.getText();
  }

  async getTotalText() {
    const totalCell = await this.driver.findElement(this.elements.totalCell);
    return totalCell.getText();
  }

  async isBarChartDisplayed() {
    const barChartLocator = this.elements.barChart;
    await this.driver.wait(until.elementLocated(barChartLocator), 10000, 'Bar chart not located within 10 seconds');
    const barChart = await this.driver.findElement(barChartLocator);
    return barChart.isDisplayed();
  }
  
  async isPieChartDisplayed() {
    const pieChart = await this.driver.findElement(this.elements.pieChart);
    return pieChart.isDisplayed();
  }

  async getYearMetricElement(year) {
    return this.driver.findElement(By.css(`[data-year="${year}"]`)); // Update selector to match the actual element
  }
  
  async hoverOverElement(element) {
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: element }).perform();
  }
  
  async getElementColor(element) {
    return await element.getCssValue('color');
  }
  
}

module.exports = AnnualMetricsPage;
