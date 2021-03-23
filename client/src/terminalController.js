import ComponentsBuilder from "./components.js";
import { constants } from "./constants.js";

export default class TerminalController {
  #usersColors = new Map();
  constructor() {}

  #pickColor() {
    return `#${(((1 << 24) * Math.random()) | 0).toString(16)}-fg`;
  }

  #getUserColor(userName) {
    if (this.#usersColors.has(userName)) return this.#usersColors.get(userName);

    const color = this.#pickColor();
    this.#usersColors.set(userName, color);

    return color;
  }

  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    };
  }

  #onMessageReceived({ screen, chat }) {
    return (msg) => {
      const { userName, message } = msg;
      const color = this.#getUserColor(userName);

      chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`);

      screen.render();
    };
  }

  #onLogChanged({ screen, activityLog }) {
    return (msg) => {
      const [userName] = msg.split(/\s/);
      const color = this.#getUserColor(userName);

      activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`);

      screen.render();
    };
  }

  #onStatusChanged({ screen, status }) {
    return (users) => {
      const { content } = status.items.shift();

      status.clearItems();
      status.addItem(content);

      users.forEach((userName) => {
        const color = this.#getUserColor(userName);
        status.addItem(`{${color}}{bold}${userName}{/}`);
      });

      screen.render();
    };
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(
      constants.events.app.MESSAGE_RECEIVED,
      this.#onMessageReceived(components)
    );
    eventEmitter.on(
      constants.events.app.ACTIVITY_UPDATE,
      this.#onLogChanged(components)
    );
    eventEmitter.on(
      constants.events.app.STATUS_UPDATED,
      this.#onStatusChanged(components)
    );
  }

  async initializeTable(eventEmitter) {
    const components = new ComponentsBuilder()
      .setScreen({
        title: "TerminalChat - Davi Reis",
      })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build();

    this.#registerEvents(eventEmitter, components);

    components.input.focus();
    components.screen.render();

    setInterval(() => {
      const users = ["davi_reis"];
      eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
      eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
        message: "Hello Terminal!",
        userName: "davi_reis",
      });
      eventEmitter.emit(constants.events.app.ACTIVITY_UPDATE, "davi_reis join");
      users.push("tayna_mineiro", "davizinho_kings");
      eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
      eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
        message: "Hello WhatsApp!",
        userName: "tayna_mineiro",
      });
      eventEmitter.emit(
        constants.events.app.ACTIVITY_UPDATE,
        "tayna_mineiro left"
      );
      users.push("olokinho_silva", "joao_silvaa");
      eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);

      eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
        message: "Hello People!",
        userName: "olokinho_silva",
      });
      eventEmitter.emit(
        constants.events.app.ACTIVITY_UPDATE,
        "olokinho_silva left"
      );
    }, 1000);
  }
}
