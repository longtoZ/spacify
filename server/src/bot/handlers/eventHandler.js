import { ping } from "../commands/ping.js"
import { ready } from "../commands/ready.js"

export const eventHandler = (client) => {
    client.on('ready', ready)
    client.on('messageCreate', ping)
}