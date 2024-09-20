const { By, until } = require('selenium-webdriver');

class PublishPublicationFormPage {
  constructor(driver) {
    this.driver = driver;
    this.elements = {
      // Selector actualizado para el título, basado en el id="eventTitle"
      titleInput: By.css('input#eventTitle'),
      // Selector actualizado para la descripción, basado en el id="descriptionTextField"
      descriptionInput: By.css('textarea#descriptionTextField'),
      postButton: By.css('button[type="submit"]'),
      snackbar: By.css('.MuiSnackbar-root'),
      alertMessage: By.css('.MuiAlert-message'),
    };
  }

  // Hacer clic en el botón de publicar
  async clickPostButton() {
    const postButton = await this.driver.findElement(this.elements.postButton);
    await this.driver.wait(until.elementIsVisible(postButton), 5000);
    await postButton.click();
  }

  // Llenar el formulario de publicación
  async fillPublicationForm({ title, description }) {
    const titleInput = await this.driver.findElement(this.elements.titleInput);
    const descriptionInput = await this.driver.findElement(this.elements.descriptionInput);

    await this.driver.wait(until.elementIsVisible(titleInput), 5000);
    await titleInput.clear();  // Limpiar el campo antes de ingresar texto
    await titleInput.sendKeys(title);

    await this.driver.wait(until.elementIsVisible(descriptionInput), 5000);
    await descriptionInput.clear();  // Limpiar el campo antes de ingresar texto
    await descriptionInput.sendKeys(description);
  }

  // Enviar el formulario
  async submitForm() {
    await this.clickPostButton();
  }

  // Verificar si el snackbar está visible y contiene el mensaje esperado
  async verifySnackbar(expectedMessage) {
    const snackbarElement = await this.driver.wait(until.elementLocated(this.elements.snackbar), 10000);
    const alertMessage = await this.driver.findElement(this.elements.alertMessage);
    const text = await alertMessage.getText();
    return text.includes(expectedMessage);
  }
}

module.exports = PublishPublicationFormPage;
