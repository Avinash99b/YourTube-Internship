import React from 'react';
import { useRouter } from 'next/router';
import VideoCall from '../../components/VideoCall';

const CallPage: React.FC = () => {
  const router = useRouter();
  const { friendId } = router.query;

  // Optionally, you can pass friendId as a prop to VideoCall for future enhancements
  return (
    <div>
      <h1>Call with {friendId}</h1>
      <VideoCall />
    </div>
  );
};

export default CallPage;

