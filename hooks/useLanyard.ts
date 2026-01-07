"use client";

import { useEffect, useRef, useState } from "react";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  display_name?: string;
  global_name?: string;
  avatar_decoration_data?: { asset?: string };
}

interface SpotifyData {
  song: string;
  artist: string;
  album?: string;
  album_art_url: string;
  timestamps: { start: number; end: number };
}

interface LanyardState {
  discord: DiscordUser | null;
  spotify: SpotifyData | null;
  discordStatus: string;
}

export function useLanyard(userId: string) {
  const [state, setState] = useState<LanyardState>({
    discord: null,
    spotify: null,
    discordStatus: "offline",
  });

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket("wss://api.lanyard.rest/socket");
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.op) {
          // hello from lanyard
          case 1: {
            const interval = msg.d.heartbeat_interval;
            heartbeatRef.current = setInterval(() => {
              ws.send(JSON.stringify({ op: 3 }));
            }, interval);

            ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
            break;
          }

          // prescence update
          case 0: {
            const data = msg.d;
            setState({
              discord: data.discord_user ?? null,
              spotify: data.spotify ?? null,
              discordStatus: data.discord_status ?? "offline",
            });
            break;
          }
        }
      };

      ws.onclose = () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        // reconnect after 5s
        setTimeout(connect, 5000);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      wsRef.current?.close();
    };
  }, [userId]);

  return state;
}
