process.on("uncaughtException", Function());

const { createServer } = require("net");

let servers = [];

createServer((socket) => {
  socket.once("data", data => {
    const [head, url] = data.toString().split("/");
    if(head == "connect") {
      console.log("new connection " + url);
      const server = {
        url,
        fetch() {
          return new Promise((resolve) => {
            socket.write("fetch");
            this.resolve = resolve;
          });
        }
      }
      servers.push(server);
      socket.on("close", () => {
        console.log(url + " disconnected");
        servers = servers.filter(s => s != server);
      });
      return;
    }
    if(head == "resolve") {
      servers.find((server) => server.url = url)?.resolve?.(socket);
      return;
    }
    servers.forEach(server => {
      if(data.toString().match(server.url)) {
        console.log("new player joining " + server.url);
        server.fetch().then(server => {
          server.write(data);
          socket.pipe(server);
          server.pipe(socket);
        })
      }
    })
  });
}).listen(25565, () => console.log("server is online"));
