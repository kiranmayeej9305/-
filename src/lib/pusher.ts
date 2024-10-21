// lib/pusher.ts

import PusherClient from 'pusher-js';
import PusherServer from 'pusher';

// Singleton for PusherServer
class PusherServerSingleton {
  private static instance: PusherServer | null = null;

  private constructor() {}

  public static getInstance(): PusherServer {
    if (!PusherServerSingleton.instance) {
      console.log('Creating new PusherServer instance');
      PusherServerSingleton.instance = new PusherServer({
        appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID as string,
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
        secret: process.env.NEXT_PUBLIC_PUSHER_APP_SECRET as string,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER as string,
        useTLS: true,
      });
    }
    return PusherServerSingleton.instance;
  }
}

// Singleton for PusherClient
class PusherClientSingleton {
  private static instance: PusherClient | null = null;

  private constructor() {}

  public static getInstance(): PusherClient {
    if (!PusherClientSingleton.instance) {
      console.log('Creating new PusherClient instance');
      PusherClientSingleton.instance = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER as string,
        }
      );
    }
    return PusherClientSingleton.instance;
  }
}

export const pusherServer = PusherServerSingleton.getInstance();
export const pusherClient = PusherClientSingleton.getInstance();
