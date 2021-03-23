/*
node index.js --username davi_reis --room chat01 --hostUrl localhost
*/

import Events from "events";
import CliConfig from "./src/cliConfig.js";
import SocketClient from "./src/socket.js";
import TerminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv;
const config = CliConfig.paseArguments(commands);

const componentEmitter = new Events();

const socketClient = new SocketClient(config);
await socketClient.initialize();

// const controller = new TerminalController();
// await controller.initializeTable(componentEmitter);
