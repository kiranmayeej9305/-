import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTopics } from '@/lib/queries'; // Adjust the import path as needed

interface Topic {
  id: number;
  name: string;
}

const Topics = ({ maxTopics = 5 }: { maxTopics?: number }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsData = await getTopics(maxTopics);
        setTopics(topicsData); // Set the topics data from the database
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, [maxTopics]);

  const handleTopicClick = (topicName: string) => {
    router.push(`/blog/topics/${topicName}`);
  };

  return (
    <div>
      <h4 className="text-lg font-bold leading-snug tracking-tight mb-4">Topics</h4>
      <ul className="-my-2">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className="flex py-2 border-b border-gray-200"
            onClick={() => handleTopicClick(topic.name)}
          >
            <svg
              className="w-4 h-4 shrink-0 fill-current text-gray-400 mt-1 mr-3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.99 15h2.02l.429-3h3.979l-.428 3h2.02l.429-3H14v-2h-2.275l.575-4H15V4h-2.418l.428-3h-2.02l-.429 3H6.582l.428-3H4.99l-.429 3H2v2h2.275L3.7 10H1v2h2.418l-.428 3zM6.3 6h3.979L9.7 10H5.725L6.3 6z" />
            </svg>
            <div className="font-medium mb-1">
              <a className="hover:underline cursor-pointer">{topic.name}</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Topics;
