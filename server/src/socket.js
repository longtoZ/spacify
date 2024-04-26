import { Server } from 'socket.io';

export default function createSocketServer(expressServer, allowedOrigins) {
    const io = new Server(expressServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
        reconnection: false,
    });

    io.on('connection', (socket) => {
        // Handle incoming connections from clients
        console.log('New client connected');

        // socket.on("download_receiver", (data) => {
        //   console.log("id is", data.socket_id)

        //   //     io.to(data.socket_id).emit("downloaded_chunk", {
        //   //         percentage: "Downloaded chunk"
        //   //       });

        // });
    });

    return io;
}
