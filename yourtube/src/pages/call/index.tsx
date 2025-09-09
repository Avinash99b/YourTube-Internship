import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Import VideoCall only on the client
const VideoCall = dynamic(() => import("../../components/VideoCall"), {
    ssr: false,
});

const CallPage: React.FC = () => {
    const router = useRouter();
    const { friendId } = router.query;

    return (
        <div>
            <h1>Call with {friendId}</h1>
            <VideoCall />
        </div>
    );
};

export default CallPage;
