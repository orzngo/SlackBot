// botの発言機能を提供するくらいあんと

interface IBotSayClient {
  say(message:string, channel:string): void;
  debug(message:string): void;
}

export=IBotSayClient;
