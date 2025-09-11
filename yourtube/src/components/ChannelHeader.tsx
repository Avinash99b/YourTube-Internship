import React, { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-24 xs:h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden"></div>

      {/* Channel Info */}
      <div className="px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-start md:items-center">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32">
            <AvatarFallback className="text-lg sm:text-2xl md:text-4xl">
              {channel?.channelname[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1 sm:space-y-2 md:space-y-3">
            <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-black dark:text-white">
              {channel?.channelname}
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
              <span>@{channel?.channelname.toLowerCase().replace(/\s+/g, "")}</span>
            </div>
            {channel?.description && (
              <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-400 max-w-2xl">
                {channel?.description}
              </p>
            )}
          </div>

          {user && user?._id !== channel?._id && (
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={() => setIsSubscribed(!isSubscribed)}
                variant={isSubscribed ? "outline" : "default"}
                className={
                  isSubscribed
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg"
                    : "bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg"
                }
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
