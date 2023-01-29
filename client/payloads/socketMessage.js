
class SocketMessage {
  type;
  content;
  constructor(_type, _content) {
    this.type = _type;
    this.content = _content;
  }
}

module.exports = SocketMessage;