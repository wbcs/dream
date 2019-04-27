const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const DNS_SERVER = '192.168.2.1';

const parseDomain = buffer => {
  const message = buffer.slice(12);
  let offset = 1;
  let domain = '';
  let num = message[0];
  while(num) {
    domain += message.slice(offset, offset + num).toString();
    offset += num;
    num = message[offset];
    offset += 1;
    if (num) domain += '.';
  }
  return domain;
}

const forward = (message, remoteInfo) => {
  const client = dgram.createSocket('udp4');
  client.on('error', err => {
    console.log('DNS client err:', err.stack);
  });
  client.on('message', (data, rinfo) => {
    server.send(data, remoteInfo.port, remoteInfo.address, err => {
      if (!err) return;
      console.log('DNS server send err:', err.stack);
    });
  });
  client.send(message, 53, DNS_SERVER, err => {
    if (!err) return;
    console.log('DNS client send err:', err.stack);
  });
};

server.on('listening', () => {
  const {
    address, port
  } = server.address();
  console.log(`DNS Server listening on ${address}:${port}`);
});

server.on('error', err => {
  console.log('server err:', err.stack);
  server.close();
});

server.on('message', (message, remoteInfo) => {
  console.log(parseDomain(message));
  forward(message, remoteInfo);
});

server.bind(53);