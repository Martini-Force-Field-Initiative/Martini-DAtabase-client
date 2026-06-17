import { debugLog } from "./logger";
import { io, Socket } from "socket.io-client";

/*
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
export const socket = io(URL);
*/

// Connection timeout (ms) handed to socket.io-client. Raised well above the
// 20s default so slow back-end namespaces don't drop the connection.
const SOCKET_TIMEOUT_MS = 60000;

const clientNamespaces = [
  "MembraneBuilder",
  "Martinize",
  "PolymerGenerator",
  "History",
] as const;
type ClientNamespaces = (typeof clientNamespaces)[number];
const isClientNamepaces = (value: string): value is ClientNamespaces => {
  return clientNamespaces.includes(value as any);
};

/**
 *
 * @param namespace a valid SocketController declared on back-end side
 * @returns The namespace-scoped socket.io Socket object
 */
export const getSocket = (namespace: string): Socket => {
  //console.error("SOCKET::getSocket: " + namespace);
  //debugLog("==>" + SERVER_ROOT);
  if (!isClientNamepaces(namespace))
    throw new Error(`[Socket:getSocket] unknown namespace "${namespace}"`);
  //const endPoint=`${SERVER_ROOT}/${namespace}`
  //  debugLog(`Low-Layer socket namespace created @${namespace}`);
  const socketClient = io(`/${namespace}`, { timeout: SOCKET_TIMEOUT_MS });

  //socketClient.on( "connect", ()=> debugLog(`Low-Layer socket namespace created under @${namespace}`) );
  return socketClient;
};

export { Socket };

/**
 * A socket.io-client Socket wrapper to unwrap incoming error messages NOT TRIED YET
 */

export const getMadSocket = (namespace: string): MAD_ClientSocket => {
  //debugLog("==>" + SERVER_ROOT);

  return new MAD_ClientSocket(getSocket(namespace));
};

export class MAD_ClientSocket {
  constructor(private socket: Socket) {
    //console.error("Creating a MAD SOCKET");
  }

  on(evt: string, callback: Function, err?: (e: any) => any) {
    this.socket.on(evt, (data?: any) => {
      if (typeof data === "object")
        if (data?.type === "error") {
          /*
                    console.error("[MAD socket errorZ] " + data);
                    debugLog(err);
                    debugLog(err !== undefined);
                    */
          if (err !== undefined) {
            //    console.warn('OK');
            console.warn("Error Socket wrapper");
            console.warn(typeof data.content);
            console.warn(data.content);
            err(data.content);
          } else {
            //  console.warn('FAILED');
            throw new SocketErrorMessage(data?.content);
          }
        }
      callback(data);
    });
  }

  emit(evt: string, data?: any) {
    debugLog("[MAD_ClientSocket::emit]" + evt);
    this.socket.emit(evt, data);
  }
  /* expecting answer on the same message name use to emit*/
  request(evt: string, data?: any): Promise<any> {
    this.socket.off(evt);
    this.socket.emit(evt, data);

    return new Promise((res, rej) => {
      this.on(
        evt,
        (dataAns?: any) => res(dataAns),
        (e: any) => {
          console.warn("I should reject this");
          console.warn(e);
          rej(e);
        },
      );
    });
  }
}

export class SocketErrorMessage extends Error {}
