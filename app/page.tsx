"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Background from "../components/Background";
import TerminalBtn from "../components/Terminal-btn";
import { useLanyard } from "../hooks/useLanyard";

const STATUS_ICON: Record<string, string> = {
  online: "/status/online.png",
  idle: "/status/idle.png",
  dnd: "/status/dnd.png",
  offline: "/status/offline.png",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Image
      src={STATUS_ICON[status] ?? STATUS_ICON.offline}
      alt={status}
      width={18}
      height={18}
      className="absolute bottom-0 right-0 rounded-full -translate-x-5 -translate-y-7 border-2 border-black
                 drop-shadow-[0_0_2px_rgba(0,0,0,0.7)] z-40"
      priority
    />
  );
}

export default function Home() {
  const DISCORD_USER_ID = "853758524114993183";
  const { discord, spotify, discordStatus } = useLanyard(DISCORD_USER_ID);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const getElapsed = () =>
    spotify ? Math.max(0, now - spotify.timestamps.start) : 0;

  const getDuration = () =>
    spotify ? spotify.timestamps.end - spotify.timestamps.start : 1;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <Background />

      <div className="w-full max-w-md">
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden relative">
          <div className="h-32 bg-linear-to-r from-gray-600 to-black-600" />
          <TerminalBtn />

          <div className="p-8 bg-black flex flex-col gap-8">
            {/* profile section */}
            <div className="flex items-start -mt-20">
              <div className="flex flex-col">
                {discord && (
                  <div className="relative w-25 h-26">
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`}
                      alt="avatar"
                      width={80}
                      height={80}
                      className="rounded-full z-10"
                    />

                    {discord.avatar_decoration_data?.asset && (
                      <Image
                        src={`https://cdn.discordapp.com/avatar-decoration-presets/${discord.avatar_decoration_data.asset}.png`}
                        alt="decoration"
                        width={160}
                        height={160}
                        unoptimized
                        className="absolute top-1/2 left-1/2 -translate-x-[61%] -translate-y-[60%]"
                      />
                    )}

                    <StatusBadge status={discordStatus} />
                  </div>
                )}

                <h3 className="mt-2 font-semibold text-xl">
                  {discord?.display_name ||
                    discord?.global_name ||
                    discord?.username}
                </h3>
                <p className="text-gray-400 text-sm">@{discord?.username}</p>
              </div>
            </div>

            {/* spotify section */}
            {spotify && spotify.song && (
              <>
                <div className="border-t border-zinc-800/50" />

                <div className="flex gap-4 items-center">
                  <Image
                    src={spotify.album_art_url}
                    alt="album"
                    width={60}
                    height={60}
                    className="rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{spotify.song}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {spotify.artist}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {spotify.album}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-10">
                        {`${Math.floor(getElapsed() / 60000)}:${String(
                          Math.floor((getElapsed() % 60000) / 1000)
                        ).padStart(2, "0")}`}
                      </span>

                      <div className="flex-1 bg-zinc-700 h-1 rounded-full">
                        <div
                          className="bg-green-500 h-1 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (getElapsed() / getDuration()) * 100
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs text-gray-400 w-12 text-right">
                        -{Math.floor((getDuration() - getElapsed()) / 60000)}:
                        {String(
                          Math.floor(
                            ((getDuration() - getElapsed()) % 60000) / 1000
                          )
                        ).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
